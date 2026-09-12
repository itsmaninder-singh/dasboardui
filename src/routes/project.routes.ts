import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createProjectSchema,
  updateProjectSchema,
  idParamSchema,
  paginationQuerySchema,
} from "../validators/project.validator";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ body: createProjectSchema }),
  projectController.create
);
router.get(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ query: paginationQuerySchema }),
  projectController.list
);
router.get(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ params: idParamSchema }),
  projectController.getById
);
router.patch(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ params: idParamSchema, body: updateProjectSchema }),
  projectController.update
);
router.delete(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ params: idParamSchema }),
  projectController.remove
);

export default router;
