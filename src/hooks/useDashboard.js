import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboardTransactions, fetchDashboardGoals } from "../services/dashboardService";

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

    if (t.type === "income") {
      const mk = buildMonthKey(t.date);
      if (!monthMap[mk]) {
        monthMap[mk] = { name: getShortMonth(t.date), income: 0, expenses: 0, _key: mk };
      }
      monthMap[mk].income += amount;
    }
  }

  const CATEGORY_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#f43f5e", "#14b8a6", "#f97316",
  ];

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

  return { totalIncome, totalExpenses, savings, categorySpending, monthlyData };
}

export function useDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
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
      const [txRes, goalsRes] = await Promise.all([
        fetchDashboardTransactions(),
        fetchDashboardGoals(),
      ]);
      if (isMounted.current) {
        setTransactions(txRes.data?.transactions ?? []);
        setGoals(goalsRes.data?.goals ?? []);
      }
    } catch (err) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = computeDashboardData(transactions);
  const recentTransactions = transactions.slice(0, 5);

  return { ...stats, goals, recentTransactions, isLoading, error, reload: load };
}
