import { formatINR } from "../../utils/formatINR";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit2, Trash2, Wallet, Landmark, CreditCard, PiggyBank, TrendingUp, HelpCircle } from "lucide-react";

const getAccountIcon = (type) => {
  switch (type) {
    case "Wallet": return <Wallet className="h-5 w-5 text-indigo-500" />;
    case "Bank": return <Landmark className="h-5 w-5 text-blue-500" />;
    case "Credit Card": return <CreditCard className="h-5 w-5 text-red-500" />;
    case "Savings": return <PiggyBank className="h-5 w-5 text-emerald-500" />;
    case "Investment": return <TrendingUp className="h-5 w-5 text-violet-500" />;
    default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
  }
};

export default function AccountCard({ account, onEdit, onDelete }) {
  return (
    <Card className="relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-md">
              {getAccountIcon(account.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{account.name}</CardTitle>
              <CardDescription>{account.type}</CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(account)}>
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(account._id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatINR(account.balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountCardSkeleton() {
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
        <div className="mt-4 space-y-2">
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          <div className="h-7 w-36 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
