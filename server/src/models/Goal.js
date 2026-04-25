import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be at least 1"],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, "Saved amount cannot be negative"],
    },
    targetDate: {
      type: Date,
      required: [true, "Target date is required"],
    },
    monthlyContribution: {
      type: Number,
      default: null,
      min: [0, "Monthly contribution cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

goalSchema.virtual("progressPercent").get(function () {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  const pct = (this.savedAmount / this.targetAmount) * 100;
  return Math.min(Math.round(pct * 100) / 100, 100);
});

goalSchema.virtual("remainingAmount").get(function () {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});

goalSchema.virtual("feasibilityStatus").get(function () {
  if (!this.targetDate) return "unknown";

  const now = new Date();
  const monthsRemaining =
    (this.targetDate.getFullYear() - now.getFullYear()) * 12 +
    (this.targetDate.getMonth() - now.getMonth());

  if (monthsRemaining <= 0) {
    return this.savedAmount >= this.targetAmount
      ? "completed"
      : "not_achievable";
  }

  if (!this.monthlyContribution) return "unknown";

  const monthlySavingsNeeded = this.remainingAmount / monthsRemaining;

  if (this.monthlyContribution >= monthlySavingsNeeded) return "on_track";
  if (this.monthlyContribution >= monthlySavingsNeeded * 0.75) return "at_risk";
  return "not_achievable";
});

goalSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
