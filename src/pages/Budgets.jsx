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
import BudgetCard from "../components/budgeting/BudgetCard";
import BudgetForm from "../components/budgeting/BudgetForm";

// Temporary Mock Data for UI presentation
const MOCK_BUDGETS = [
  {
    _id: "b1",
    category: "Overall Monthly",
    limit: 4000,
    spent: 2850,
  },
  {
    _id: "b2",
    category: "Food & Dining",
    limit: 800,
    spent: 850, // Over budget mock
  },
  {
    _id: "b3",
    category: "Transportation",
    limit: 400,
    spent: 320, // Warning mock (80%)
  },
  {
    _id: "b4",
    category: "Entertainment",
    limit: 200,
    spent: 45, // Safe mock
  },
];

export default function Budgets() {
  const [budgets, setBudgets] = useState(MOCK_BUDGETS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setBudgets((prev) => prev.filter((b) => b._id !== id));
  };

  const handleSubmit = (formData) => {
    if (editingBudget) {
      setBudgets((prev) =>
        prev.map((b) =>
          b._id === editingBudget._id ? { ...b, limit: formData.limit } : b
        )
      );
    } else {
      setBudgets((prev) => [
        ...prev,
        {
          _id: Math.random().toString(36).substring(7),
          category: formData.category,
          limit: formData.limit,
          spent: 0, // Fresh budgets have 0 spent initially
        },
      ]);
    }
    setIsDialogOpen(false);
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

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
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
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
