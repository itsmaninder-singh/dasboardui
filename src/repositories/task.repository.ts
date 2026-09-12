import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

export const taskRepository = {
  create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({
      data,
      include: { assignedDeveloper: { select: { id: true, name: true, email: true } }, project: true },
    });
  },
  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedDeveloper: { select: { id: true, name: true, email: true } },
        project: { include: { manager: true } },
      },
    });
  },
  update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: { assignedDeveloper: { select: { id: true, name: true, email: true } }, project: true },
    });
  },
  list(where: Prisma.TaskWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          assignedDeveloper: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true, managerId: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);
  },
  // Used by the overdue cron job. Only picks tasks not already terminal/overdue.
  findOverdueCandidates() {
    return prisma.task.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ["DONE", "OVERDUE"] },
      },
    });
  },
};
