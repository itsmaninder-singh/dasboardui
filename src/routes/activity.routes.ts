import { Router } from "express";
import { activityController } from "../controllers/activity.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { activityQuerySchema } from "../validators/activity.validator";

const router = Router();

router.use(authenticate);

// Visibility is scoped inside activity.service per role — no route-level role gate needed.
router.get("/", validate({ query: activityQuerySchema }), activityController.list);

export default router;
