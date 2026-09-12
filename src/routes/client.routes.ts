import { Router } from "express";
import { clientController } from "../controllers/client.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createClientSchema,
  updateClientSchema,
  idParamSchema,
  paginationQuerySchema,
} from "../validators/client.validator";

const router = Router();

router.use(authenticate);

// Client management is ADMIN-only. PMs/Developers never touch clients directly.
router.post("/", authorize("ADMIN"), validate({ body: createClientSchema }), clientController.create);
router.get(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ query: paginationQuerySchema }),
  clientController.list
);
router.get(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate({ params: idParamSchema }),
  clientController.getById
);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateClientSchema }),
  clientController.update
);
router.delete("/:id", authorize("ADMIN"), validate({ params: idParamSchema }), clientController.remove);

export default router;
