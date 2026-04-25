import { Router } from "express";
import * as goalController from "../controllers/goalController.js";
import {
  createGoalRules,
  updateGoalRules,
} from "../validators/goalValidators.js";
import validate from "../middleware/validationMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", goalController.getGoals);
router.post("/", createGoalRules, validate, goalController.createGoal);
router.get("/:id", goalController.getGoalById);
router.put("/:id", updateGoalRules, validate, goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);

export default router;
