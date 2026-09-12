import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

async function main() {
  console.log("Seeding database...");

  
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await hash("Password123!");

  const admin = await prisma.user.create({
    data: { name: "Alice Admin", email: "admin@pm.dev", passwordHash: defaultPassword, role: "ADMIN" },
  });

  const pm1 = await prisma.user.create({
    data: { name: "Paul Manager", email: "pm1@pm.dev", passwordHash: defaultPassword, role: "PROJECT_MANAGER" },
  });
  const pm2 = await prisma.user.create({
    data: { name: "Priya Patel", email: "pm2@pm.dev", passwordHash: defaultPassword, role: "PROJECT_MANAGER" },
  });

  const dev1 = await prisma.user.create({
    data: { name: "Dev One", email: "dev1@pm.dev", passwordHash: defaultPassword, role: "DEVELOPER" },
  });
  const dev2 = await prisma.user.create({
    data: { name: "Dev Two", email: "dev2@pm.dev", passwordHash: defaultPassword, role: "DEVELOPER" },
  });
  const dev3 = await prisma.user.create({
    data: { name: "Dev Three", email: "dev3@pm.dev", passwordHash: defaultPassword, role: "DEVELOPER" },
  });
  const dev4 = await prisma.user.create({
    data: { name: "Dev Four", email: "dev4@pm.dev", passwordHash: defaultPassword, role: "DEVELOPER" },
  });

  const clientA = await prisma.client.create({ data: { name: "Acme Corp", email: "contact@acme.io", company: "Acme Corp" } });
  const clientB = await prisma.client.create({ data: { name: "Globex Inc", email: "hello@globex.io", company: "Globex Inc" } });
  const clientC = await prisma.client.create({ data: { name: "Initech", email: "ops@initech.io", company: "Initech" } });

  const projectAlpha = await prisma.project.create({
    data: { name: "Website Revamp", description: "Redesign marketing site", clientId: clientA.id, managerId: pm1.id },
  });
  const projectBeta = await prisma.project.create({
    data: { name: "Mobile App", description: "iOS + Android app", clientId: clientB.id, managerId: pm1.id },
  });
  const projectGamma = await prisma.project.create({
    data: { name: "Internal Tooling", description: "Admin dashboards", clientId: clientC.id, managerId: pm2.id },
  });

  const now = Date.now();
  const inDays = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);

  type TaskSeed = {
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    assignedDeveloperId: string;
    project: string;
  };

  const taskSeeds: TaskSeed[] = [
    { title: "Set up CI pipeline", status: "DONE", priority: "MEDIUM", dueDate: inDays(-10), assignedDeveloperId: dev1.id, project: projectAlpha.id },
    { title: "Design homepage hero", status: "IN_PROGRESS", priority: "HIGH", dueDate: inDays(3), assignedDeveloperId: dev1.id, project: projectAlpha.id },
    { title: "Fix nav bar responsiveness", status: "IN_REVIEW", priority: "LOW", dueDate: inDays(1), assignedDeveloperId: dev2.id, project: projectAlpha.id },
    { title: "Integrate CMS", status: "TODO", priority: "MEDIUM", dueDate: inDays(7), assignedDeveloperId: dev2.id, project: projectAlpha.id },
    { title: "Migrate legacy pages", status: "TODO", priority: "CRITICAL", dueDate: inDays(-2), assignedDeveloperId: dev1.id, project: projectAlpha.id },
    { title: "Auth screens", status: "IN_PROGRESS", priority: "HIGH", dueDate: inDays(5), assignedDeveloperId: dev3.id, project: projectBeta.id },
    { title: "Push notifications", status: "TODO", priority: "MEDIUM", dueDate: inDays(10), assignedDeveloperId: dev3.id, project: projectBeta.id },
    { title: "Offline sync", status: "TODO", priority: "HIGH", dueDate: inDays(-1), assignedDeveloperId: dev4.id, project: projectBeta.id },
    { title: "App store submission", status: "DONE", priority: "CRITICAL", dueDate: inDays(-15), assignedDeveloperId: dev3.id, project: projectBeta.id },
    { title: "Crash reporting setup", status: "IN_REVIEW", priority: "MEDIUM", dueDate: inDays(2), assignedDeveloperId: dev4.id, project: projectBeta.id },
    { title: "Admin user management UI", status: "TODO", priority: "MEDIUM", dueDate: inDays(6), assignedDeveloperId: dev4.id, project: projectGamma.id },
    { title: "Audit log viewer", status: "IN_PROGRESS", priority: "LOW", dueDate: inDays(9), assignedDeveloperId: dev2.id, project: projectGamma.id },
    { title: "Role permission matrix", status: "TODO", priority: "HIGH", dueDate: inDays(-3), assignedDeveloperId: dev4.id, project: projectGamma.id },
    { title: "Export to CSV", status: "DONE", priority: "LOW", dueDate: inDays(-20), assignedDeveloperId: dev2.id, project: projectGamma.id },
    { title: "Dashboard performance pass", status: "IN_REVIEW", priority: "CRITICAL", dueDate: inDays(4), assignedDeveloperId: dev4.id, project: projectGamma.id },
  ];

  for (const t of taskSeeds) {
    const task = await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedDeveloperId: t.assignedDeveloperId,
        projectId: t.project,
      },
    });

    
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        userId: t.assignedDeveloperId,
        previousStatus: "TODO",
        newStatus: t.status,
      },
    });

    if (t.status === "IN_REVIEW") {
      const project = await prisma.project.findUnique({ where: { id: t.project } });
      await prisma.notification.create({
        data: {
          userId: project!.managerId,
          type: "TASK_IN_REVIEW",
          message: `Task "${t.title}" was moved to IN_REVIEW`,
          taskId: task.id,
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: t.assignedDeveloperId,
        type: "TASK_ASSIGNED",
        message: `You were assigned to task "${t.title}"`,
        taskId: task.id,
        read: Math.random() > 0.5,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login with any of these (password: Password123!):");
  console.log(` Admin: ${admin.email}`);
  console.log(` PM:    ${pm1.email} / ${pm2.email}`);
  console.log(` Dev:   ${dev1.email} / ${dev2.email} / ${dev3.email} / ${dev4.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
