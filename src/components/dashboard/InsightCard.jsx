import { AlertTriangle, CheckCircle2 } from "lucide-react";

const INSIGHT_CONFIG = {
  success: {
    icon: CheckCircle2,
    containerClass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    iconClass: "text-emerald-600",
    titleClass: "text-emerald-800 dark:text-emerald-300",
    messageClass: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    iconClass: "text-amber-600",
    titleClass: "text-amber-800 dark:text-amber-300",
    messageClass: "text-amber-700 dark:text-amber-400",
  },
  danger: {
    icon: AlertTriangle,
    containerClass: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
    iconClass: "text-rose-600",
    titleClass: "text-rose-800 dark:text-rose-300",
    messageClass: "text-rose-700 dark:text-rose-400",
  },
};

export function InsightsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function InsightCard({ insight }) {
  const config = INSIGHT_CONFIG[insight.type] ?? INSIGHT_CONFIG.warning;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${config.containerClass}`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconClass}`} />
      <div className="space-y-0.5 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${config.titleClass}`}>
          {insight.title}
        </p>
        <p className={`text-sm leading-relaxed ${config.messageClass}`}>
          {insight.message}
        </p>
      </div>
    </div>
  );
}
