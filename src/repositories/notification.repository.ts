import { prisma } from "../config/db";
import { NotificationType } from "@prisma/client";

export const notificationRepository = {
  create(data: { userId: string; type: NotificationType; message: string; taskId?: string }) {
    return prisma.notification.create({ data });
  },
  list(userId: string, skip: number, take: number) {
    return prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
  },
  unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },
  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },
  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },
};
