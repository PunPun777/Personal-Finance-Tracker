import mongoose from "mongoose";

const ACCOUNT_TYPES = ["Wallet", "Bank", "Credit Card", "Savings", "Investment", "Other"];

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Account name is required."],
      trim: true,
      minlength: [2, "Account name must be at least 2 characters."],
      maxlength: [50, "Account name cannot exceed 50 characters."],
    },
    type: {
      type: String,
      required: [true, "Account type is required."],
      enum: {
        values: ACCOUNT_TYPES,
        message: `Account type must be one of: ${ACCOUNT_TYPES.join(", ")}`,
      },
      default: "Bank",
    },
    balance: {
      type: Number,
      required: [true, "Balance is required."],
      default: 0,
      min: [0, "Balance cannot be negative."],
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
      maxlength: [3, "Currency code must be 3 characters (e.g. INR)."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
accountSchema.index({ userId: 1, name: 1 }, { unique: true });

accountSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export { ACCOUNT_TYPES };

const Account = mongoose.model("Account", accountSchema);
export default Account;
