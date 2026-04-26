import {
  DollarSign,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Receipt,
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
import { Button } from "@/components/ui/button";
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
import InsightCard from "../components/dashboard/InsightCard";
import { useDashboard } from "../hooks/useDashboard";

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

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={reload} className="gap-2 shrink-0">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Income"
              amount={formatCurrency(totalIncome)}
              icon={DollarSign}
              description="all time"
            />
            <SummaryCard
              title="Total Expenses"
              amount={formatCurrency(totalExpenses)}
              icon={CreditCard}
              description="all time"
            />
            <SummaryCard
              title="Net Savings"
              amount={formatCurrency(Math.abs(savings))}
              icon={PiggyBank}
              trend={savings >= 0 ? "up" : "down"}
              description={savings >= 0 ? "positive balance" : "deficit"}
            />
          </>
        )}
      </div>

      {/* Insights Row */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
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

      {/* Top Charts Row */}
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
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-2">
                <LineChartIcon className="h-10 w-10 mb-4 text-muted/50" />
                <p className="text-sm font-medium text-foreground">No cash flow data</p>
                <p className="text-xs mt-1">Add transactions to see your history.</p>
              </div>
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
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} {...CHART_TOOLTIP_STYLE} />
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
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <PieChartIcon className="h-10 w-10 mb-4 text-muted/50" />
                <p className="text-sm font-medium text-foreground">No expense data</p>
                <p className="text-xs mt-1">Add expenses to see categories.</p>
              </div>
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
                    <Tooltip formatter={(v) => formatCurrency(v)} {...CHART_TOOLTIP_STYLE} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts Row */}
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
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-2">
                <BarChart3 className="h-10 w-10 mb-4 text-muted/50" />
                <p className="text-sm font-medium text-foreground">No monthly expenses</p>
                <p className="text-xs mt-1">Add expenses to see your trends.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(v) => formatCurrency(v)} {...CHART_TOOLTIP_STYLE} />
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
            ) : recentTransactions.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <Receipt className="h-10 w-10 mb-4 text-muted/50" />
                <p className="text-sm font-medium text-foreground">No transactions yet</p>
                <p className="text-xs mt-1">Your recent activity will appear here.</p>
              </div>
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
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {t.category} • {new Date(t.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t.type === "income" ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-rose-500" />
                            )}
                            <span className={`font-medium ${t.type === "income" ? "text-emerald-500" : "text-foreground"}`}>
                              {formatCurrency(t.amount)}
                            </span>
                          </div>
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
