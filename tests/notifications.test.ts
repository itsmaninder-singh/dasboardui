import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/config/db";
import { createUser, createClient, createProject, createTask, cleanupDatabase } from "./helpers";

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("Notifications", () => {
  test("11. Notification unread count updates after marking read", async () => {
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev, accessToken: devToken } = await createUser("DEVELOPER", "dev");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);

    
    const task = await createTask(project.id, dev.id);
    await prisma.notification.create({
      data: { userId: dev.id, type: "TASK_ASSIGNED", message: "test", taskId: task.id },
    });

    const before = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${devToken}`);
    expect(before.body.data.unreadCount).toBeGreaterThanOrEqual(1);

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${devToken}`);
    const notificationId = list.body.data[0].id;

    await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${devToken}`);

    const after = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${devToken}`);

    expect(after.body.data.unreadCount).toBe(before.body.data.unreadCount - 1);
  });

  test("A developer cannot mark another user's notification as read", async () => {
    const { user: dev1 } = await createUser("DEVELOPER", "dev1");
    const { accessToken: dev2Token } = await createUser("DEVELOPER", "dev2");

    const notification = await prisma.notification.create({
      data: { userId: dev1.id, type: "GENERAL", message: "private" },
    });

    const res = await request(app)
      .patch(`/api/notifications/${notification.id}/read`)
      .set("Authorization", `Bearer ${dev2Token}`);

    expect(res.status).toBe(404);
  });
});
