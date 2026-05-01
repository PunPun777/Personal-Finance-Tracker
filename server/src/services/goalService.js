import mongoose from "mongoose";
import Goal from "../models/Goal.js";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";
async function computeSavedAmount(goalId, userId) {
  const result = await Transaction.aggregate([
    {
      $match: {
        goalId: new mongoose.Types.ObjectId(goalId),
        userId: new mongoose.Types.ObjectId(userId),
        type: "expense",
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
}
async function enrichGoal(goal, userId) {
  const savedAmount = await computeSavedAmount(goal._id, userId);
  return { ...goal, savedAmount };
}

export const getGoals = async (userId) => {
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(
    goals.map((g) => enrichGoal(g, userId))
  );

  return enriched;
};

export const getGoalById = async (goalId, userId) => {
  const goal = await Goal.findOne({ _id: goalId, userId }).lean();
  if (!goal) {
    throw new ApiError(
      "Goal not found or you do not have permission to view it.",
      404,
    );
  }
  const savedAmount = await computeSavedAmount(goalId, userId);
  return { ...goal, savedAmount };
};

export const createGoal = async (userId, data) => {
  if (new Date(data.targetDate) <= new Date()) {
    throw new ApiError("Target date must be in the future.", 400);
  }

  const goal = await Goal.create({ ...data, userId, savedAmount: 0 });  return { ...goal.toJSON(), savedAmount: 0 };
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
  const allowedFields = ["title", "targetAmount", "targetDate", "monthlyContribution", "status"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      goal[field] = updates[field];
    }
  });
  const savedAmount = await computeSavedAmount(goalId, userId);
  if (savedAmount >= goal.targetAmount && goal.status === "active") {
    goal.status = "completed";
  }

  await goal.save();
  return { ...goal.toJSON(), savedAmount };
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
