import Budget from "../models/Budget.js";
import ApiError from "../utils/ApiError.js";

/**
 * Return all budgets for a user.
 */
export const getBudgets = async (userId) => {
  const budgets = await Budget.find({ userId }).sort({ category: 1 }).lean();
  return { budgets };
};

/**
 * Create a new budget.
 * Throws 409 if the user already has a budget for that category.
 */
export const createBudget = async (userId, data) => {
  const { category, limit, categoryBudgets } = data;

  const existing = await Budget.findOne({ userId, category });
  if (existing) {
    throw new ApiError(
      `You already have a budget for "${category}". Edit it instead.`,
      409,
    );
  }

  const budget = await Budget.create({
    userId,
    category,
    limit,
    ...(categoryBudgets?.length ? { categoryBudgets } : {}),
  });

  return budget;
};

/**
 * Update an existing budget.
 * Only limit and categoryBudgets are mutable.
 */
export const updateBudget = async (budgetId, userId, updates) => {
  const budget = await Budget.findOne({ _id: budgetId, userId });

  if (!budget) {
    throw new ApiError(
      "Budget not found or you do not have permission to update it.",
      404,
    );
  }

  if (updates.limit !== undefined) {
    budget.limit = updates.limit;
  }
  if (updates.categoryBudgets !== undefined) {
    budget.categoryBudgets = updates.categoryBudgets;
  }

  await budget.save();
  return budget;
};

/**
 * Delete a budget by id.
 */
export const deleteBudget = async (budgetId, userId) => {
  const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });

  if (!budget) {
    throw new ApiError(
      "Budget not found or you do not have permission to delete it.",
      404,
    );
  }

  return budget;
};
