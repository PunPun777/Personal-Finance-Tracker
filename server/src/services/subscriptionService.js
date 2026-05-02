import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import ApiError from "../utils/ApiError.js";
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
const applyBalanceDelta = async (accountId, userId, delta) => {
  if (!accountId) return;

  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) return;

  if (account.balance + delta < 0) {
    throw new Error(
      `Insufficient balance in "${account.name}". ` +
        `Available: ₹${account.balance.toFixed(2)}, Required: ₹${Math.abs(delta).toFixed(2)}.`,
    );
  }

  await Account.updateOne(
    { _id: accountId },
    { $inc: { balance: delta } },
  );
};
export const getSubscriptions = async (userId) => {
  const subscriptions = await Subscription.find({ userId })
    .sort({ isActive: -1, nextBillingDate: 1 })
    .lean();
  return { subscriptions };
};
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
export const updateSubscription = async (subscriptionId, userId, updates) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, userId });

  if (!subscription) {
    throw new ApiError(
      "Subscription not found or you do not have permission to update it.",
      404,
    );
  }
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
  const dueIds = await Subscription.find(baseFilter).select("_id").lean();

  for (const { _id } of dueIds) {
        let continueLoop = true;

    while (continueLoop) {                        const sub = await Subscription.findOneAndUpdate(
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
        { new: false }, 
      );
      if (!sub) {
        break;
      }
      let createdTransaction = null;
      try {
        createdTransaction = await Transaction.create({
          userId: sub.userId,
          amount: sub.amount,
          type: "expense",
          category: sub.category,
          description: sub.description
            ? `[Auto] ${sub.description}`
            : `[Auto] ${sub.name}`,
          date: sub.nextBillingDate,
          accountId: sub.accountId || null,
        });

        await applyBalanceDelta(
          sub.accountId,
          sub.userId,
          -sub.amount,
        );

        processed++;
      } catch (err) {
        if (createdTransaction) {
          await Transaction.deleteOne({ _id: createdTransaction._id });
        }

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
        continueLoop = false;
      }
    }
  }

  return { processed, skipped, errors };
};
