import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED_SORT_FIELDS = ["date", "amount", "category", "createdAt"];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute the balance delta for an account given a transaction type and amount.
 *   income  → +amount  (money coming in)
 *   expense → -amount  (money going out)
 */
const balanceDelta = (type, amount) => (type === "income" ? amount : -amount);

/**
 * Atomically apply a delta to an account balance using $inc.
 * Rejects (throws 400) if the operation would push balance below 0.
 *
 * @param {ObjectId|string} accountId
 * @param {ObjectId|string} userId    - ownership guard
 * @param {number}          delta     - positive = increase, negative = decrease
 * @param {ClientSession}   session   - Mongoose session for atomicity
 */
const applyBalanceDelta = async (accountId, userId, delta, session) => {
  if (!accountId) return; // transaction not linked to any account — skip

  const account = await Account.findOne({ _id: accountId, userId }).session(session);
  if (!account) {
    throw new ApiError("Account not found or does not belong to you.", 404);
  }

  const newBalance = account.balance + delta;
  if (newBalance < 0) {
    throw new ApiError(
      `Insufficient balance in "${account.name}". ` +
        `Available: ₹${account.balance.toFixed(2)}, Required: ₹${Math.abs(delta).toFixed(2)}.`,
      400,
    );
  }

  // $inc is atomic — no read-modify-write race condition possible
  await Account.updateOne(
    { _id: accountId, userId },
    { $inc: { balance: delta } },
    { session },
  );
};

// ── Queries ───────────────────────────────────────────────────────────────────

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

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Create a transaction and atomically update the linked account balance.
 * Runs inside a MongoDB session to guarantee consistency.
 */
export const createTransaction = async (userId, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [transaction] = await Transaction.create(
      [{ ...data, userId }],
      { session },
    );

    await applyBalanceDelta(
      data.accountId,
      userId,
      balanceDelta(data.type, data.amount),
      session,
    );

    await session.commitTransaction();
    return transaction;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Update a transaction and reconcile the linked account balance.
 *
 * Reconciliation strategy:
 *   1. Reverse the OLD transaction's effect on the OLD account.
 *   2. Apply the NEW transaction's effect on the NEW account.
 *
 * This handles all edge cases:
 *   - amount changed  (same account, different magnitude)
 *   - type changed    (income ↔ expense flip)
 *   - account changed (move transaction between accounts)
 *   - account removed (set accountId = null)
 */
export const updateTransaction = async (transactionId, userId, updates) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, userId }).session(session);

    if (!transaction) {
      throw new ApiError(
        "Transaction not found or you do not have permission to update it.",
        404,
      );
    }

    // Snapshot the old values BEFORE applying updates
    const oldAccountId = transaction.accountId;
    const oldDelta = balanceDelta(transaction.type, transaction.amount);

    const allowedFields = ["amount", "type", "category", "description", "date", "goalId", "accountId"];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        transaction[field] = updates[field];
      }
    });

    await transaction.save({ session });

    const newAccountId = transaction.accountId;
    const newDelta = balanceDelta(transaction.type, transaction.amount);

    const sameAccount =
      oldAccountId?.toString() === newAccountId?.toString();

    if (sameAccount) {
      // Same account: apply the net difference in a single $inc
      const netDelta = newDelta - oldDelta;
      if (netDelta !== 0) {
        await applyBalanceDelta(newAccountId, userId, netDelta, session);
      }
    } else {
      // Different accounts: reverse old, apply new independently
      if (oldAccountId) {
        await applyBalanceDelta(oldAccountId, userId, -oldDelta, session);
      }
      if (newAccountId) {
        await applyBalanceDelta(newAccountId, userId, newDelta, session);
      }
    }

    await session.commitTransaction();
    return transaction;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Delete a transaction and atomically reverse its balance effect.
 */
export const deleteTransaction = async (transactionId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.findOneAndDelete(
      { _id: transactionId, userId },
      { session },
    );

    if (!transaction) {
      throw new ApiError(
        "Transaction not found or you do not have permission to delete it.",
        404,
      );
    }

    // Reverse the balance effect
    if (transaction.accountId) {
      await applyBalanceDelta(
        transaction.accountId,
        userId,
        -balanceDelta(transaction.type, transaction.amount),
        session,
      );
    }

    await session.commitTransaction();
    return transaction;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ── Summary ───────────────────────────────────────────────────────────────────

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
