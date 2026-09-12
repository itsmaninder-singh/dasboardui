import { notificationRepository } from "../repositories/notification.repository";
import { emitNotification, emitUnreadCount } from "../socket/events";
import { ApiError } from "../utils/ApiError";
import { NotificationType } from "@prisma/client";

// Realtime delivery is best-effort: if Socket.io isn't initialized (tests, or the
// realtime layer being temporarily unavailable), the DB write must still succeed.
function safeEmitNotification(userId: string, notification: unknown) {
  try {
    emitNotification(userId, notification);
  } catch {
    /* noop */
  }
}
function safeEmitUnreadCount(userId: string, count: number) {
  try {
    emitUnreadCount(userId, count);
  } catch {
    /* noop */
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
      // 404 instead of 403 — don't reveal that a notification belonging to someone else exists.
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

  /** Internal helper used by other services (e.g. task.service) to create + push a notification. */
  async createAndPush(params: { userId: string; type: NotificationType; message: string; taskId?: string }) {
    const notification = await notificationRepository.create(params);
    safeEmitNotification(params.userId, notification);
    const unreadCount = await notificationRepository.unreadCount(params.userId);
    safeEmitUnreadCount(params.userId, unreadCount);
    return notification;
  },
};
