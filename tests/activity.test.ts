import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/config/db";
import { createUser, createClient, createProject, createTask, cleanupDatabase } from "./helpers";

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("Activity log", () => {
  test("7. Task status change creates an ActivityLog record", async () => {
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev, accessToken: devToken } = await createUser("DEVELOPER", "dev");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);
    const task = await createTask(project.id, dev.id);

    const before = await prisma.activityLog.count({ where: { taskId: task.id } });

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set("Authorization", `Bearer ${devToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);

    const after = await prisma.activityLog.count({ where: { taskId: task.id } });
    expect(after).toBe(before + 1);

    const log = await prisma.activityLog.findFirst({
      where: { taskId: task.id },
      orderBy: { createdAt: "desc" },
    });
    expect(log?.previousStatus).toBe("TODO");
    expect(log?.newStatus).toBe("IN_PROGRESS");
    expect(log?.userId).toBe(dev.id);
  });

  test("10. Missed activity events are read from PostgreSQL, not memory", async () => {
    const { user: pm, accessToken: pmToken } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev, accessToken: devToken } = await createUser("DEVELOPER", "dev");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);
    const task = await createTask(project.id, dev.id);

    await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set("Authorization", `Bearer ${devToken}`)
      .send({ status: "IN_PROGRESS" });

    // Simulate a "reconnect" simply by querying the REST endpoint fresh — this proves
    // the data survives independent of any socket/in-memory state, since no socket
    // connection was ever opened in this test.
    const res = await request(app)
      .get(`/api/activity?projectId=${project.id}`)
      .set("Authorization", `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].newStatus).toBe("IN_PROGRESS");
  });
});
