import { useState, useRef, useCallback } from "react";
import { Plus, Repeat, PlayCircle } from "lucide-react";
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
import SubscriptionCard, { SubscriptionCardSkeleton } from "../components/subscriptions/SubscriptionCard";
import SubscriptionForm from "../components/subscriptions/SubscriptionForm";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useAccounts } from "../hooks/useAccounts";
import { ErrorBanner, FeedbackBanner } from "../components/ui/Banners";

export default function Subscriptions() {
  const {
    subscriptions,
    isLoading: isSubsLoading,
    isSubmitting,
    error: subsError,
    create,
    update,
    remove,
    processDue,
    reload: reloadSubs,
  } = useSubscriptions();

  const { accounts, isLoading: isAccsLoading, error: accsError, reload: reloadAccs } = useAccounts();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const showFeedback = useCallback((message, type = "error") => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ message, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  const handleOpenAdd = () => {
    setEditingSubscription(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (subscription) => {
    setEditingSubscription(subscription);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    const result = editingSubscription
      ? await update(editingSubscription._id, formData)
      : await create(formData);

    if (result.success) {
      setIsDialogOpen(false);
      showFeedback(
        editingSubscription ? "Subscription updated." : "Subscription created.",
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
    else showFeedback("Subscription deleted.", "success");
  };

  const handleProcessDue = async () => {
    const result = await processDue();
    if (result.success) {
      const msg = `Processed: ${result.data.processed}, Skipped: ${result.data.skipped}`;
      showFeedback(msg, "success");
    } else {
      showFeedback(result.message);
    }
  };

  const isLoading = isSubsLoading || isAccsLoading;
  const error = subsError || accsError;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your recurring expenses and bills.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleProcessDue} disabled={isSubmitting} className="gap-2 shrink-0">
            <PlayCircle className="h-4 w-4" />
            Process Due
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Banners */}
      <FeedbackBanner feedback={feedback} />
      <ErrorBanner message={!isLoading ? error : null} onRetry={() => { reloadSubs(); reloadAccs(); }} />

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SubscriptionCardSkeleton key={i} />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Repeat className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No subscriptions yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Add your first subscription to start tracking recurring payments like Netflix, Spotify, or your gym membership.
          </p>
          <Button onClick={handleOpenAdd}>Add your first subscription</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subscriptions.map((subscription) => {
            const account = accounts.find((acc) => acc._id === subscription.accountId);
            return (
              <SubscriptionCard
                key={subscription._id}
                subscription={subscription}
                accountName={account?.name}
                onEdit={handleOpenEdit}
                onDelete={setDeletingId}
              />
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => { if (!isSubmitting) setIsDialogOpen(open); }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubscription ? "Edit Subscription" : "Add Subscription"}
            </DialogTitle>
            <DialogDescription>
              {editingSubscription
                ? "Update your subscription details below."
                : "Enter the details for your new recurring payment."}
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm
            initialData={editingSubscription}
            accounts={accounts}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The subscription will be permanently removed.
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
