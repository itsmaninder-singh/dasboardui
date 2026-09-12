import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

export const projectRepository = {
  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data, include: { client: true, manager: true } });
  },
  findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { client: true, manager: { select: { id: true, name: true, email: true } } },
    });
  },
  update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },
  
  list(where: Prisma.ProjectWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { client: true, manager: { select: { id: true, name: true, email: true } } },
      }),
      prisma.project.count({ where }),
    ]);
  },
};
