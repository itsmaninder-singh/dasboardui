import { getIO } from "./index";
import { rooms } from "./rooms";

/**
 * Central place for every event emitted by the app. Keeping these as named
 * functions (rather than calling io.emit(...) ad-hoc in services) keeps the
 * event names/payloads consistent and documents exactly what goes out.
 */

export interface ActivityEventPayload {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: { id: string; name: string; role: string };
  createdAt: Date;
}

export function emitTaskActivity(
  payload: ActivityEventPayload,
  opts: { assignedDeveloperId?: string | null }
) {
  const io = getIO();

  // Admin sees everything.
  io.to(rooms.adminGlobal()).emit("activity:new", payload);

  // The PM who owns the project sees it (their sockets are joined to this room).
  io.to(rooms.project(payload.projectId)).emit("activity:new", payload);

  // The assigned developer sees it directly, regardless of project-room membership.
  if (opts.assignedDeveloperId) {
    io.to(rooms.user(opts.assignedDeveloperId)).emit("activity:new", payload);
  }
}

export function emitNotification(userId: string, notification: unknown) {
  const io = getIO();
  io.to(rooms.user(userId)).emit("notification:new", notification);
}

export function emitUnreadCount(userId: string, unreadCount: number) {
  const io = getIO();
  io.to(rooms.user(userId)).emit("notification:unread-count", { unreadCount });
}
