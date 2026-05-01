import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
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

/**
 * Atomically apply a balance delta to a linked account using $inc.
 * Rejects (throws) if the operation would push the balance below 0.
 *
 * @param {ObjectId|string|null} accountId
 * @param {ObjectId|string}      userId
 * @param {number}               delta  — negative for expenses
 * @param {ClientSession}        session
 */
const applyBalanceDelta = async (accountId, userId, delta, session) => {
  if (!accountId) return; // no account linked — skip

  const account = await Account.findOne({ _id: accountId, userId }).session(session);
  if (!account) return; // account deleted since subscription was created — skip silently

  if (account.balance + delta < 0) {
    throw new Error(
      `Insufficient balance in "${account.name}". ` +
        `Available: ₹${account.balance.toFixed(2)}, Required: ₹${Math.abs(delta).toFixed(2)}.`,
    );
  }

  await Account.updateOne(
    { _id: accountId },
    { $inc: { balance: delta } },
    { session },
  );
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
 * Process all due subscriptions.
 *
 * Design:
 *
 * 1. IDEMPOTENCY
 *    Uses findOneAndUpdate with a conditional filter (nextBillingDate: { $lte: now })
 *    to atomically "claim" a subscription before processing it. If two concurrent
 *    calls race, only one will get the document back — the other receives null and
 *    skips. This prevents double-billing even under concurrent execution.
 *
 * 2. MISSED CYCLES
 *    A subscription overdue for multiple cycles (e.g. 3 months) is processed in a
 *    loop — one transaction per missed cycle — until nextBillingDate advances past
 *    now. Each cycle runs in its own session.
 *
 * 3. ACCOUNT BALANCE
 *    If the subscription has an accountId, the account balance is debited atomically
 *    within the same session as the transaction. Insufficient balance aborts the
 *    session and rolls back the nextBillingDate advance.
 *
 * 4. SCOPE
 *    Pass userId to process only that user's subscriptions.
 *    Pass null to process all users (intended for cron jobs).
 *
 * @param {string|null} userId
 * @returns {Promise<{ processed: number, skipped: number, errors: string[] }>}
 */
export const processDueSubscriptions = async (userId = null) => {
  const now = new Date();

  const baseFilter = {
    isActive: true,
    nextBillingDate: { $lte: now },
  };
  if (userId) baseFilter.userId = new mongoose.Types.ObjectId(userId);

  let processed = 0;
  let skipped = 0;
  const errors = [];

  // Fetch IDs of all due subscriptions upfront (lightweight — IDs only)
  const dueIds = await Subscription.find(baseFilter).select("_id").lean();

  for (const { _id } of dueIds) {
    // ── Missed-cycle loop ────────────────────────────────────────────────────
    // Repeat until nextBillingDate has advanced past now (handles missed cycles).
    let continueLoop = true;

    while (continueLoop) {
      // ── Atomic claim + advance ─────────────────────────────────────────────
      // Atomically reads the current document AND advances nextBillingDate by
      // one cycle using a MongoDB aggregation pipeline update ($switch + $dateAdd).
      // The filter's nextBillingDate: { $lte: now } condition means:
      //   - If another process already advanced it → returns null → we stop.
      //   - If nextBillingDate is now past today after advancing → the NEXT
      //     loop iteration will return null → loop terminates naturally.
      const sub = await Subscription.findOneAndUpdate(
        {
          _id,
          isActive: true,
          nextBillingDate: { $lte: now },
        },
        [
          {
            $set: {
              lastProcessedDate: now,
              nextBillingDate: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$billingCycle", "daily"] },
                      then: { $dateAdd: { startDate: "$nextBillingDate", unit: "day", amount: 1 } },
                    },
                    {
                      case: { $eq: ["$billingCycle", "weekly"] },
                      then: { $dateAdd: { startDate: "$nextBillingDate", unit: "week", amount: 1 } },
                    },
                    {
                      case: { $eq: ["$billingCycle", "monthly"] },
                      then: { $dateAdd: { startDate: "$nextBillingDate", unit: "month", amount: 1 } },
                    },
                    {
                      case: { $eq: ["$billingCycle", "quarterly"] },
                      then: { $dateAdd: { startDate: "$nextBillingDate", unit: "month", amount: 3 } },
                    },
                    {
                      case: { $eq: ["$billingCycle", "yearly"] },
                      then: { $dateAdd: { startDate: "$nextBillingDate", unit: "year", amount: 1 } },
                    },
                  ],
                  default: { $dateAdd: { startDate: "$nextBillingDate", unit: "month", amount: 1 } },
                },
              },
            },
          },
        ],
        { new: false }, // return the ORIGINAL document (pre-update values)
      );

      // null → already claimed by a concurrent caller, or no longer due
      if (!sub) {
        break;
      }

      // ── Session: create transaction + debit account ────────────────────────
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Create the auto-expense transaction
        await Transaction.create(
          [
            {
              userId: sub.userId,
              amount: sub.amount,
              type: "expense",
              category: sub.category,
              description: sub.description
                ? `[Auto] ${sub.description}`
                : `[Auto] ${sub.name}`,
              date: sub.nextBillingDate, // original billing date as transaction date
              accountId: sub.accountId || null,
            },
          ],
          { session },
        );

        // Atomically debit the linked account (if any)
        await applyBalanceDelta(
          sub.accountId,
          sub.userId,
          -sub.amount,
          session,
        );

        await session.commitTransaction();
        processed++;
      } catch (err) {
        await session.abortTransaction();

        // Roll back the nextBillingDate advance so the subscription stays due
        // for the next run (human can fix the issue — e.g. top up balance)
        await Subscription.updateOne(
          { _id: sub._id },
          {
            $set: {
              nextBillingDate: sub.nextBillingDate,
              lastProcessedDate: sub.lastProcessedDate ?? null,
            },
          },
        );

        errors.push(`[${sub.name}] ${err.message}`);
        skipped++;
        continueLoop = false; // don't retry this subscription this run
      } finally {
        session.endSession();
      }
    }
  }

  return { processed, skipped, errors };
};
