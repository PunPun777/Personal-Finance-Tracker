import { useState, useRef, useCallback } from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AccountCard, { AccountCardSkeleton } from "../components/accounts/AccountCard";
import AccountForm from "../components/accounts/AccountForm";
import { useAccounts } from "../hooks/useAccounts";
import { ErrorBanner, FeedbackBanner } from "../components/ui/Banners";

export default function Accounts() {
  const { accounts, isLoading, isSubmitting, error, create, update, remove, reload } =
    useAccounts();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const showFeedback = useCallback((message, type = "error") => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ message, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (account) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    const result = editingAccount
      ? await update(editingAccount._id, formData)
      : await create(formData);

    if (result.success) {
      setIsDialogOpen(false);
      showFeedback(
        editingAccount ? "Account updated." : "Account created.",
        "success"
      );
    } else {
      showFeedback(result.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const result = await remove(deletingId);
    setDeletingId(null);
    if (!result.success) showFeedback(result.message);
    else showFeedback("Account deleted.", "success");
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank and cash accounts.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <FeedbackBanner feedback={feedback} />
      <ErrorBanner message={!isLoading ? error : null} onRetry={reload} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AccountCardSkeleton key={i} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No accounts yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Add your first account to start tracking balances across your bank, wallet, and savings.
          </p>
          <Button onClick={handleOpenAdd}>Add your first account</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onEdit={handleOpenEdit}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => { if (!isSubmitting) setIsDialogOpen(open); }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Account" : "Add Account"}
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
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The account will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
