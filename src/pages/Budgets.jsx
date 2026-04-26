import { useState, useRef, useCallback } from "react";
import { Plus, Wallet } from "lucide-react";
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
import BudgetCard, { BudgetCardSkeleton } from "../components/budgeting/BudgetCard";
import BudgetForm from "../components/budgeting/BudgetForm";
import { useBudgets } from "../hooks/useBudgets";
import { ErrorBanner, FeedbackBanner } from "../components/ui/Banners";


export default function Budgets() {
  const { budgets, isLoading, isSubmitting, error, create, update, remove, reload } =
    useBudgets();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const showFeedback = useCallback((message, type = "error") => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ message, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const result = await remove(deletingId);
    setDeletingId(null);
    if (!result.success) showFeedback(result.message);
    else showFeedback("Budget deleted.", "success");
  };

  const handleSubmit = async (formData) => {
    const result = editingBudget
      ? await update(editingBudget._id, formData)
      : await create(formData);

    if (result.success) {
      setIsDialogOpen(false);
      showFeedback(
        editingBudget ? "Budget updated." : "Budget created.",
        "success"
      );
    } else {
      showFeedback(result.message);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set and track your monthly spending limits.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <FeedbackBanner feedback={feedback} />
      <ErrorBanner message={!isLoading ? error : null} onRetry={reload} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BudgetCardSkeleton key={i} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No budgets yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Start by creating an overall monthly budget or set limits for specific categories.
          </p>
          <Button onClick={handleOpenAdd}>Create your first budget</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
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
              {editingBudget ? "Edit Budget" : "Create Budget"}
            </DialogTitle>
            <DialogDescription>
              {editingBudget
                ? "Update your spending limit for this category."
                : "Set a new monthly spending limit."}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            initialData={editingBudget}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The budget limit will be permanently removed.
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
