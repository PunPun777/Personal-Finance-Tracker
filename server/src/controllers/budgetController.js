import * as budgetService from "../services/budgetService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getBudgets = async (req, res, next) => {
  try {
    const result = await budgetService.getBudgets(req.user._id);
    sendSuccess(res, 200, "Budgets fetched.", result);
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.createBudget(req.user._id, req.body);
    sendSuccess(res, 201, "Budget created.", { budget });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.updateBudget(
      req.params.id,
      req.user._id,
      req.body,
    );
    sendSuccess(res, 200, "Budget updated.", { budget });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.params.id, req.user._id);
    sendSuccess(res, 200, "Budget deleted.", null);
  } catch (error) {
    next(error);
  }
};
