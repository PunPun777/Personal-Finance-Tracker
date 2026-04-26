import { Target, Pencil, Trash2, Calendar, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { computeGoalProgress } from "../../hooks/useGoals";
import { formatINR } from "../../utils/formatINR";

const STATUS_CONFIG = {
  "at-risk": {
    label: "At Risk",
    icon: AlertCircle,
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
    progressClass: "[&>div]:bg-amber-500",
    percentageClass: "text-amber-600",
  },
  "on-track": {
    label: "On Track",
    icon: TrendingUp,
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
    progressClass: "",
    percentageClass: "text-primary",
  },
  "completed": {
    label: null,
    icon: null,
    className: "",
    progressClass: "[&>div]:bg-emerald-500",
    percentageClass: "text-emerald-600",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config || !config.label) return null;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset shrink-0 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function GoalCard({ goal, onEdit, onDelete }) {
  const { percentage, remaining, isCompleted, isOverAchieved, status } = computeGoalProgress(goal);
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["on-track"];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-2 pb-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-xl font-bold flex items-center gap-2 min-w-0">
              <Target className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{goal.title}</span>
            </CardTitle>
            {!isCompleted && <StatusBadge status={status} />}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            {new Date(goal.targetDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(goal)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Goal</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal._id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Goal</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Saved</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatINR(goal.savedAmount)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Target</p>
            <p className="text-lg font-semibold text-foreground">
              {formatINR(goal.targetAmount)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className={`font-bold ${config.percentageClass}`}>
              {percentage.toFixed(1)}%{isOverAchieved && " 🎉"}
            </span>
          </div>
          <Progress value={percentage} className={`h-2 ${config.progressClass}`} />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 py-3 mt-auto border-t">
        <div className="flex items-center gap-2 text-sm w-full">
          {isCompleted ? (
            <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {isOverAchieved ? "Goal Surpassed!" : "Goal Reached!"}
            </span>
          ) : (
            <span className="font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <strong className="text-foreground">{formatINR(remaining)}</strong>
              left to save
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
