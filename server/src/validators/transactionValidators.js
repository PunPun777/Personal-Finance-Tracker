import { body } from 'express-validator';
import { TRANSACTION_CATEGORIES } from '../models/Transaction.js';

const goalIdRule = body('goalId')
  .optional({ nullable: true })
  .isMongoId().withMessage('goalId must be a valid ID.');

const accountIdRule = body('accountId')
  .optional({ nullable: true })
  .isMongoId().withMessage('accountId must be a valid ID.');

export const createTransactionRules = [
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),

  body('type')
    .notEmpty().withMessage('Transaction type is required.')
    .isIn(['income', 'expense']).withMessage('Type must be "income" or "expense".'),

  body('category')
    .notEmpty().withMessage('Category is required.')
    .isIn(TRANSACTION_CATEGORIES)
    .withMessage(`Category must be one of: ${TRANSACTION_CATEGORIES.join(', ')}.`),

  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters.'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date.'),

  goalIdRule,
  accountIdRule,
];

export const updateTransactionRules = [
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),

  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be "income" or "expense".'),

  body('category')
    .optional()
    .isIn(TRANSACTION_CATEGORIES)
    .withMessage(`Category must be one of: ${TRANSACTION_CATEGORIES.join(', ')}.`),

  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters.'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date.'),

  goalIdRule,
  accountIdRule,
];
