import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Coarse role gate. This only checks role membership — ownership and
 * assignment checks (e.g. "is this PM's project", "is this developer's task")
 * happen inside the service layer, since they require a DB lookup.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    return next();
  };
}
