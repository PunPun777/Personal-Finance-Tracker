import { AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-destructive font-medium">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {message}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function FeedbackBanner({ feedback }) {
  if (!feedback) return null;
  const isSuccess = feedback.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium border ${
        isSuccess
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
          : "bg-destructive/10 text-destructive border-destructive/20"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {feedback.message}
    </div>
  );
}
