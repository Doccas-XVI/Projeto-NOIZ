import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@prisma/client';

// Os repositories são mockados: testamos a REGRA DE NEGÓCIO do service sem banco.
vi.mock('@/repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    saveRefreshToken: vi.fn(),
    findRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
    revokeAllRefreshTokens: vi.fn(),
    setResetToken: vi.fn(),
    findByValidResetToken: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

import { authService } from '@/services/auth.service';
import { userRepository } from '@/repositories/user.repository';
import { hashPassword } from '@/utils/hash';
import { AppError } from '@/utils/AppError';

const repo = vi.mocked(userRepository);

const fakeUser = async (overrides: Partial<User> = {}): Promise<User> => ({
  id: 'user-1',
  name: 'Docas',
  email: 'docas@noiz.app',
  passwordHash: await hashPassword('Senha123'),
  avatarUrl: null,
  role: 'LISTENER',
  isVerified: false,
  resetToken: null,
  resetTokenExpiry: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe('authService.register', () => {
  it('recusa e-mail já cadastrado (409)', async () => {
    repo.findByEmail.mockResolvedValue(await fakeUser());
    await expect(
      authService.register({ name: 'Docas', email: 'docas@noiz.app', password: 'Senha123' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('cria usuário, guarda hash da senha e não vaza dados sensíveis', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockImplementation((async (data: object) => ({
      ...(await fakeUser()),
      ...data,
    })) as never);

    const result = await authService.register({
      name: 'Docas',
      email: 'novo@noiz.app',
      password: 'Senha123',
    });

    const saved = repo.create.mock.calls[0][0];
    expect(saved.passwordHash).not.toBe('Senha123'); // nunca salva senha pura
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessToken).toBeTruthy();
    expect(repo.saveRefreshToken).toHaveBeenCalledOnce();
  });
});

describe('authService.login', () => {
  it('usa a MESMA mensagem para e-mail inexistente e senha errada (anti-enumeração)', async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    const noUser = await authService
      .login({ email: 'x@x.com', password: 'Senha123' })
      .catch((e) => e);

    repo.findByEmail.mockResolvedValueOnce(await fakeUser());
    const wrongPass = await authService
      .login({ email: 'docas@noiz.app', password: 'Errada123' })
      .catch((e) => e);

    expect(noUser).toBeInstanceOf(AppError);
    expect(noUser.statusCode).toBe(401);
    expect(wrongPass.message).toBe(noUser.message);
  });

  it('autentica com credenciais corretas', async () => {
    repo.findByEmail.mockResolvedValue(await fakeUser());
    const result = await authService.login({ email: 'docas@noiz.app', password: 'Senha123' });
    expect(result.user.email).toBe('docas@noiz.app');
    expect(result.refreshToken).toBeTruthy();
  });
});

describe('authService.refresh', () => {
  it('rejeita refresh token que não é válido', async () => {
    await expect(authService.refresh('token-invalido')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('faz rotação: revoga o token antigo e entrega um par novo com a role atual do banco', async () => {
    repo.findByEmail.mockResolvedValue(await fakeUser());
    repo.findRefreshToken.mockResolvedValue({ id: 'rt' } as never);
    const { refreshToken } = await authService.login({
      email: 'docas@noiz.app',
      password: 'Senha123',
    });

    // no meio do caminho o usuário virou ARTIST no banco
    repo.findById.mockResolvedValue(await fakeUser({ role: 'ARTIST' }));
    const renewed = await authService.refresh(refreshToken);

    expect(repo.revokeRefreshToken).toHaveBeenCalledOnce();
    expect(renewed.user.role).toBe('ARTIST');
    expect(renewed.refreshToken).not.toBe(refreshToken);
  });

  it('recusa token que já foi revogado', async () => {
    repo.findByEmail.mockResolvedValue(await fakeUser());
    const { refreshToken } = await authService.login({
      email: 'docas@noiz.app',
      password: 'Senha123',
    });

    repo.findRefreshToken.mockResolvedValue(null);
    await expect(authService.refresh(refreshToken)).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('authService.resetPassword', () => {
  it('troca a senha e derruba todas as sessões abertas', async () => {
    repo.findByValidResetToken.mockResolvedValue(await fakeUser());
    await authService.resetPassword({ token: 'abc', password: 'NovaSenha1' });

    expect(repo.updatePassword).toHaveBeenCalledOnce();
    expect(repo.revokeAllRefreshTokens).toHaveBeenCalledWith('user-1');
  });

  it('recusa token inválido ou expirado', async () => {
    repo.findByValidResetToken.mockResolvedValue(null);
    await expect(
      authService.resetPassword({ token: 'x', password: 'NovaSenha1' }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('só procura pelo HASH do token (o token cru nunca é consultado no banco)', async () => {
    repo.findByValidResetToken.mockResolvedValue(null);
    await authService
      .resetPassword({ token: 'token-cru', password: 'NovaSenha1' })
      .catch(() => undefined);
    expect(repo.findByValidResetToken.mock.calls[0][0]).not.toBe('token-cru');
  });
});
