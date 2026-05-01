import { Router } from "express";
import * as budgetController from "../controllers/budgetController.js";
import {
  createBudgetRules,
  updateBudgetRules,
} from "../validators/budgetValidators.js";
import validate from "../middleware/validationMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

// All budget routes require authentication
router.use(protect);

router.get("/", budgetController.getBudgets);
router.post("/", createBudgetRules, validate, budgetController.createBudget);
router.put("/:id", updateBudgetRules, validate, budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

export default router;
