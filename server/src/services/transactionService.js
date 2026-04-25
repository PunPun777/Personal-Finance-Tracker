import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED_SORT_FIELDS = ["date", "amount", "category", "createdAt"];

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

  const allowedFields = ["amount", "type", "category", "description", "date"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      transaction[field] = updates[field];
    }
  });

  await transaction.save();
  return transaction;
};

export const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new ApiError(
      "Transaction not found or you do not have permission to delete it.",
      404,
    );
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
