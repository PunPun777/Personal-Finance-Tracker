import { Router } from "express";
import * as transactionController from "../controllers/transactionController.js";
import {
  createTransactionRules,
  updateTransactionRules,
} from "../validators/transactionValidators.js";
import validate from "../middleware/validationMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/summary", transactionController.getTransactionSummary);

router.get("/", transactionController.getTransactions);
router.post(
  "/",
  createTransactionRules,
  validate,
  transactionController.createTransaction,
);
router.put(
  "/:id",
  updateTransactionRules,
  validate,
  transactionController.updateTransaction,
);
router.delete("/:id", transactionController.deleteTransaction);

export default router;
