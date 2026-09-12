import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { activityService } from "../services/activity.service";

export const activityController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, projectId } = req.query as unknown as {
      page: number; limit: number; projectId?: string;
    };
    const result = await activityService.listActivity(req.user!, page, limit, projectId);
    return sendSuccess(res, result.activities, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }),
};
