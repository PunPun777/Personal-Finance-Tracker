import * as goalService from "../services/goalService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getGoals(req.user._id);
    sendSuccess(res, 200, "Goals fetched.", { goals });
  } catch (error) {
    next(error);
  }
};

export const getGoalById = async (req, res, next) => {
  try {
    const goal = await goalService.getGoalById(req.params.id, req.user._id);
    sendSuccess(res, 200, "Goal fetched.", { goal });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user._id, req.body);
    sendSuccess(res, 201, "Goal created.", { goal });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(
      req.params.id,
      req.user._id,
      req.body,
    );
    sendSuccess(res, 200, "Goal updated.", { goal });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    await goalService.deleteGoal(req.params.id, req.user._id);
    sendSuccess(res, 200, "Goal deleted.", null);
  } catch (error) {
    next(error);
  }
};
