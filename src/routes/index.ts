import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import clientRoutes from "./client.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import activityRoutes from "./activity.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/activity", activityRoutes);
router.use("/notifications", notificationRoutes);

export default router;
