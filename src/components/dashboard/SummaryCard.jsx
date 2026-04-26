import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SummaryCard({ title, amount, icon: Icon, description, trend, trendValue }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{amount}</div>
        <div className="flex items-center mt-1">
          {trendValue && (
            <span
              className={`text-xs font-medium mr-2 ${
                trend === "up"
                  ? "text-emerald-500"
                  : trend === "down"
                  ? "text-rose-500"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? "+" : trend === "down" ? "-" : ""}
              {trendValue}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-muted rounded animate-pulse mt-1" />
        <div className="h-3 w-40 bg-muted rounded mt-2 animate-pulse" />
      </CardContent>
    </Card>
  );
}
