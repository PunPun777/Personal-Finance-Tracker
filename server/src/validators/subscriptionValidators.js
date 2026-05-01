import { body } from "express-validator";
import { TRANSACTION_CATEGORIES } from "../models/Transaction.js";
import { BILLING_CYCLES } from "../models/Subscription.js";

export const createSubscriptionRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Subscription name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),

  body("amount")
    .notEmpty().withMessage("Amount is required.")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number."),

  body("billingCycle")
    .optional()
    .isIn(BILLING_CYCLES)
    .withMessage(`Billing cycle must be one of: ${BILLING_CYCLES.join(", ")}.`),

  body("nextBillingDate")
    .notEmpty().withMessage("Next billing date is required.")
    .isISO8601().withMessage("Next billing date must be a valid ISO 8601 date."),

  body("category")
    .notEmpty().withMessage("Category is required.")
    .isIn(TRANSACTION_CATEGORIES)
    .withMessage(`Category must be one of: ${TRANSACTION_CATEGORIES.join(", ")}.`),

  body("accountId")
    .optional({ nullable: true })
    .isMongoId().withMessage("accountId must be a valid ID."),

  body("description")
    .optional()
    .isLength({ max: 300 }).withMessage("Description cannot exceed 300 characters."),
];

export const updateSubscriptionRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),

  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number."),

  body("billingCycle")
    .optional()
    .isIn(BILLING_CYCLES)
    .withMessage(`Billing cycle must be one of: ${BILLING_CYCLES.join(", ")}.`),

  body("nextBillingDate")
    .optional()
    .isISO8601().withMessage("Next billing date must be a valid ISO 8601 date."),

  body("category")
    .optional()
    .isIn(TRANSACTION_CATEGORIES)
    .withMessage(`Category must be one of: ${TRANSACTION_CATEGORIES.join(", ")}.`),

  body("accountId")
    .optional({ nullable: true })
    .isMongoId().withMessage("accountId must be a valid ID."),

  body("description")
    .optional()
    .isLength({ max: 300 }).withMessage("Description cannot exceed 300 characters."),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean."),
];
