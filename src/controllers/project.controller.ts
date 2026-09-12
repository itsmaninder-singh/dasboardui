import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { projectService } from "../services/project.service";

export const projectController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.createProject(req.body, req.user!);
    return sendSuccess(res, project, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await projectService.listProjects(req.user!, page, limit);
    return sendSuccess(res, result.projects, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.getProjectById(req.params.id, req.user!);
    return sendSuccess(res, project);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.updateProject(req.params.id, req.body, req.user!);
    return sendSuccess(res, project);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await projectService.deleteProject(req.params.id, req.user!);
    return sendSuccess(res, { success: true });
  }),
};
