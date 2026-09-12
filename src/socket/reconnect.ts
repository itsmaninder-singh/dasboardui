import { Server, Socket } from "socket.io";
import { AuthenticatedSocket } from "./auth";
import { activityService } from "../services/activity.service";
import { logger } from "../utils/logger";

export function registerReconnectHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    const s = socket as AuthenticatedSocket;

    s.on("activity:sync", async (_payload, ack?: (data: unknown) => void) => {
      try {
        const events = await activityService.latestForUser({ id: s.data.userId, role: s.data.role });
        if (typeof ack === "function") {
          ack({ success: true, data: events });
        } else {
          s.emit("activity:sync-response", events);
        }
      } catch (err) {
        logger.error("activity:sync failed:", err);
        if (typeof ack === "function") ack({ success: false });
      }
    });
  });
}
