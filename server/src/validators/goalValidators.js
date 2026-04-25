import { body } from 'express-validator';

export const createGoalRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Goal title is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters.'),

  body('targetAmount')
    .notEmpty().withMessage('Target amount is required.')
    .isFloat({ gt: 0 }).withMessage('Target amount must be a positive number.'),

  body('targetDate')
    .notEmpty().withMessage('Target date is required.')
    .isISO8601().withMessage('Target date must be a valid ISO 8601 date.'),

  body('savedAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Saved amount must be 0 or greater.'),

  body('monthlyContribution')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Monthly contribution must be 0 or greater.'),
];

export const updateGoalRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters.'),

  body('targetAmount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Target amount must be a positive number.'),

  body('targetDate')
    .optional()
    .isISO8601().withMessage('Target date must be a valid ISO 8601 date.'),

  body('savedAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Saved amount must be 0 or greater.'),

  body('monthlyContribution')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Monthly contribution must be 0 or greater.'),

  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused']).withMessage('Status must be active, completed, or paused.'),
];
