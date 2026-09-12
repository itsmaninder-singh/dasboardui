import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { taskService } from "../services/task.service";

export const taskController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.createTask(req.body, req.user!);
    return sendSuccess(res, task, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as unknown as {
      status?: any; priority?: any; dueDateFrom?: Date; dueDateTo?: Date;
      projectId?: string; page: number; limit: number;
    };
    const result = await taskService.listTasks(req.user!, filters);
    return sendSuccess(res, result.tasks, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.getTaskById(req.params.id, req.user!);
    return sendSuccess(res, task);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user!);
    return sendSuccess(res, task);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user!);
    return sendSuccess(res, task);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await taskService.deleteTask(req.params.id, req.user!);
    return sendSuccess(res, { success: true });
  }),
};
