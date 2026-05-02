import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED_SORT_FIELDS = ["date", "amount", "category", "createdAt"];

const balanceDelta = (type, amount) => (type === "income" ? amount : -amount);

const applyBalanceDelta = async (accountId, userId, delta) => {
  if (!accountId) return;

  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) {
    throw new ApiError("Account not found or does not belong to you.", 404);
  }

  if (account.balance + delta < 0) {
    throw new ApiError(
      `Insufficient balance in "${account.name}". ` +
        `Available: ₹${account.balance.toFixed(2)}, Required: ₹${Math.abs(delta).toFixed(2)}.`,
      400,
    );
  }

  await Account.updateOne(
    { _id: accountId, userId },
    { $inc: { balance: delta } },
  );
};

export const getTransactions = async (userId, query = {}) => {
  const {
    category,
    type,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20,
    sortBy = "date",
    order = "desc",
  } = query;

  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "date";
  const safeLimit = Math.min(Number(limit), 100);

  const filter = { userId };

  if (category) filter.category = category;
  if (type) filter.type = type;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (search) {
    filter.description = { $regex: search, $options: "i" };
  }

  const skip = (Number(page) - 1) * safeLimit;
  const sortOrder = order === "asc" ? 1 : -1;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ [safeSortBy]: sortOrder })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    page: Number(page),
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
};

export const createTransaction = async (userId, data) => {
  const transaction = await Transaction.create({ ...data, userId });

  try {
    await applyBalanceDelta(
      data.accountId,
      userId,
      balanceDelta(data.type, data.amount),
    );
  } catch (err) {
    await Transaction.deleteOne({ _id: transaction._id });
    throw err;
  }

  return transaction;
};

export const updateTransaction = async (transactionId, userId, updates) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId });

  if (!transaction) {
    throw new ApiError(
      "Transaction not found or you do not have permission to update it.",
      404,
    );
  }

  const oldAccountId = transaction.accountId;
  const oldType = transaction.type;
  const oldAmount = transaction.amount;
  const oldDelta = balanceDelta(oldType, oldAmount);

  const allowedFields = ["amount", "type", "category", "description", "date", "goalId", "accountId"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      transaction[field] = updates[field];
    }
  });

  await transaction.save();

  const newAccountId = transaction.accountId;
  const newDelta = balanceDelta(transaction.type, transaction.amount);

  const sameAccount = oldAccountId?.toString() === newAccountId?.toString();

  try {
    if (sameAccount) {
      const netDelta = newDelta - oldDelta;
      if (netDelta !== 0) {
        await applyBalanceDelta(newAccountId, userId, netDelta);
      }
    } else {
      if (oldAccountId) {
        await applyBalanceDelta(oldAccountId, userId, -oldDelta);
      }
      if (newAccountId) {
        await applyBalanceDelta(newAccountId, userId, newDelta);
      }
    }
  } catch (err) {
    const rollback = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) rollback[field] = updates[field];
    });
    rollback.accountId = oldAccountId;
    rollback.type = oldType;
    rollback.amount = oldAmount;
    await Transaction.updateOne({ _id: transactionId }, { $set: rollback });
    throw err;
  }

  return transaction;
};

export const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });

  if (!transaction) {
    throw new ApiError(
      "Transaction not found or you do not have permission to delete it.",
      404,
    );
  }

  if (transaction.accountId) {
    try {
      await applyBalanceDelta(
        transaction.accountId,
        userId,
        -balanceDelta(transaction.type, transaction.amount),
      );
    } catch (err) {
      await Transaction.create(transaction.toObject ? transaction.toObject() : transaction);
      throw err;
    }
  }

  return transaction;
};

export const getTransactionSummary = async (
  userId,
  { startDate, endDate } = {},
) => {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpense: 0, netBalance: 0 };
  result.forEach(({ _id, total }) => {
    if (_id === "income") summary.totalIncome = total;
    if (_id === "expense") summary.totalExpense = total;
  });
  summary.netBalance = summary.totalIncome - summary.totalExpense;

  return summary;
};
