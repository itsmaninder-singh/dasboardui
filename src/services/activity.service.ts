import { activityRepository } from "../repositories/activity.repository";
import { Prisma, Role } from "@prisma/client";

interface RequestingUser {
  id: string;
  role: Role;
}

/**
 * Builds the Prisma `where` clause enforcing activity visibility rules:
 *  - ADMIN: all projects
 *  - PROJECT_MANAGER: only activity in projects they manage
 *  - DEVELOPER: only activity on tasks assigned to them
 * This same clause is reused by both the REST endpoint and the socket
 * "missed events on reconnect" flow, so the rule is defined in exactly one place.
 */
function buildVisibilityWhere(requester: RequestingUser, projectId?: string): Prisma.ActivityLogWhereInput {
  if (requester.role === "ADMIN") {
    return projectId ? { projectId } : {};
  }
  if (requester.role === "PROJECT_MANAGER") {
    return {
      project: { managerId: requester.id },
      ...(projectId ? { projectId } : {}),
    };
  }
  // DEVELOPER
  return {
    task: { assignedDeveloperId: requester.id },
    ...(projectId ? { projectId } : {}),
  };
}

export const activityService = {
  async listActivity(requester: RequestingUser, page: number, limit: number, projectId?: string) {
    const where = buildVisibilityWhere(requester, projectId);
    const [activities, total] = await activityRepository.list(where, (page - 1) * limit, limit);
    return { activities, total, page, limit };
  },

  /** Used on socket reconnect: latest 20 events this user is authorized to see, from Postgres. */
  async latestForUser(requester: RequestingUser) {
    const where = buildVisibilityWhere(requester);
    return activityRepository.latestForUser(where, 20);
  },

  buildVisibilityWhere,
};
