import { formatINR } from "../../utils/formatINR";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit2, Trash2, CalendarClock, AlertCircle, RefreshCw } from "lucide-react";

function getStatus(nextBillingDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // start of today

  const nextDate = new Date(nextBillingDate);
  nextDate.setHours(0, 0, 0, 0);

  const diffTime = nextDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", color: "text-destructive", bg: "bg-destructive/10" };
  if (diffDays === 0) return { label: "Due Today", color: "text-amber-500", bg: "bg-amber-500/10" };
  if (diffDays <= 3) return { label: `Due in ${diffDays} days`, color: "text-amber-500", bg: "bg-amber-500/10" };
  return { label: `Due on ${nextDate.toLocaleDateString()}`, color: "text-muted-foreground", bg: "bg-muted" };
}

export default function SubscriptionCard({ subscription, accountName, onEdit, onDelete }) {
  const status = getStatus(subscription.nextBillingDate);

  return (
    <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-md ${status.bg}`}>
              {status.label === "Overdue" ? (
                <AlertCircle className={`h-5 w-5 ${status.color}`} />
              ) : (
                <RefreshCw className={`h-5 w-5 ${status.color}`} />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{subscription.name}</CardTitle>
              <CardDescription>{subscription.category}</CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(subscription)}>
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(subscription._id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex flex-col gap-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-2xl font-bold tracking-tight">
              {formatINR(subscription.amount)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {subscription.billingCycle}
              </span>
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-4 border-t">
             <div className="flex items-center gap-1.5 text-sm">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className={status.color}>{status.label}</span>
             </div>
             {accountName && (
               <div className="text-sm text-muted-foreground">
                 via {accountName}
               </div>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionCardSkeleton() {
  return (
    <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-muted">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-muted rounded-md animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex space-x-1">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-7 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
             <div className="h-4 w-32 bg-muted rounded animate-pulse" />
             <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
