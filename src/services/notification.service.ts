import { notificationRepository } from "../repositories/notification.repository";
import { emitNotification, emitUnreadCount } from "../socket/events";
import { ApiError } from "../utils/ApiError";
import { NotificationType } from "@prisma/client";

function safeEmitNotification(userId: string, notification: unknown) {
  try {
    emitNotification(userId, notification);
  } catch {
      }
}
function safeEmitUnreadCount(userId: string, count: number) {
  try {
    emitUnreadCount(userId, count);
  } catch {
      }
}

export const notificationService = {
  async listNotifications(userId: string, page: number, limit: number) {
    const [notifications, total] = await notificationRepository.list(userId, (page - 1) * limit, limit);
    return { notifications, total, page, limit };
  },

  async unreadCount(userId: string) {
    return notificationRepository.unreadCount(userId);
  },

  async markAsRead(id: string, requesterId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw ApiError.notFound("Notification not found");
    if (notification.userId !== requesterId) {
      
      throw ApiError.notFound("Notification not found");
    }
    const updated = await notificationRepository.markRead(id);
    const unreadCount = await notificationRepository.unreadCount(requesterId);
    safeEmitUnreadCount(requesterId, unreadCount);
    return updated;
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllRead(userId);
    safeEmitUnreadCount(userId, 0);
    return { success: true };
  },

    async createAndPush(params: { userId: string; type: NotificationType; message: string; taskId?: string }) {
    const notification = await notificationRepository.create(params);
    safeEmitNotification(params.userId, notification);
    const unreadCount = await notificationRepository.unreadCount(params.userId);
    safeEmitUnreadCount(params.userId, unreadCount);
    return notification;
  },
};
