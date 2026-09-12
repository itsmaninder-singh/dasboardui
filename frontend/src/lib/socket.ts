import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore";
import { useUiStore } from "../store/uiStore";
import { queryClient } from "./queryClient";
import { ActivityEventPayload, ActivityLog } from "../types/activity";
import { NotificationItem } from "../types/notification";

export const SOCKET_URL = "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(token: string): Socket {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  const syncActivities = () => {
    if (!socket) return;
    // Rule 7: On socket connect / reconnect, always emit "activity:sync" and reconcile with Postgres
    socket.emit(
      "activity:sync",
      {},
      (response: { success: boolean; data?: ActivityLog[] }) => {
        if (response?.success && Array.isArray(response.data)) {
          useSocketStore.getState().setRecentActivities(response.data);
          // Invalidate activity queries so any page viewing activities reflects fresh DB state
          queryClient.invalidateQueries({ queryKey: ["activity"] });
        }
      }
    );
  };

  socket.on("connect", () => {
    useSocketStore.getState().setIsConnected(true);
    syncActivities();
  });

  socket.on("reconnect", () => {
    useSocketStore.getState().setIsConnected(true);
    syncActivities();
  });

  socket.on("disconnect", () => {
    useSocketStore.getState().setIsConnected(false);
  });

  socket.on("activity:new", (payload: ActivityEventPayload) => {
    // Convert to ActivityLog format for store
    const activityItem: ActivityLog = {
      id: payload.id,
      taskId: payload.taskId,
      projectId: payload.projectId,
      taskTitle: payload.taskTitle,
      previousStatus: payload.previousStatus,
      newStatus: payload.newStatus,
      changedBy: payload.changedBy,
      createdAt: payload.createdAt,
      user: {
        id: payload.changedBy?.id,
        name: payload.changedBy?.name,
        role: payload.changedBy?.role,
      },
      task: {
        id: payload.taskId,
        title: payload.taskTitle,
      },
    };

    useSocketStore.getState().addActivity(activityItem);

    // Invalidate TanStack Query caches so UI updates without manual patching
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
  });

  socket.on("notification:new", (notification: NotificationItem) => {
    useSocketStore.getState().incrementUnreadCount();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

    useUiStore.getState().addToast({
      type: "info",
      title: "New Notification",
      description: notification.message,
      durationMs: 5000,
    });
  });

  socket.on("notification:unread-count", (payload: { unreadCount: number }) => {
    useSocketStore.getState().setUnreadCount(payload.unreadCount);
  });

  socket.on("presence:update", (payload: { onlineCount: number }) => {
    useSocketStore.getState().setOnlineCount(payload.onlineCount);
  });

  // Fallback if server responds via event instead of ack callback
  socket.on("activity:sync-response", (events: ActivityLog[]) => {
    if (Array.isArray(events)) {
      useSocketStore.getState().setRecentActivities(events);
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  useSocketStore.getState().setIsConnected(false);
}
