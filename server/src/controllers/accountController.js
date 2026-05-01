import * as accountService from "../services/accountService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getAccounts = async (req, res, next) => {
  try {
    const result = await accountService.getAccounts(req.user._id);
    sendSuccess(res, 200, "Accounts fetched.", result);
  } catch (error) {
    next(error);
  }
};

export const getAccountById = async (req, res, next) => {
  try {
    const account = await accountService.getAccountById(
      req.params.id,
      req.user._id,
    );
    sendSuccess(res, 200, "Account fetched.", { account });
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(
      req.user._id,
      req.body,
    );
    sendSuccess(res, 201, "Account created.", { account });
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const account = await accountService.updateAccount(
      req.params.id,
      req.user._id,
      req.body,
    );
    sendSuccess(res, 200, "Account updated.", { account });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await accountService.deleteAccount(req.params.id, req.user._id);
    sendSuccess(res, 200, "Account deleted.", null);
  } catch (error) {
    next(error);
  }
};
