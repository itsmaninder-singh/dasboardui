import { prisma } from "../config/db";

export const refreshTokenRepository = {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  },
  findByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },
  revoke(id: string, replacedByTokenHash?: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true, ...(replacedByTokenHash ? { replacedByTokenHash } : {}) },
    });
  },
  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
  },
};
