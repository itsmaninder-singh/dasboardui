import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { userService } from "../services/user.service";

export const userController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, user, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await userService.listUsers(page, limit);
    return sendSuccess(res, result.users, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, user);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.user!.id);
    return sendSuccess(res, user);
  }),
};
