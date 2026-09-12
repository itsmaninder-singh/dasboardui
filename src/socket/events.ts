import { getIO } from "./index";
import { rooms } from "./rooms";

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

  
  io.to(rooms.adminGlobal()).emit("activity:new", payload);

  
  io.to(rooms.project(payload.projectId)).emit("activity:new", payload);

  
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
