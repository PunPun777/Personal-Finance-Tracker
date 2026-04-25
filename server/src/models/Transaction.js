import mongoose from "mongoose";

const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Housing & Rent",
  "Utilities",
  "Education",
  "Travel",
  "Personal Care",
  "Investments",
  "Salary",
  "Freelance",
  "Business",
  "Other",
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: 'Type must be either "income" or "expense"',
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: TRANSACTION_CATEGORIES,
        message: `Category must be one of: ${TRANSACTION_CATEGORIES.join(", ")}`,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

transactionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export { TRANSACTION_CATEGORIES };

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
