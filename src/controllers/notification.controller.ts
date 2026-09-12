import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await notificationService.listNotifications(req.user!.id, page, limit);
    return sendSuccess(res, result.notifications, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationService.unreadCount(req.user!.id);
    return sendSuccess(res, { unreadCount: count });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    return sendSuccess(res, notification);
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.markAllAsRead(req.user!.id);
    return sendSuccess(res, result);
  }),
};
