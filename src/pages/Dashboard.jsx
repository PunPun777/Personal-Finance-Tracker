import {
  DollarSign,
  CreditCard,
  PiggyBank,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Receipt,
  Repeat,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import SummaryCard, { SummaryCardSkeleton } from "../components/dashboard/SummaryCard";
import InsightCard, { InsightsSkeleton } from "../components/dashboard/InsightCard";
import { EmptyChart } from "../components/dashboard/EmptyChart";
import { ErrorBanner } from "../components/ui/Banners";
import { AmountCell } from "../components/transactions/AmountCell";
import { useDashboard } from "../hooks/useDashboard";
import { formatINR, formatINRCompact } from "../utils/formatINR";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    borderRadius: "8px",
    border: "1px solid hsl(var(--border))",
  },
  itemStyle: { color: "hsl(var(--foreground))" },
};

function ChartSkeleton() {
  return <div className="h-[300px] w-full bg-muted rounded-md animate-pulse" />;
}


function RecentTransactionsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const {
    totalIncome,
    totalExpenses,
    savings,
    categorySpending,
    monthlyData,
    recentTransactions,
    insights,
    monthlySubscriptionCost,
    upcomingPayments,
    isLoading,
    error,
    reload,
  } = useDashboard();

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your financial overview and recent activity.
        </p>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {/* Summary Cards — 4-col grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Income"
              amount={formatINR(totalIncome)}
              icon={DollarSign}
              description="all time"
            />
            <SummaryCard
              title="Total Expenses"
              amount={formatINR(totalExpenses)}
              icon={CreditCard}
              description="all time"
            />
            <SummaryCard
              title="Net Savings"
              amount={formatINR(Math.abs(savings))}
              icon={PiggyBank}
              trend={savings >= 0 ? "up" : "down"}
              description={savings >= 0 ? "positive balance" : "deficit"}
            />
            <SummaryCard
              title="Monthly Subscriptions"
              amount={formatINR(Math.round(monthlySubscriptionCost))}
              icon={Repeat}
              description={`est. per month`}
            />
          </>
        )}
      </div>

      {/* Financial Insights */}
      {isLoading ? (
        <InsightsSkeleton />
      ) : insights.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-4">Financial Insights</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Upcoming Subscription Payments */}
      {!isLoading && upcomingPayments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-4">Upcoming Payments</h2>
          <Card>
            <CardContent className="pt-4 divide-y">
              {upcomingPayments.map((sub) => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const due = new Date(sub.nextBillingDate);
                due.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;
                const isDueToday = diffDays === 0;

                return (
                  <div key={sub._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${
                        isOverdue ? "bg-destructive/10" : isDueToday ? "bg-amber-500/10" : "bg-muted"
                      }`}>
                        {isOverdue
                          ? <AlertCircle className="h-4 w-4 text-destructive" />
                          : <CalendarClock className={`h-4 w-4 ${
                              isDueToday ? "text-amber-500" : "text-muted-foreground"
                            }`} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatINR(sub.amount)}</p>
                      <p className={`text-xs ${
                        isOverdue ? "text-destructive" : isDueToday ? "text-amber-500" : "text-muted-foreground"
                      }`}>
                        {isOverdue
                          ? `Overdue by ${Math.abs(diffDays)}d`
                          : isDueToday
                          ? "Due today"
                          : `In ${diffDays} day${diffDays > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cash Flow + Category Spending */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
            <CardDescription>Income vs Expenses over the last 7 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <ChartSkeleton />
            ) : monthlyData.length === 0 ? (
              <EmptyChart
                icon={LineChartIcon}
                title="No cash flow data"
                description="Add transactions to see your history."
              />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatINRCompact} />
                    <Tooltip formatter={(v) => formatINR(v)} {...CHART_TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Category Spending</CardTitle>
            <CardDescription>Your expenses breakdown by category.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : categorySpending.length === 0 ? (
              <EmptyChart
                icon={PieChartIcon}
                title="No expense data"
                description="Add expenses to see categories."
              />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatINR(v)} {...CHART_TOOLTIP_STYLE} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses + Recent Transactions */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Your total expenses month over month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <ChartSkeleton />
            ) : monthlyData.length === 0 ? (
              <EmptyChart
                icon={BarChart3}
                title="No monthly expenses"
                description="Add expenses to see your trends."
              />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatINRCompact} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(v) => formatINR(v)} {...CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <RecentTransactionsSkeleton />
            ) : recentTransactions.length === 0 ? (
              <EmptyChart
                icon={Receipt}
                title="No transactions yet"
                description="Your recent activity will appear here."
              />
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>
                          <div className="font-medium">{t.description || t.category}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t.category} • {new Date(t.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <AmountCell type={t.type} amount={t.amount} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
