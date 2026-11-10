import type { UserRole } from '@prisma/client';
import { prisma } from '@/config/database';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });
  },

  setResetToken(id: string, resetToken: string, resetTokenExpiry: Date) {
    return prisma.user.update({ where: { id }, data: { resetToken, resetTokenExpiry } });
  },

  findByValidResetToken(resetToken: string) {
    return prisma.user.findFirst({
      where: { resetToken, resetTokenExpiry: { gt: new Date() } },
    });
  },

  setRole(id: string, role: UserRole) {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  updateProfile(id: string, data: { name?: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  updateAvatar(id: string, avatarUrl: string) {
    return prisma.user.update({ where: { id }, data: { avatarUrl } });
  },

  // ---- Refresh tokens ----
  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
    });
  },

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  },

  revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  },

  /** Limpeza periódica: remove tokens expirados ou revogados há muito tempo. */
  deleteStaleRefreshTokens() {
    return prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] },
    });
  },
};
