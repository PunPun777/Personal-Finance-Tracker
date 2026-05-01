import mongoose from "mongoose";
import { TRANSACTION_CATEGORIES } from "./Transaction.js";

// "Overall Monthly" is a synthetic category used by the frontend
// to represent a single cap across all spending.
const BUDGET_CATEGORIES = ["Overall Monthly", ...TRANSACTION_CATEGORIES];

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: {
        values: TRANSACTION_CATEGORIES,
        message: `Category must be one of: ${TRANSACTION_CATEGORIES.join(", ")}`,
      },
    },
    limit: {
      type: Number,
      required: [true, "Limit is required."],
      min: [0.01, "Limit must be greater than 0."],
    },
  },
  { _id: false },
);

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Budget category is required."],
      enum: {
        values: BUDGET_CATEGORIES,
        message: `Category must be one of: ${BUDGET_CATEGORIES.join(", ")}`,
      },
    },
    limit: {
      type: Number,
      required: [true, "Budget limit is required."],
      min: [0.01, "Limit must be greater than 0."],
    },
    // Optional nested breakdown (e.g. when category = "Overall Monthly")
    categoryBudgets: {
      type: [categoryBudgetSchema],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// A user may only have one budget per category (e.g. one "Food & Dining" budget).
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

budgetSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export { BUDGET_CATEGORIES };

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
