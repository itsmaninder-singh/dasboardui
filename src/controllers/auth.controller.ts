import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { authService } from "../services/auth.service";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookies";
import { env } from "../config/env";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshTokenCookie(res, refreshToken);
    return sendSuccess(res, { user, accessToken }, 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshTokenCookie(res, refreshToken);
    return sendSuccess(res, { user, accessToken });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[env.COOKIE_NAME];
    const { user, accessToken, refreshToken } = await authService.refresh(rawToken);
    setRefreshTokenCookie(res, refreshToken);
    return sendSuccess(res, { user, accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[env.COOKIE_NAME];
    await authService.logout(rawToken);
    clearRefreshTokenCookie(res);
    return sendSuccess(res, { success: true });
  }),
};
