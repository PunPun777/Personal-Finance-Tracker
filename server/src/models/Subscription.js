import mongoose from "mongoose";
import { TRANSACTION_CATEGORIES } from "./Transaction.js";

const BILLING_CYCLES = ["daily", "weekly", "monthly", "quarterly", "yearly"];

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subscription name is required."],
      trim: true,
      minlength: [2, "Subscription name must be at least 2 characters."],
      maxlength: [100, "Subscription name cannot exceed 100 characters."],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
      min: [0.01, "Amount must be greater than 0."],
    },
    billingCycle: {
      type: String,
      required: [true, "Billing cycle is required."],
      enum: {
        values: BILLING_CYCLES,
        message: `Billing cycle must be one of: ${BILLING_CYCLES.join(", ")}`,
      },
      default: "monthly",
    },
    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: {
        values: TRANSACTION_CATEGORIES,
        message: `Category must be one of: ${TRANSACTION_CATEGORIES.join(", ")}`,
      },
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters."],
      default: "",
    },
        lastProcessedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
subscriptionSchema.index({ userId: 1, name: 1 }, { unique: true });
subscriptionSchema.index({ isActive: 1, nextBillingDate: 1 }); 

subscriptionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export { BILLING_CYCLES };

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
