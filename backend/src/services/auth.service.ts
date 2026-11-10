import crypto from 'crypto';
import { env } from '@/config/env';
import { userRepository } from '@/repositories/user.repository';
import { toPublicUser } from '@/models/user.model';
import { comparePassword, hashPassword } from '@/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { passwordResetEmail, sendMail } from '@/utils/mailer';
import { AppError } from '@/utils/AppError';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/dtos/auth.dto';

// Hash (sha256) de tokens antes de salvar no banco: mesmo se o banco vazar,
// ninguém consegue usar esses valores como sessão ativa ou link de reset.
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const REFRESH_TOKEN_TTL_DAYS = 7;
const RESET_TOKEN_TTL_MINUTES = 30;

type Role = 'LISTENER' | 'ARTIST' | 'ADMIN';

async function issueTokenPair(userId: string, role: Role) {
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
    return { user: toPublicUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    // Mensagem genérica de propósito: não revelamos se o erro foi
    // "e-mail não existe" ou "senha errada" (evita enumeração de contas).
    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw AppError.unauthorized('E-mail ou senha inválidos');
    }

    const tokens = await issueTokenPair(user.id, user.role);
    return { user: toPublicUser(user), ...tokens };
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

    // A role vem SEMPRE do banco (não do token antigo): se o usuário virou
    // artista ou perdeu um privilégio, o novo par de tokens já reflete isso.
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw AppError.unauthorized('Usuário não encontrado');
    }

    // Rotação: revoga o token antigo e emite um par novo.
    await userRepository.revokeRefreshToken(hashToken(refreshToken));
    const tokens = await issueTokenPair(user.id, user.role);
    return { user: toPublicUser(user), ...tokens };
  },

  /** Emite uma sessão nova para um usuário já autenticado (ex: após virar artista). */
  async reissueSession(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado');
    const tokens = await issueTokenPair(user.id, user.role);
    return { user: toPublicUser(user), ...tokens };
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
    const expiry = new Date(Date.now() + 1000 * 60 * RESET_TOKEN_TTL_MINUTES);
    // Guardamos só o hash; o token "cru" existe apenas no e-mail enviado.
    await userRepository.setResetToken(user.id, hashToken(resetToken), expiry);

    const link = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const mail = passwordResetEmail(link);
    await sendMail(user.email, mail.subject, mail.html, mail.text);
  },

  async resetPassword(input: ResetPasswordInput) {
    const user = await userRepository.findByValidResetToken(hashToken(input.token));
    if (!user) {
      throw AppError.badRequest('Token inválido ou expirado');
    }

    const passwordHash = await hashPassword(input.password);
    await userRepository.updatePassword(user.id, passwordHash);
    // Trocou a senha => derruba todas as sessões abertas (cenário típico:
    // alguém que roubou a conta perde o acesso imediatamente).
    await userRepository.revokeAllRefreshTokens(user.id);
  },
};
