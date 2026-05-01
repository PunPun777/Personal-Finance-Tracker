import Budget from "../models/Budget.js";
import ApiError from "../utils/ApiError.js";
export const getBudgets = async (userId) => {
  const budgets = await Budget.find({ userId }).sort({ category: 1 }).lean();
  return { budgets };
};
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
