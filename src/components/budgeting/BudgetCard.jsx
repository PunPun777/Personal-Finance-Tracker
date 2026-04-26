import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const { category, limit, spent } = budget;
  const remaining = limit - spent;
  const progressPercentage = Math.min((spent / limit) * 100, 100);
  const isOverBudget = spent > limit;
  const isWarning = progressPercentage >= 80 && !isOverBudget;

  let indicatorColor = "bg-primary";
  if (isOverBudget) {
    indicatorColor = "bg-rose-500";
  } else if (isWarning) {
    indicatorColor = "bg-amber-500";
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{category}</CardTitle>
          <CardDescription>
            {formatCurrency(spent)} of {formatCurrency(limit)} spent
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(budget)} className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Budget</span>
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(budget._id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Budget</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} indicatorClassName={indicatorColor} />
        </div>
        
        <div className="flex justify-between items-center text-sm pt-2 border-t">
          <span className="text-muted-foreground">Remaining</span>
          <div className="flex items-center gap-2">
            {isOverBudget && <AlertCircle className="h-4 w-4 text-rose-500" />}
            <span className={`font-semibold ${isOverBudget ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
              {isOverBudget ? "Over by " : ""}{formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
