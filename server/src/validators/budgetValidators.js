import { body } from "express-validator";
import { TRANSACTION_CATEGORIES } from "../models/Transaction.js";

const BUDGET_CATEGORIES = ["Overall Monthly", ...TRANSACTION_CATEGORIES];

// ── Shared sub-rules for the optional categoryBudgets array ──────────────────

const categoryBudgetRules = [
  body("categoryBudgets")
    .optional()
    .isArray()
    .withMessage("categoryBudgets must be an array."),

  body("categoryBudgets.*.category")
    .notEmpty()
    .withMessage("Each category budget must specify a category.")
    .isIn(TRANSACTION_CATEGORIES)
    .withMessage(
      `Each category budget category must be one of: ${TRANSACTION_CATEGORIES.join(", ")}.`,
    ),

  body("categoryBudgets.*.limit")
    .notEmpty()
    .withMessage("Each category budget must specify a limit.")
    .isFloat({ gt: 0 })
    .withMessage("Each category budget limit must be a positive number."),
];

// ── Create ────────────────────────────────────────────────────────────────────

export const createBudgetRules = [
  body("category")
    .notEmpty()
    .withMessage("Category is required.")
    .isIn(BUDGET_CATEGORIES)
    .withMessage(
      `Category must be one of: ${BUDGET_CATEGORIES.join(", ")}.`,
    ),

  body("limit")
    .notEmpty()
    .withMessage("Budget limit is required.")
    .isFloat({ gt: 0 })
    .withMessage("Limit must be a positive number."),

  ...categoryBudgetRules,
];

// ── Update (all fields optional) ─────────────────────────────────────────────

export const updateBudgetRules = [
  body("limit")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Limit must be a positive number."),

  ...categoryBudgetRules,
];
