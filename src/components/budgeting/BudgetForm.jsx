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
import { OVERALL_BUDGET_CATEGORY } from "../../constants/budgetCategories";

const BUDGET_CATEGORIES = [OVERALL_BUDGET_CATEGORY, ...TRANSACTION_CATEGORIES];

const EMPTY_FORM = { category: "", limit: "" };

export default function BudgetForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {    setFormData(
      initialData
        ? { category: initialData.category ?? "", limit: initialData.limit ?? "" }
        : EMPTY_FORM
    );
    setCategoryError("");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) {
      setCategoryError("Please select a category.");
      return;
    }
    setCategoryError("");
    onSubmit({ ...formData, limit: Number(formData.limit) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="budget-category">Budget Category</Label>
        <Select
          value={formData.category}
          onValueChange={(val) => {
            setFormData({ ...formData, category: val });
            setCategoryError("");
          }}
          disabled={!!initialData}
        >
          <SelectTrigger id="budget-category" className={categoryError ? "border-destructive" : ""}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoryError && (
          <p className="text-xs text-destructive">{categoryError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-limit">Monthly Limit (₹)</Label>
        <Input
          id="budget-limit"
          type="number"
          step="0.01"
          min="1"
          placeholder="e.g., 5000"
          value={formData.limit}
          onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
          required
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Budget" : "Set Budget"}
        </Button>
      </DialogFooter>
    </form>
  );
}
