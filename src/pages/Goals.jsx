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
import GoalCard from "../components/goals/GoalCard";
import GoalForm from "../components/goals/GoalForm";

const MOCK_GOALS = [
  {
    id: "1",
    title: "New Laptop",
    targetAmount: 2000,
    savedAmount: 850,
    targetDate: "2024-06-01",
  },
  {
    id: "2",
    title: "Emergency Fund",
    targetAmount: 10000,
    savedAmount: 4500,
    targetDate: "2024-12-31",
  },
  {
    id: "3",
    title: "Summer Vacation",
    targetAmount: 3000,
    savedAmount: 3000,
    targetDate: "2023-08-15",
  },
];

export default function Goals() {
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleOpenAddDialog = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSubmit = (formData) => {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) => (g.id === editingGoal.id ? { ...g, ...formData } : g))
      );
    } else {
      setGoals((prev) => [
        { ...formData, id: Math.random().toString(36).substr(2, 9) },
        ...prev,
      ]);
    }
    setIsDialogOpen(false);
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

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="mt-4 text-lg font-semibold">No goals created</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't added any financial goals yet. Start saving by creating one!
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
              key={goal.id}
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
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
