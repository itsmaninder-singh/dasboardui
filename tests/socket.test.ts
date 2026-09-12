import http from "http";
import { AddressInfo } from "net";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { app } from "../src/app";
import { initSocket } from "../src/socket/index";
import { prisma } from "../src/config/db";
import request from "supertest";
import { createUser, createClient, createProject, createTask, cleanupDatabase } from "./helpers";

let httpServer: http.Server;
let port: number;

beforeAll((done) => {
  httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    done();
  });
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
  httpServer.close();
});

function connectClient(token: string): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, { auth: { token }, transports: ["websocket"] });
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", reject);
  });
}

describe("Socket.io authorization", () => {
  test("8 & 9. Authorized users receive task activity; unauthorized users do not", async () => {
    const { user: pm, accessToken: pmToken } = await createUser("PROJECT_MANAGER", "pm");
    const { user: dev1, accessToken: dev1Token } = await createUser("DEVELOPER", "dev1");
    const { accessToken: dev2Token } = await createUser("DEVELOPER", "dev2"); 
    const client = await createClient();
    const project = await createProject(pm.id, client.id);
    const task = await createTask(project.id, dev1.id);

    const pmSocket = await connectClient(pmToken);
    const dev1Socket = await connectClient(dev1Token);
    const dev2Socket = await connectClient(dev2Token);

    
    await new Promise((r) => setTimeout(r, 300));

    const pmReceived = new Promise((resolve) => pmSocket.once("activity:new", resolve));
    const dev1Received = new Promise((resolve) => dev1Socket.once("activity:new", resolve));
    let dev2Received = false;
    dev2Socket.once("activity:new", () => {
      dev2Received = true;
    });

    await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set("Authorization", `Bearer ${dev1Token}`)
      .send({ status: "IN_PROGRESS" });

    const [pmEvent, dev1Event] = await Promise.all([pmReceived, dev1Received]);
    expect((pmEvent as any).taskId).toBe(task.id);
    expect((dev1Event as any).taskId).toBe(task.id);

    await new Promise((r) => setTimeout(r, 300));
    expect(dev2Received).toBe(false);

    pmSocket.close();
    dev1Socket.close();
    dev2Socket.close();
  });
});
