import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { ACCOUNT_TYPES } from "../../constants/accountTypes";

export default function AccountForm({ account, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: account?.name || "",
    type: account?.type || "Bank",
    balance: account?.balance || 0,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="acc-name">Account Name</Label>
        <Input
          id="acc-name"
          placeholder="e.g. Main Bank, Cash Wallet"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="acc-type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(val) => handleChange("type", val)}
          >
            <SelectTrigger id="acc-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="acc-balance">Current Balance (₹)</Label>
          <Input
            id="acc-balance"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.balance}
            onChange={(e) => handleChange("balance", parseFloat(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{account ? "Saving..." : "Adding..."}</>
          ) : (
            account ? "Update Account" : "Add Account"
          )}
        </Button>
      </div>
    </form>
  );
}
