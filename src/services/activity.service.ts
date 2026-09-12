import { activityRepository } from "../repositories/activity.repository";
import { Prisma, Role } from "@prisma/client";

interface RequestingUser {
  id: string;
  role: Role;
}

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

    async latestForUser(requester: RequestingUser) {
    const where = buildVisibilityWhere(requester);
    return activityRepository.latestForUser(where, 20);
  },

  buildVisibilityWhere,
};
