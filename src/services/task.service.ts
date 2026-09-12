import { taskRepository } from "../repositories/task.repository";
import { userRepository } from "../repositories/user.repository";
import { activityRepository } from "../repositories/activity.repository";
import { projectService } from "./project.service";
import { notificationService } from "./notification.service";
import { emitTaskActivity } from "../socket/events";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../config/db";
import { Prisma, Role, TaskStatus, TaskPriority } from "@prisma/client";

interface RequestingUser {
  id: string;
  role: Role;
}

/**
 * Loads a task and enforces read/write access:
 *  - ADMIN: any task
 *  - PROJECT_MANAGER: only tasks inside projects they manage
 *  - DEVELOPER: only tasks assigned to them
 * Always 404s (never 403) on a mismatch, so unauthorized users can't
 * distinguish "doesn't exist" from "exists but isn't yours".
 */
async function loadAuthorizedTask(taskId: string, requester: RequestingUser) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");

  if (requester.role === "ADMIN") return task;

  if (requester.role === "PROJECT_MANAGER") {
    if (task.project.managerId !== requester.id) {
      throw ApiError.notFound("Task not found");
    }
    return task;
  }

  // DEVELOPER
  if (task.assignedDeveloperId !== requester.id) {
    throw ApiError.notFound("Task not found");
  }
  return task;
}

async function assertDeveloper(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user || user.role !== "DEVELOPER") {
    throw ApiError.badRequest("assignedDeveloperId must belong to an active DEVELOPER", "INVALID_DEVELOPER");
  }
  return user;
}

export const taskService = {
  async createTask(
    input: {
      title: string;
      description?: string;
      projectId: string;
      assignedDeveloperId?: string;
      priority?: TaskPriority;
      dueDate?: Date;
    },
    requester: RequestingUser
  ) {
    // Only ADMIN or the owning PM may create tasks in a project.
    await projectService.assertProjectAccess(input.projectId, requester);

    if (input.assignedDeveloperId) {
      await assertDeveloper(input.assignedDeveloperId);
    }

    const task = await taskRepository.create({
      title: input.title,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate,
      project: { connect: { id: input.projectId } },
      ...(input.assignedDeveloperId
        ? { assignedDeveloper: { connect: { id: input.assignedDeveloperId } } }
        : {}),
    } as Prisma.TaskCreateInput);

    if (input.assignedDeveloperId) {
      await notificationService.createAndPush({
        userId: input.assignedDeveloperId,
        type: "TASK_ASSIGNED",
        message: `You were assigned to task "${task.title}"`,
        taskId: task.id,
      });
    }

    return task;
  },

  async listTasks(
    requester: RequestingUser,
    filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDateFrom?: Date;
      dueDateTo?: Date;
      projectId?: string;
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.TaskWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.dueDateFrom || filters.dueDateTo
        ? {
            dueDate: {
              ...(filters.dueDateFrom ? { gte: filters.dueDateFrom } : {}),
              ...(filters.dueDateTo ? { lte: filters.dueDateTo } : {}),
            },
          }
        : {}),
    };

    // Role-based visibility scoping — always applied server-side, never trusted from client.
    if (requester.role === "PROJECT_MANAGER") {
      where.project = { managerId: requester.id };
    } else if (requester.role === "DEVELOPER") {
      where.assignedDeveloperId = requester.id;
    }
    // ADMIN: no extra restriction.

    const [tasks, total] = await taskRepository.list(where, (filters.page - 1) * filters.limit, filters.limit);
    return { tasks, total, page: filters.page, limit: filters.limit };
  },

  async getTaskById(taskId: string, requester: RequestingUser) {
    return loadAuthorizedTask(taskId, requester);
  },

  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      assignedDeveloperId?: string | null;
      priority?: TaskPriority;
      dueDate?: Date | null;
    },
    requester: RequestingUser
  ) {
    const task = await loadAuthorizedTask(taskId, requester);

    // Only ADMIN or the owning PM can edit task fields; a developer may not reassign
    // or edit their own task's metadata — only its status (see updateTaskStatus).
    if (requester.role === "DEVELOPER") {
      throw ApiError.forbidden("Developers cannot edit task details, only task status");
    }

    if (data.assignedDeveloperId) {
      await assertDeveloper(data.assignedDeveloperId);
    }

    const previousAssigneeId = task.assignedDeveloperId;

    const updated = await taskRepository.update(taskId, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
      ...(data.assignedDeveloperId !== undefined
        ? data.assignedDeveloperId === null
          ? { assignedDeveloper: { disconnect: true } }
          : { assignedDeveloper: { connect: { id: data.assignedDeveloperId } } }
        : {}),
    });

    if (data.assignedDeveloperId && data.assignedDeveloperId !== previousAssigneeId) {
      await notificationService.createAndPush({
        userId: data.assignedDeveloperId,
        type: "TASK_ASSIGNED",
        message: `You were assigned to task "${updated.title}"`,
        taskId: updated.id,
      });
    }

    return updated;
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus, requester: RequestingUser) {
    const task = await loadAuthorizedTask(taskId, requester);

    // Additional write-specific rule: a developer may update status only on their
    // own assigned task (loadAuthorizedTask already guarantees that for DEVELOPER,
    // but we keep this explicit since it's the exact rule the spec calls out).
    if (requester.role === "DEVELOPER" && task.assignedDeveloperId !== requester.id) {
      throw ApiError.forbidden("You can only update tasks assigned to you");
    }

    const previousStatus = task.status;

    const updated = await taskRepository.update(taskId, { status: newStatus });

    const activity = await activityRepository.create({
      taskId: task.id,
      projectId: task.projectId,
      userId: requester.id,
      previousStatus,
      newStatus,
    });

    try {
      emitTaskActivity(
        {
          id: activity.id,
          taskId: task.id,
          taskTitle: updated.title,
          projectId: task.projectId,
          previousStatus,
          newStatus,
          changedBy: { id: activity.user.id, name: activity.user.name, role: activity.user.role },
          createdAt: activity.createdAt,
        },
        { assignedDeveloperId: task.assignedDeveloperId }
      );
    } catch {
      // Socket.io may not be initialized (e.g. under test, or if the realtime layer is
      // temporarily down) — the DB write (task + activity log) has already succeeded,
      // which is what matters for correctness; realtime delivery is best-effort.
    }

    // Notify the owning PM when a developer moves their task into review.
    if (newStatus === "IN_REVIEW" && previousStatus !== "IN_REVIEW") {
      await notificationService.createAndPush({
        userId: task.project.managerId,
        type: "TASK_IN_REVIEW",
        message: `Task "${updated.title}" was moved to IN_REVIEW`,
        taskId: task.id,
      });
    }

    return updated;
  },

  async deleteTask(taskId: string, requester: RequestingUser) {
    await loadAuthorizedTask(taskId, requester);
    if (requester.role === "DEVELOPER") {
      throw ApiError.forbidden("Developers cannot delete tasks");
    }
    return prisma.task.delete({ where: { id: taskId } });
  },

  loadAuthorizedTask,
};
