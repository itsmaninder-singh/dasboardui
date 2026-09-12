import { prisma } from "../config/db";
import { Prisma, TaskStatus } from "@prisma/client";

export const activityRepository = {
  create(data: {
    taskId: string;
    projectId: string;
    userId: string;
    previousStatus: TaskStatus | null;
    newStatus: TaskStatus;
  }) {
    return prisma.activityLog.create({
      data,
      include: { user: { select: { id: true, name: true, email: true, role: true } }, task: true },
    });
  },
  list(where: Prisma.ActivityLogWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          task: { select: { id: true, title: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);
  },
  // Used for the "missed events on reconnect" feature — authoritative source is Postgres, not memory.
  latestForUser(where: Prisma.ActivityLogWhereInput, take = 20) {
    return prisma.activityLog.findMany({
      where,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },
};
