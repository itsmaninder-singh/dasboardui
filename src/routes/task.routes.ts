import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  idParamSchema,
  taskFilterQuerySchema,
} from "../validators/task.validator";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: taskFilterQuerySchema }), taskController.list);
router.get("/:id", validate({ params: idParamSchema }), taskController.getById);

router.post(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ body: createTaskSchema }),
  taskController.create
);
router.patch(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ params: idParamSchema, body: updateTaskSchema }),
  taskController.update
);
router.delete(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ params: idParamSchema }),
  taskController.remove
);

router.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: updateTaskStatusSchema }),
  taskController.updateStatus
);

export default router;
