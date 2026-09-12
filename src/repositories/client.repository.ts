import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

export const clientRepository = {
  create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({ data });
  },
  findById(id: string) {
    return prisma.client.findUnique({ where: { id } });
  },
  update(id: string, data: Prisma.ClientUpdateInput) {
    return prisma.client.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.client.delete({ where: { id } });
  },
  list(skip: number, take: number) {
    return prisma.$transaction([
      prisma.client.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      prisma.client.count(),
    ]);
  },
};
