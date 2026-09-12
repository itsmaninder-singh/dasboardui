export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_IN_REVIEW"
  | "TASK_STATUS_CHANGED"
  | "GENERAL";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  taskId?: string | null;
  createdAt: string;
  task?: {
    id: string;
    title: string;
  } | null;
}
