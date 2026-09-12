import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema, idParamSchema, paginationQuerySchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate);

router.get("/me", userController.me);

router.post("/", authorize("ADMIN"), validate({ body: createUserSchema }), userController.create);
router.get("/", authorize("ADMIN"), validate({ query: paginationQuerySchema }), userController.list);
router.get("/:id", authorize("ADMIN"), validate({ params: idParamSchema }), userController.getById);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateUserSchema }),
  userController.update
);

export default router;
