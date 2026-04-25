import { Target, Pencil, Trash2, Calendar, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { computeGoalProgress } from "../../hooks/useGoals";

export default function GoalCard({ goal, onEdit, onDelete }) {
  const { percentage, remaining, isCompleted, isOverAchieved, status } = computeGoalProgress(goal);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 w-full pr-4">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-xl font-bold flex items-center gap-2 truncate">
              <Target className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{goal.title}</span>
            </CardTitle>
            
            {status === "at-risk" && !isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 shrink-0">
                <AlertCircle className="h-3 w-3" />
                At Risk
              </span>
            )}
            {status === "on-track" && !isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 shrink-0">
                <TrendingUp className="h-3 w-3" />
                On Track
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
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
              ${Number(goal.savedAmount).toLocaleString()}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Target</p>
            <p className="text-lg font-semibold text-foreground">
              ${Number(goal.targetAmount).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className={`font-bold ${
              status === "completed" ? "text-emerald-600" : 
              status === "at-risk" ? "text-amber-600" : "text-primary"
            }`}>
              {percentage.toFixed(1)}%
              {isOverAchieved && " 🎉"}
            </span>
          </div>
          <Progress
            value={percentage}
            className={`h-2 ${
              status === "completed" ? "[&>div]:bg-emerald-500" : 
              status === "at-risk" ? "[&>div]:bg-amber-500" : ""
            }`}
          />
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
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <strong className="text-foreground">${remaining.toLocaleString()}</strong>
              &nbsp;left to save
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
