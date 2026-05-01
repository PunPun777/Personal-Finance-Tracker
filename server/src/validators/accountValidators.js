import { body } from "express-validator";
import { ACCOUNT_TYPES } from "../models/Account.js";

// ── Create ──────────────────────────────────────────────────────────────────

export const createAccountRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Account name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Account name must be between 2 and 50 characters."),

  body("type")
    .optional()
    .isIn(ACCOUNT_TYPES)
    .withMessage(`Account type must be one of: ${ACCOUNT_TYPES.join(", ")}.`),

  body("balance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Balance must be 0 or a positive number."),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code (e.g. INR)."),
];

// ── Update (all fields optional) ────────────────────────────────────────────

export const updateAccountRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Account name must be between 2 and 50 characters."),

  body("type")
    .optional()
    .isIn(ACCOUNT_TYPES)
    .withMessage(`Account type must be one of: ${ACCOUNT_TYPES.join(", ")}.`),

  body("balance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Balance must be 0 or a positive number."),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code (e.g. INR)."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
];
