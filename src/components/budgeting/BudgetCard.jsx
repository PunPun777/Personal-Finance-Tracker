import { Pencil, Trash2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatINR } from "../../utils/formatINR";
const STATUS_CONFIG = {
  safe: {
    indicator: "",
    remainingClass: "text-emerald-600 dark:text-emerald-400",
    badge: null,
  },
  warning: {
    indicator: "bg-amber-500",
    remainingClass: "text-amber-600 dark:text-amber-400",
    badge: { label: "Near limit", class: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  },
  over: {
    indicator: "bg-rose-500",
    remainingClass: "text-rose-500",
    badge: { label: "Over budget", class: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  },
  "no-limit": {
    indicator: "bg-muted-foreground",
    remainingClass: "text-muted-foreground",
    badge: null,
  },
};

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const { category, limit, spent, remaining, percentage, status } = budget;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.safe;
  const isOver = status === "over";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg">{category}</CardTitle>
            {config.badge && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${config.badge.class}`}>
                {isOver && <AlertCircle className="h-3 w-3 mr-1" />}
                {config.badge.label}
              </span>
            )}
          </div>
          <CardDescription>
            {formatINR(spent)} of {formatINR(limit)} spent this month
          </CardDescription>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(budget)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Budget</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(budget._id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
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
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress
            value={percentage}
            indicatorClassName={config.indicator || undefined}
          />
        </div>

        <div className="flex justify-between items-center text-sm pt-2 border-t">
          <span className="text-muted-foreground">
            {isOver ? "Over by" : "Remaining"}
          </span>
          <span className={`font-semibold ${config.remainingClass}`}>
            {formatINR(Math.abs(remaining))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
