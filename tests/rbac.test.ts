import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/config/db";
import { createUser, createClient, createProject, createTask, cleanupDatabase } from "./helpers";

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("RBAC and project/task security", () => {
  test("1. Admin can access all projects", async () => {
    const { accessToken: adminToken } = await createUser("ADMIN", "admin");
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);

    const res = await request(app)
      .get(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(project.id);
  });

  test("2. PM cannot access another PM's project", async () => {
    const { user: pm1 } = await createUser("PROJECT_MANAGER", "pm1");
    const { accessToken: pm2Token } = await createUser("PROJECT_MANAGER", "pm2");
    const client = await createClient();
    const project = await createProject(pm1.id, client.id);

    const res = await request(app)
      .get(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${pm2Token}`);

    expect([403, 404]).toContain(res.status);
  });

  test("3. Developer cannot access another developer's task", async () => {
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev1 } = await createUser("DEVELOPER", "dev1");
    const { accessToken: dev2Token } = await createUser("DEVELOPER", "dev2");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);
    const task = await createTask(project.id, dev1.id);

    const res = await request(app)
      .get(`/api/tasks/${task.id}`)
      .set("Authorization", `Bearer ${dev2Token}`);

    expect([403, 404]).toContain(res.status);
  });

  test("4. Developer cannot modify unauthorized tasks", async () => {
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev1 } = await createUser("DEVELOPER", "dev1");
    const { accessToken: dev2Token } = await createUser("DEVELOPER", "dev2");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);
    const task = await createTask(project.id, dev1.id);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set("Authorization", `Bearer ${dev2Token}`)
      .send({ status: "IN_PROGRESS" });

    expect([403, 404]).toContain(res.status);
  });

  test("5. Invalid JWT is rejected", async () => {
    const res = await request(app).get("/api/tasks").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("6. Refresh token is required for token refresh", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("NO_REFRESH_TOKEN");
  });

  test("Developer CAN update status of their own assigned task", async () => {
    const { user: pm } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev, accessToken: devToken } = await createUser("DEVELOPER", "dev");
    const client = await createClient();
    const project = await createProject(pm.id, client.id);
    const task = await createTask(project.id, dev.id);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set("Authorization", `Bearer ${devToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });
});
