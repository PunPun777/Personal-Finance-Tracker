import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Calculate the next billing date after a given date based on the billing cycle.
 *
 * @param {Date}   fromDate
 * @param {string} billingCycle
 * @returns {Date}
 */
export const computeNextBillingDate = (fromDate, billingCycle) => {
  const d = new Date(fromDate);
  switch (billingCycle) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
};

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Return all subscriptions for a user, active ones first.
 */
export const getSubscriptions = async (userId) => {
  const subscriptions = await Subscription.find({ userId })
    .sort({ isActive: -1, nextBillingDate: 1 })
    .lean();
  return { subscriptions };
};

/**
 * Return a single subscription by id — enforces ownership.
 */
export const getSubscriptionById = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    userId,
  }).lean();

  if (!subscription) {
    throw new ApiError(
      "Subscription not found or you do not have permission to view it.",
      404,
    );
  }
  return subscription;
};

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Create a new subscription.
 * Throws 409 if the user already has a subscription with the same name.
 */
export const createSubscription = async (userId, data) => {
  const { name, amount, billingCycle, nextBillingDate, category, accountId, description } = data;

  const existing = await Subscription.findOne({ userId, name: name.trim() });
  if (existing) {
    throw new ApiError(
      `You already have a subscription named "${name}". Use a different name or edit the existing one.`,
      409,
    );
  }

  const subscription = await Subscription.create({
    userId,
    name: name.trim(),
    amount,
    billingCycle: billingCycle || "monthly",
    nextBillingDate: new Date(nextBillingDate),
    category,
    accountId: accountId || null,
    description: description || "",
  });

  return subscription;
};

/**
 * Update an existing subscription.
 * Mutable fields: name, amount, billingCycle, nextBillingDate, category, accountId, description, isActive.
 * Renaming checks for duplicate names.
 */
export const updateSubscription = async (subscriptionId, userId, updates) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, userId });

  if (!subscription) {
    throw new ApiError(
      "Subscription not found or you do not have permission to update it.",
      404,
    );
  }

  // Duplicate name check on rename
  if (updates.name !== undefined && updates.name.trim() !== subscription.name) {
    const duplicate = await Subscription.findOne({
      userId,
      name: updates.name.trim(),
      _id: { $ne: subscriptionId },
    });
    if (duplicate) {
      throw new ApiError(
        `You already have a subscription named "${updates.name}". Choose a different name.`,
        409,
      );
    }
  }

  const allowedFields = [
    "name", "amount", "billingCycle", "nextBillingDate",
    "category", "accountId", "description", "isActive",
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      subscription[field] =
        field === "name" ? updates[field].trim()
        : field === "nextBillingDate" ? new Date(updates[field])
        : updates[field];
    }
  });

  await subscription.save();
  return subscription;
};

/**
 * Delete a subscription — enforces ownership.
 */
export const deleteSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOneAndDelete({
    _id: subscriptionId,
    userId,
  });

  if (!subscription) {
    throw new ApiError(
      "Subscription not found or you do not have permission to delete it.",
      404,
    );
  }

  return subscription;
};

// ── Recurring Processor ───────────────────────────────────────────────────────

/**
 * Process all due subscriptions for a specific user (or all users if userId is omitted).
 *
 * For each subscription where:
 *   - isActive === true
 *   - nextBillingDate <= now
 *
 * This function will:
 *   1. Create an expense transaction for the subscription amount.
 *   2. Advance nextBillingDate by one billing cycle.
 *   3. Update lastProcessedDate to now (double-billing guard).
 *
 * Runs each subscription in its own MongoDB session for atomicity.
 * Returns a summary: { processed, skipped, errors[] }
 *
 * NOTE: This function is intentionally NOT scheduled here. Wire it into
 * a cron job, a startup check, or an on-demand API endpoint separately.
 *
 * @param {string|null} userId  Scope to a single user, or null for all users.
 * @returns {Promise<{ processed: number, skipped: number, errors: string[] }>}
 */
export const processDueSubscriptions = async (userId = null) => {
  const now = new Date();

  const filter = {
    isActive: true,
    nextBillingDate: { $lte: now },
  };
  if (userId) filter.userId = userId;

  const dueSubscriptions = await Subscription.find(filter).lean();

  let processed = 0;
  let skipped = 0;
  const errors = [];

  for (const sub of dueSubscriptions) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create the expense transaction
      await Transaction.create(
        [
          {
            userId: sub.userId,
            amount: sub.amount,
            type: "expense",
            category: sub.category,
            description: sub.description
              ? `[Auto] ${sub.description}`
              : `[Auto] ${sub.name} subscription`,
            date: now,
            accountId: sub.accountId || null,
          },
        ],
        { session },
      );

      // Advance to the next billing date and record last processed date
      const nextDate = computeNextBillingDate(sub.nextBillingDate, sub.billingCycle);
      await Subscription.updateOne(
        { _id: sub._id },
        {
          $set: {
            nextBillingDate: nextDate,
            lastProcessedDate: now,
          },
        },
        { session },
      );

      await session.commitTransaction();
      processed++;
    } catch (err) {
      await session.abortTransaction();
      errors.push(`[${sub.name}] ${err.message}`);
      skipped++;
    } finally {
      session.endSession();
    }
  }

  return { processed, skipped, errors };
};
