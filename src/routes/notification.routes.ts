import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { paginationQuerySchema, idParamSchema } from "../validators/notification.validator";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: paginationQuerySchema }), notificationController.list);
router.get("/unread-count", notificationController.unreadCount);
router.patch("/:id/read", validate({ params: idParamSchema }), notificationController.markRead);
router.patch("/read-all", notificationController.markAllRead);

export default router;
