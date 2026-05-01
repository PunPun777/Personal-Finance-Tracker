import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AccountCard from "../components/accounts/AccountCard";
import AccountForm from "../components/accounts/AccountForm";

// Mock data to be replaced with real backend connection
const INITIAL_ACCOUNTS = [
  { _id: "1", name: "Main Bank", type: "Bank", balance: 50000, currency: "INR", isActive: true },
  { _id: "2", name: "Cash Wallet", type: "Wallet", balance: 1500, currency: "INR", isActive: true },
];

export default function Accounts() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (account) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData) => {
    if (editingAccount) {
      setAccounts(accounts.map(acc => 
        acc._id === editingAccount._id ? { ...acc, ...formData } : acc
      ));
    } else {
      const newAccount = {
        _id: Math.random().toString(36).substr(2, 9),
        ...formData,
        isActive: true,
        currency: "INR"
      };
      setAccounts([...accounts, newAccount]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter(acc => acc._id !== id));
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank and cash accounts here.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {accounts.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No accounts found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You haven't added any accounts yet. Create your first account to start tracking your balances.
          </p>
          <Button onClick={handleOpenCreate} className="bg-gradient-primary">
            Add Account
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Account" : "Add New Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Update your account details below."
                : "Enter the details for your new account."}
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            account={editingAccount}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
