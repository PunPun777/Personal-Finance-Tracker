import Account from "../models/Account.js";
import ApiError from "../utils/ApiError.js";

/**
 * Return all accounts for a user, sorted by creation date.
 */
export const getAccounts = async (userId) => {
  const accounts = await Account.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return { accounts };
};

/**
 * Return a single account by id — enforces ownership.
 */
export const getAccountById = async (accountId, userId) => {
  const account = await Account.findOne({ _id: accountId, userId }).lean();
  if (!account) {
    throw new ApiError(
      "Account not found or you do not have permission to view it.",
      404,
    );
  }
  return account;
};

/**
 * Create a new account.
 * Throws 409 if the user already has an account with the same name.
 */
export const createAccount = async (userId, data) => {
  const { name, type, balance, currency } = data;

  const existing = await Account.findOne({ userId, name: name.trim() });
  if (existing) {
    throw new ApiError(
      `You already have an account named "${name}". Choose a different name.`,
      409,
    );
  }

  const account = await Account.create({
    userId,
    name: name.trim(),
    ...(type !== undefined && { type }),
    ...(balance !== undefined && { balance }),
    ...(currency !== undefined && { currency: currency.toUpperCase() }),
  });

  return account;
};

/**
 * Update an existing account.
 * - name, type, balance, currency, isActive are mutable.
 * - Changing name checks for duplicates.
 */
export const updateAccount = async (accountId, userId, updates) => {
  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new ApiError(
      "Account not found or you do not have permission to update it.",
      404,
    );
  }

  // If renaming, ensure no duplicate name exists for this user
  if (updates.name !== undefined && updates.name.trim() !== account.name) {
    const duplicate = await Account.findOne({
      userId,
      name: updates.name.trim(),
      _id: { $ne: accountId },
    });
    if (duplicate) {
      throw new ApiError(
        `You already have an account named "${updates.name}". Choose a different name.`,
        409,
      );
    }
  }

  const allowedFields = ["name", "type", "balance", "currency", "isActive"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      account[field] =
        field === "name" ? updates[field].trim()
        : field === "currency" ? updates[field].toUpperCase()
        : updates[field];
    }
  });

  await account.save();
  return account;
};

/**
 * Delete an account by id — enforces ownership.
 */
export const deleteAccount = async (accountId, userId) => {
  const account = await Account.findOneAndDelete({ _id: accountId, userId });

  if (!account) {
    throw new ApiError(
      "Account not found or you do not have permission to delete it.",
      404,
    );
  }

  return account;
};
