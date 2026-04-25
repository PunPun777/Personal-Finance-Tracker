import Goal from "../models/Goal.js";
import ApiError from "../utils/ApiError.js";

export const getGoals = async (userId) => {
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
  return goals;
};

export const getGoalById = async (goalId, userId) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(
      "Goal not found or you do not have permission to view it.",
      404,
    );
  }
  return goal;
};

export const createGoal = async (userId, data) => {
  if (new Date(data.targetDate) <= new Date()) {
    throw new ApiError("Target date must be in the future.", 400);
  }

  const goal = await Goal.create({ ...data, userId });
  return goal;
};

export const updateGoal = async (goalId, userId, updates) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(
      "Goal not found or you do not have permission to update it.",
      404,
    );
  }

  if (updates.targetDate && new Date(updates.targetDate) <= new Date()) {
    throw new ApiError("Target date must be in the future.", 400);
  }

  const newSavedAmount = updates.savedAmount ?? goal.savedAmount;
  const newTargetAmount = updates.targetAmount ?? goal.targetAmount;
  if (newSavedAmount > newTargetAmount) {
    throw new ApiError("Saved amount cannot exceed target amount.", 400);
  }

  const allowedFields = [
    "title",
    "targetAmount",
    "savedAmount",
    "targetDate",
    "monthlyContribution",
    "status",
  ];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      goal[field] = updates[field];
    }
  });

  if (goal.savedAmount >= goal.targetAmount && goal.status === "active") {
    goal.status = "completed";
  }

  await goal.save();
  return goal;
};

export const deleteGoal = async (goalId, userId) => {
  const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(
      "Goal not found or you do not have permission to delete it.",
      404,
    );
  }
  return goal;
};
