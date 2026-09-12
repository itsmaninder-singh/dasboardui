import { prisma } from "../src/config/db";
import { hashPassword } from "../src/utils/password";
import { signAccessToken } from "../src/utils/jwt";
import { Role } from "@prisma/client";

export async function createUser(role: Role, emailPrefix: string) {
  const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.dev`;
  const passwordHash = await hashPassword("Password123!");
  const user = await prisma.user.create({
    data: { name: emailPrefix, email, passwordHash, role },
  });
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  return { user, accessToken };
}

export async function createClient(name = "Test Client") {
  return prisma.client.create({ data: { name } });
}

export async function createProject(managerId: string, clientId: string, name = "Test Project") {
  return prisma.project.create({ data: { name, managerId, clientId } });
}

export async function createTask(projectId: string, assignedDeveloperId?: string, overrides: Partial<{ status: any; dueDate: Date; title: string }> = {}) {
  return prisma.task.create({
    data: {
      title: overrides.title ?? "Test Task",
      projectId,
      assignedDeveloperId,
      status: overrides.status ?? "TODO",
      dueDate: overrides.dueDate,
    },
  });
}

export async function cleanupDatabase() {
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}
