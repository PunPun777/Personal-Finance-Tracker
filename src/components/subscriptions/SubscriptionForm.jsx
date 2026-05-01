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
import { BILLING_CYCLES } from "../../constants/subscriptionCycles";

function buildFormState(data) {
  if (!data) {
    return {
      name: "",
      amount: "",
      billingCycle: "monthly",
      nextBillingDate: new Date().toISOString().split("T")[0],
      category: "",
      accountId: "",
      description: "",
      isActive: true,
    };
  }
  return {
    name: data.name || "",
    amount: data.amount || "",
    billingCycle: data.billingCycle || "monthly",
    nextBillingDate: data.nextBillingDate
      ? new Date(data.nextBillingDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: data.category || "",
    accountId: data.accountId ?? "",
    description: data.description || "",
    isActive: data.isActive ?? true,
  };
}

export default function SubscriptionForm({
  initialData,
  isSubmitting = false,
  accounts = [],
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => buildFormState(initialData));

  useEffect(() => {    setFormData(buildFormState(initialData));
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      accountId: formData.accountId || null,
    };
    onSubmit(payload);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sub-name">Name</Label>
          <Input
            id="sub-name"
            placeholder="e.g., Netflix"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-amount">Amount</Label>
          <Input
            id="sub-amount"
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
          <Label htmlFor="sub-billing-cycle">Billing Cycle</Label>
          <Select
            value={formData.billingCycle}
            onValueChange={(val) => handleChange("billingCycle", val)}
          >
            <SelectTrigger id="sub-billing-cycle">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((cycle) => (
                <SelectItem key={cycle} value={cycle}>
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-next-date">Next Billing Date</Label>
          <Input
            id="sub-next-date"
            type="date"
            value={formData.nextBillingDate}
            onChange={(e) => handleChange("nextBillingDate", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sub-category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => handleChange("category", val)}
          >
            <SelectTrigger id="sub-category">
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
          <Label htmlFor="sub-account">
            Link to Account{" "}
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Select
            value={formData.accountId}
            onValueChange={(val) => handleChange("accountId", val === "none" ? "" : val)}
          >
            <SelectTrigger id="sub-account">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No account</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc._id} value={acc._id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sub-description">Description (Optional)</Label>
        <Input
          id="sub-description"
          placeholder="e.g., Family plan"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          maxLength={300}
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
            "Update Subscription"
          ) : (
            "Add Subscription"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
