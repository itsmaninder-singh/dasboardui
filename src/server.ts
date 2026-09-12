import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./socket/index";
import { registerReconnectHandler } from "./socket/reconnect";
import { scheduleOverdueJob } from "./jobs/overdueTask.job";
import { logger } from "./utils/logger";

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
registerReconnectHandler(io);

scheduleOverdueJob();

httpServer.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down");
  httpServer.close(() => process.exit(0));
});
