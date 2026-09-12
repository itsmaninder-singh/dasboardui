import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

/**
 * Authenticates the request using the Bearer access token.
 * The refresh token (cookie) is never accepted here — only short-lived access tokens
 * are valid for API calls, keeping the long-lived credential out of reach of XSS.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Access token missing", "NO_TOKEN"));
  }

  const token = header.substring("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(ApiError.unauthorized("Invalid or expired access token", "INVALID_TOKEN"));
  }
}
