import { Router } from "express";
import * as accountController from "../controllers/accountController.js";
import {
  createAccountRules,
  updateAccountRules,
} from "../validators/accountValidators.js";
import validate from "../middleware/validationMiddleware.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);

router.get("/", accountController.getAccounts);
router.post("/", createAccountRules, validate, accountController.createAccount);
router.get("/:id", accountController.getAccountById);
router.put("/:id", updateAccountRules, validate, accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

export default router;
