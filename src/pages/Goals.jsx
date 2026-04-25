import { useState, useRef, useCallback } from "react";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoalCard from "../components/goals/GoalCard";
import GoalForm from "../components/goals/GoalForm";
import { useGoals } from "../hooks/useGoals";

function GoalCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-6 space-y-4">
        <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="space-y-2 pt-4">
          <div className="flex justify-between">
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-6 w-1/4 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Goals() {
  const { goals, isLoading, isSubmitting, error, create, update, remove, reload } = useGoals();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const showFeedback = useCallback((message, type = "error") => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ message, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  const handleOpenAddDialog = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await remove(id);
    if (!result.success) showFeedback(result.message);
  };

  const handleSubmit = async (formData) => {
    const result = editingGoal
      ? await update(editingGoal._id, formData)
      : await create(formData);

    if (result.success) {
      setIsDialogOpen(false);
      showFeedback(
        editingGoal ? "Goal updated." : "Goal created.",
        "success"
      );
    } else {
      showFeedback(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your savings goals.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Goal
        </Button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {feedback.message}
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center justify-between gap-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={reload} className="gap-2 shrink-0">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="mt-4 text-lg font-semibold">No goals created</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t added any financial goals yet. Start saving by creating one!
          </p>
          <Button onClick={handleOpenAddDialog} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={handleOpenEditDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
            <DialogDescription>
              {editingGoal
                ? "Update your progress and target details."
                : "Set a new financial target to track your progress."}
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            initialData={editingGoal}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
