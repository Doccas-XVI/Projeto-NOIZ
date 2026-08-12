import crypto from 'crypto';
import { userRepository } from '@/repositories/user.repository';
import { comparePassword, hashPassword } from '@/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { AppError } from '@/utils/AppError';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from '@/dtos/auth.dto';

// Hash simples (sha256) do refresh token antes de salvar no banco.
// Assim, mesmo se o banco for vazado, ninguém rouba sessões de usuários.
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const REFRESH_TOKEN_TTL_DAYS = 7;

async function issueTokenPair(userId: string, role: 'LISTENER' | 'ARTIST' | 'ADMIN') {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId, role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
  await userRepository.saveRefreshToken(userId, hashToken(refreshToken), expiresAt);

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('Este e-mail já está cadastrado');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const tokens = await issueTokenPair(user.id, user.role);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    // Mensagem genérica de propósito: não revelamos se o erro foi
    // "e-mail não existe" ou "senha errada" (evita enumeração de contas).
    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw AppError.unauthorized('E-mail ou senha inválidos');
    }

    const tokens = await issueTokenPair(user.id, user.role);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Refresh token inválido ou expirado');
    }

    const stored = await userRepository.findRefreshToken(hashToken(refreshToken));
    if (!stored) {
      throw AppError.unauthorized('Sessão inválida, faça login novamente');
    }

    // Rotação: revoga o token antigo e emite um par novo.
    await userRepository.revokeRefreshToken(hashToken(refreshToken));
    return issueTokenPair(payload.sub, payload.role);
  },

  async logout(refreshToken: string) {
    await userRepository.revokeRefreshToken(hashToken(refreshToken));
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);
    // Não lançamos erro se o usuário não existir — resposta idêntica
    // em ambos os casos, de novo para não permitir enumeração de e-mails.
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await userRepository.setResetToken(user.id, resetToken, expiry);

    // TODO (próxima etapa): integrar provedor de e-mail (Resend/SendGrid)
    // e enviar link `${CLIENT_URL}/reset-password?token=${resetToken}`.
    console.info(`[DEV] Link de reset para ${user.email}: token=${resetToken}`);
  },

  async resetPassword(input: ResetPasswordInput) {
    const user = await userRepository.findByValidResetToken(input.token);
    if (!user) {
      throw AppError.badRequest('Token inválido ou expirado');
    }

    const passwordHash = await hashPassword(input.password);
    await userRepository.updatePassword(user.id, passwordHash);
  },
};
