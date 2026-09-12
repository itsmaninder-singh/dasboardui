import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./auth";
import { rooms } from "./rooms";
import { presence } from "./presence";
import { prisma } from "../config/db";
import { logger } from "../utils/logger";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket: Socket) => {
    const s = socket as AuthenticatedSocket;
    const { userId, role } = s.data;

    presence.addSocket(userId, s.id);

    
    await s.join(rooms.user(userId));

    if (role === "ADMIN") {
      await s.join(rooms.adminGlobal());
    }

    if (role === "PROJECT_MANAGER") {
      const managedProjects = await prisma.project.findMany({
        where: { managerId: userId },
        select: { id: true },
      });
      await Promise.all(managedProjects.map((p) => s.join(rooms.project(p.id))));
    }

    
    
    

    broadcastPresence();

    s.on("disconnect", () => {
      presence.removeSocket(userId, s.id);
      broadcastPresence();
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket() first.");
  return io;
}

function broadcastPresence() {
  if (!io) return;
  io.to(rooms.adminGlobal()).emit("presence:update", {
    onlineCount: presence.onlineUserCount(),
  });
}

export async function joinManagerToProjectRoom(managerId: string, projectId: string) {
  if (!io) return;
  const sockets = await io.fetchSockets();
  const targets = sockets.filter((sock) => (sock.data as AuthenticatedSocket["data"]).userId === managerId);
  await Promise.all(targets.map((sock) => sock.join(rooms.project(projectId))));
  logger.info(`Joined ${targets.length} socket(s) of manager ${managerId} to room project:${projectId}`);
}
