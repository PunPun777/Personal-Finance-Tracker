import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { TRANSACTION_CATEGORIES } from "../../constants/transactionCategories";

function buildFormState(data) {
  if (!data) {
    return {
      type: "expense",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      goalId: "",
    };
  }
  return {
    type: data.type || "expense",
    amount: data.amount || "",
    category: data.category || "",
    date: data.date
      ? new Date(data.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    description: data.description || "",
    goalId: data.goalId ?? "",
  };
}

/**
 * @param {Object}   props
 * @param {Object}   [props.initialData]    - transaction being edited
 * @param {boolean}  [props.isSubmitting]
 * @param {Array}    [props.goals]          - active goals for linking
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 */
export default function TransactionForm({
  initialData,
  isSubmitting = false,
  goals = [],
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => buildFormState(initialData));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(buildFormState(initialData));
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      // Send null when no goal selected so the backend clears the link
      goalId: formData.goalId || null,
    };
    onSubmit(payload);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Goal contributions are recorded as expenses (money allocated to the goal)
  const isExpense = formData.type === "expense";
  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tx-type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(val) => {
              handleChange("type", val);
              // Clear goal link when switching to income — goals require expense type
              if (val === "income") handleChange("goalId", "");
            }}
          >
            <SelectTrigger id="tx-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tx-amount">Amount</Label>
          <Input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tx-category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => handleChange("category", val)}
          >
            <SelectTrigger id="tx-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tx-date">Date</Label>
          <Input
            id="tx-date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-description">Description (Optional)</Label>
        <Input
          id="tx-description"
          placeholder="e.g., Salary deposit"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      {/* Goal linking — only shown for expense transactions when goals exist */}
      {isExpense && activeGoals.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="tx-goal">
            Link to Goal{" "}
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Select
            value={formData.goalId}
            onValueChange={(val) => handleChange("goalId", val === "none" ? "" : val)}
          >
            <SelectTrigger id="tx-goal">
              <SelectValue placeholder="Select a goal to contribute to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No goal</SelectItem>
              {activeGoals.map((g) => (
                <SelectItem key={g._id} value={g._id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Saving…
            </span>
          ) : initialData ? (
            "Update Transaction"
          ) : (
            "Add Transaction"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
