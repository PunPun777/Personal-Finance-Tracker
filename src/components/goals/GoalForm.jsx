import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

function defaultDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}

function buildFormState(data) {
  if (!data) {
    return { title: "", targetAmount: "", savedAmount: "0", targetDate: defaultDate() };
  }
  return {
    title: data.title || "",
    targetAmount: data.targetAmount || "",
    savedAmount: data.savedAmount ?? "0",
    targetDate: data.targetDate
      ? new Date(data.targetDate).toISOString().split("T")[0]
      : defaultDate(),
  };
}

export default function GoalForm({ initialData, isSubmitting = false, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => buildFormState(initialData));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(buildFormState(initialData));
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: Number(formData.targetAmount),
      savedAmount: Number(formData.savedAmount),
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="goal-title">Goal Title</Label>
        <Input
          id="goal-title"
          placeholder="e.g., Summer Vacation"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="goal-target-amount">Target Amount ($)</Label>
          <Input
            id="goal-target-amount"
            type="number"
            step="1"
            min="1"
            placeholder="5000"
            value={formData.targetAmount}
            onChange={(e) => handleChange("targetAmount", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-saved-amount">Currently Saved ($)</Label>
          <Input
            id="goal-saved-amount"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={formData.savedAmount}
            onChange={(e) => handleChange("savedAmount", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-target-date">Target Date</Label>
        <Input
          id="goal-target-date"
          type="date"
          value={formData.targetDate}
          onChange={(e) => handleChange("targetDate", e.target.value)}
          required
        />
      </div>

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
            "Update Goal"
          ) : (
            "Create Goal"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
