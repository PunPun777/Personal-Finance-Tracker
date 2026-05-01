import { Router } from "express";
import * as subscriptionController from "../controllers/subscriptionController.js";
import {
  createSubscriptionRules,
  updateSubscriptionRules,
} from "../validators/subscriptionValidators.js";
import validate from "../middleware/validationMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);

router.get("/", subscriptionController.getSubscriptions);
router.post("/", createSubscriptionRules, validate, subscriptionController.createSubscription);
router.post("/process-due", subscriptionController.processDue);
router.get("/:id", subscriptionController.getSubscriptionById);
router.put("/:id", updateSubscriptionRules, validate, subscriptionController.updateSubscription);
router.delete("/:id", subscriptionController.deleteSubscription);

export default router;
