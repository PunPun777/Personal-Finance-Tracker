import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboardTransactions, fetchDashboardGoals } from "../services/dashboardService";
import { fetchSubscriptions } from "../services/subscriptionService";
import { CATEGORY_COLORS } from "../constants/chartColors";
import { formatINR } from "../utils/formatINR";

function buildMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getShortMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}


export function computeDashboardData(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;

  const categoryMap = {};
  const monthMap = {};

  for (const t of transactions) {
    const amount = Number(t.amount) || 0;

    if (t.type === "income") {
      totalIncome += amount;
      const mk = buildMonthKey(t.date);
      if (!monthMap[mk]) {
        monthMap[mk] = { name: getShortMonth(t.date), income: 0, expenses: 0, _key: mk };
      }
      monthMap[mk].income += amount;
    } else {
      totalExpenses += amount;
      if (t.category) {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
      }
      const mk = buildMonthKey(t.date);
      if (!monthMap[mk]) {
        monthMap[mk] = { name: getShortMonth(t.date), income: 0, expenses: 0, _key: mk };
      }
      monthMap[mk].expenses += amount;
    }
  }

  const categorySpending = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

  const monthlyData = Object.values(monthMap)
    .sort((a, b) => a._key.localeCompare(b._key))
    .slice(-7)
    .map(({ name, income, expenses }) => ({
      name,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
    }));

  const savings = totalIncome - totalExpenses;

  return { totalIncome, totalExpenses, savings, categorySpending, monthlyData, monthMap };
}

const CYCLE_TO_MONTHLY_FACTOR = {
  daily: 30,
  weekly: 4.33,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};
export function toMonthlyAmount(subscription) {
  const factor = CYCLE_TO_MONTHLY_FACTOR[subscription.billingCycle] ?? 1;
  return subscription.amount * factor;
}
export function computeMonthlySubscriptionCost(subscriptions) {
  return subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + toMonthlyAmount(s), 0);
}
export function getUpcomingPayments(subscriptions, days = 7) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + days);

  return subscriptions
    .filter((s) => {
      if (!s.isActive) return false;
      const d = new Date(s.nextBillingDate);
      return d <= cutoff;
    })
    .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
}

export function computeInsights(monthMap, goals, subscriptions = []) {
  const insights = [];
  const months = Object.values(monthMap).sort((a, b) => a._key.localeCompare(b._key));

  if (months.length >= 2) {
    const prev = months[months.length - 2];
    const curr = months[months.length - 1];

    if (prev.expenses > 0) {
      const expenseDiff = curr.expenses - prev.expenses;
      const expensePct = Math.abs((expenseDiff / prev.expenses) * 100).toFixed(0);
      if (expenseDiff > 0) {
        insights.push({
          id: "expense-up",
          type: "warning",
          title: "Spending increased",
          message: `You spent ${expensePct}% more this month compared to last month.`,
        });
      } else if (expenseDiff < 0) {
        insights.push({
          id: "expense-down",
          type: "success",
          title: "Spending reduced",
          message: `You spent ${expensePct}% less this month compared to last month. Great discipline!`,
        });
      }
    }

    if (prev.income > 0) {
      const incomeDiff = curr.income - prev.income;
      const incomePct = Math.abs((incomeDiff / prev.income) * 100).toFixed(0);
      if (incomeDiff > 0) {
        insights.push({
          id: "income-up",
          type: "success",
          title: "Income grew",
          message: `Your income increased by ${incomePct}% compared to last month.`,
        });
      } else if (incomeDiff < 0) {
        insights.push({
          id: "income-down",
          type: "warning",
          title: "Income dropped",
          message: `Your income decreased by ${incomePct}% compared to last month.`,
        });
      }
    }

    const prevSavings = prev.income - prev.expenses;
    const currSavings = curr.income - curr.expenses;
    if (prevSavings < currSavings && currSavings > 0) {
      insights.push({
        id: "savings-up",
        type: "success",
        title: "Savings improved",
        message: `Your net savings increased this month. You saved ${formatINR(currSavings)}.`,
      });
    } else if (currSavings < 0) {
      insights.push({
        id: "savings-deficit",
        type: "danger",
        title: "Spending exceeds income",
        message: `Your expenses exceeded your income by ${formatINR(Math.abs(currSavings))} this month.`,
      });
    }

    const expenseToIncomeRatio = curr.income > 0 ? (curr.expenses / curr.income) * 100 : 0;
    if (expenseToIncomeRatio > 80 && expenseToIncomeRatio <= 100) {
      insights.push({
        id: "high-ratio",
        type: "warning",
        title: "High expense ratio",
        message: `You're spending ${expenseToIncomeRatio.toFixed(0)}% of your income. Consider reviewing discretionary expenses.`,
      });
    }
    if (subscriptions.length > 0 && curr.income > 0) {
      const monthlySubCost = computeMonthlySubscriptionCost(subscriptions);
      const subRatio = (monthlySubCost / curr.income) * 100;
      if (subRatio > 30) {
        insights.push({
          id: "subscriptions-high",
          type: "warning",
          title: "High subscription spend",
          message: `Subscriptions cost ${formatINR(Math.round(monthlySubCost))}/mo — ${subRatio.toFixed(0)}% of your income. Consider reviewing.`,
        });
      }
    }
  }

  if (Array.isArray(goals)) {
    const nearDeadlineGoals = goals.filter((g) => {
      const daysLeft = (new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24);
      const progress = (Number(g.savedAmount) / Number(g.targetAmount)) * 100;
      return daysLeft > 0 && daysLeft <= 60 && progress < 80;
    });

    for (const g of nearDeadlineGoals.slice(0, 2)) {
      const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      const remaining = Number(g.targetAmount) - Number(g.savedAmount);
      insights.push({
        id: `goal-${g._id}`,
        type: "warning",
        title: `Goal deadline approaching: ${g.title}`,
        message: `${daysLeft} days left. You still need ${formatINR(remaining)} to reach your target.`,
      });
    }

    const completedGoals = goals.filter((g) => Number(g.savedAmount) >= Number(g.targetAmount));
    if (completedGoals.length > 0) {
      insights.push({
        id: "goals-completed",
        type: "success",
        title: "Goal achieved!",
        message: `You've reached ${completedGoals.length} financial goal${completedGoals.length > 1 ? "s" : ""}. Time to set a new one!`,
      });
    }
  }

  return insights;
}

export function useDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [txRes, goalsRes, subsRes] = await Promise.all([
        fetchDashboardTransactions(),
        fetchDashboardGoals(),
        fetchSubscriptions(),
      ]);
      if (isMounted.current) {
        setTransactions(txRes.data?.transactions ?? []);
        setGoals(goalsRes.data?.goals ?? []);
        setSubscriptions(subsRes.data?.subscriptions ?? []);
      }
    } catch (err) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {    load();
  }, [load]);

  const { monthMap, ...stats } = computeDashboardData(transactions);
  const insights = computeInsights(monthMap, goals, subscriptions);
  const recentTransactions = transactions.slice(0, 5);
  const monthlySubscriptionCost = computeMonthlySubscriptionCost(subscriptions);
  const upcomingPayments = getUpcomingPayments(subscriptions, 7);

  return {
    ...stats,
    goals,
    subscriptions,
    monthlySubscriptionCost,
    upcomingPayments,
    recentTransactions,
    insights,
    isLoading,
    error,
    reload: load,
  };
}
