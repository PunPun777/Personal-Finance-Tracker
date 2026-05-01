import { formatINR } from "../../utils/formatINR";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit2, 
  Trash2, 
  CalendarClock, 
  AlertCircle, 
  RefreshCw,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Activity,
  Home,
  Zap,
  BookOpen,
  Plane,
  Heart,
  TrendingUp,
  DollarSign,
  Briefcase,
  Building,
  MoreHorizontal
} from "lucide-react";

function getCategoryIcon(category) {
  const iconProps = { className: "h-5 w-5" };
  switch (category) {
    case "Food & Dining": return <Utensils {...iconProps} />;
    case "Transportation": return <Car {...iconProps} />;
    case "Shopping": return <ShoppingBag {...iconProps} />;
    case "Entertainment": return <Film {...iconProps} />;
    case "Health & Medical": return <Activity {...iconProps} />;
    case "Housing & Rent": return <Home {...iconProps} />;
    case "Utilities": return <Zap {...iconProps} />;
    case "Education": return <BookOpen {...iconProps} />;
    case "Travel": return <Plane {...iconProps} />;
    case "Personal Care": return <Heart {...iconProps} />;
    case "Investments": return <TrendingUp {...iconProps} />;
    case "Salary": return <DollarSign {...iconProps} />;
    case "Freelance": return <Briefcase {...iconProps} />;
    case "Business": return <Building {...iconProps} />;
    default: return <MoreHorizontal {...iconProps} />;
  }
}

function getStatus(nextBillingDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0); 

  const nextDate = new Date(nextBillingDate);
  nextDate.setHours(0, 0, 0, 0);

  const diffTime = nextDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", variant: "destructive", icon: AlertCircle, color: "text-destructive" };
  if (diffDays === 0) return { label: "Due Today", variant: "secondary", icon: AlertCircle, color: "text-amber-500", badgeClass: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-transparent" };
  if (diffDays <= 3) return { label: `Due in ${diffDays} days`, variant: "secondary", icon: CalendarClock, color: "text-amber-500", badgeClass: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-transparent" };
  return { label: `Due on ${nextDate.toLocaleDateString()}`, variant: "outline", icon: CalendarClock, color: "text-muted-foreground", badgeClass: "bg-muted/50 text-muted-foreground" };
}

export default function SubscriptionCard({ subscription, accountName, onEdit, onDelete }) {
  const status = getStatus(subscription.nextBillingDate);
  const StatusIcon = status.icon;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${status.label === "Overdue" ? "border-destructive/50" : ""}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${
        status.label === "Overdue" 
          ? "bg-destructive" 
          : status.label.includes("Due") && !status.label.includes("Due on")
          ? "bg-amber-500" 
          : "bg-gradient-primary"
      }`} />
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl mt-0.5 shadow-sm border ${
               status.label === "Overdue" 
                 ? "bg-destructive/10 border-destructive/20 text-destructive"
                 : status.label.includes("Due") && !status.label.includes("Due on")
                 ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                 : "bg-primary/5 border-primary/10 text-primary"
            }`}>
              {getCategoryIcon(subscription.category)}
            </div>
            <div className="space-y-1.5">
              <div>
                <CardTitle className="text-lg font-bold leading-none tracking-tight mb-1">{subscription.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal px-2 rounded-md bg-secondary/50 text-secondary-foreground/80 shadow-none border-0">
                    {subscription.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 opacity-60 hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80" onClick={() => onEdit(subscription)}>
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(subscription._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-extrabold tracking-tight">
              {formatINR(subscription.amount)}
            </p>
            <span className="text-sm font-medium text-muted-foreground/80">
              / {subscription.billingCycle}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/60">
             <div className="flex items-center gap-2">
                <Badge variant={status.variant} className={`font-medium gap-1.5 ${status.badgeClass || ''}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </Badge>
             </div>
             {accountName ? (
               <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
                 <RefreshCw className="h-3 w-3" />
                 <span>via <span className="font-medium text-foreground/80">{accountName}</span></span>
               </div>
             ) : (
               <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
                 <RefreshCw className="h-3 w-3" />
                 <span>Unlinked</span>
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
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 bg-muted rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex space-x-1">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 space-y-5">
          <div className="flex items-baseline gap-2">
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
             <div className="h-6 w-28 bg-muted rounded-full animate-pulse" />
             <div className="h-6 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
