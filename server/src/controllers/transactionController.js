import * as transactionService from "../services/transactionService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(
      req.user._id,
      req.query,
    );
    sendSuccess(res, 200, "Transactions fetched.", result);
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(
      req.user._id,
      req.body,
    );
    sendSuccess(res, 201, "Transaction created.", { transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.user._id,
      req.body,
    );
    sendSuccess(res, 200, "Transaction updated.", { transaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user._id);
    sendSuccess(res, 200, "Transaction deleted.", null);
  } catch (error) {
    next(error);
  }
};

export const getTransactionSummary = async (req, res, next) => {
  try {
    const summary = await transactionService.getTransactionSummary(
      req.user._id,
      req.query,
    );
    sendSuccess(res, 200, "Transaction summary fetched.", { summary });
  } catch (error) {
    next(error);
  }
};
