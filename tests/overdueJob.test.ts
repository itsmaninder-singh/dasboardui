import { prisma } from "../src/config/db";
import { runOverdueSweep } from "../src/jobs/overdueTask.job";
import { createUser, createClient, createProject, createTask, cleanupDatabase } from "./helpers";

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("Overdue background job", () => {
  test("12. Overdue job changes expired tasks to OVERDUE and is idempotent", async () => {
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev } = await createUser("DEVELOPER", "dev");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);

    const overdueTask = await createTask(project.id, dev.id, {
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "TODO",
    });
    const futureTask = await createTask(project.id, dev.id, {
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "TODO",
    });

    await runOverdueSweep();

    const updated = await prisma.task.findUnique({ where: { id: overdueTask.id } });
    const untouched = await prisma.task.findUnique({ where: { id: futureTask.id } });
    expect(updated?.status).toBe("OVERDUE");
    expect(untouched?.status).toBe("TODO");

    const logCountAfterFirstRun = await prisma.activityLog.count({ where: { taskId: overdueTask.id } });

    // Running again must not create a duplicate ActivityLog / re-flip the task.
    await runOverdueSweep();
    const logCountAfterSecondRun = await prisma.activityLog.count({ where: { taskId: overdueTask.id } });

    expect(logCountAfterSecondRun).toBe(logCountAfterFirstRun);
  });
});
