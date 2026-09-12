import { Role } from "./auth";
import { TaskStatus } from "./task";

export interface ActivityLog {
  id: string;
  taskId: string;
  projectId: string;
  userId?: string;
  previousStatus: TaskStatus | null;
  newStatus: TaskStatus;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    role: Role;
  };
  task?: {
    id: string;
    title: string;
  };
  project?: {
    id: string;
    name: string;
  };
  
  taskTitle?: string;
  changedBy?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ActivityEventPayload {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  previousStatus: TaskStatus | null;
  newStatus: TaskStatus;
  changedBy: {
    id: string;
    name: string;
    role: Role;
  };
  createdAt: string;
}
