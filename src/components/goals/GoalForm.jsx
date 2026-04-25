import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

export default function GoalForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "0",
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0], // Default 6 months from now
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        targetAmount: initialData.targetAmount || "",
        savedAmount: initialData.savedAmount || "0",
        targetDate: initialData.targetDate 
          ? new Date(initialData.targetDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
      });
    }
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
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          placeholder="e.g., Summer Vacation"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount ($)</Label>
          <Input
            id="targetAmount"
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
          <Label htmlFor="savedAmount">Currently Saved ($)</Label>
          <Input
            id="savedAmount"
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
        <Label htmlFor="targetDate">Target Date</Label>
        <Input
          id="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={(e) => handleChange("targetDate", e.target.value)}
          required
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Goal" : "Create Goal"}
        </Button>
      </DialogFooter>
    </form>
  );
}
