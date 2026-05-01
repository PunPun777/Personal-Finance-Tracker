import { OVERALL_BUDGET_CATEGORY } from "../constants/budgetCategories";
export function getCurrentMonthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
export function filterMonthlyExpenses(transactions) {
  const { start, end } = getCurrentMonthBounds();
  return transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const date = new Date(t.date);
    return date >= start && date <= end;
  });
}
export function buildSpendMap(expenses) {
  const map = {};
  for (const t of expenses) {
    const cat = t.category || "Other";
    map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
  }
  return map;
}
export function computeSingleBudgetStats(budget, spendMap, totalMonthlySpend) {
  const limit = Number(budget.limit) || 0;

  const spent =
    budget.category === OVERALL_BUDGET_CATEGORY
      ? totalMonthlySpend
      : spendMap[budget.category] || 0;
  if (limit === 0) {
    return {
      ...budget,
      spent: 0,
      remaining: 0,
      percentage: 0,
      status: "no-limit",
    };
  }

  const remaining = limit - spent;  const percentage = Math.min((spent / limit) * 100, 100);

  let status = "safe";
  if (spent > limit) {
    status = "over";
  } else if (percentage >= 80) {
    status = "warning";
  }

  return {
    ...budget,
    spent: Math.round(spent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    percentage: Math.round(percentage * 10) / 10, 
    status,
  };
}
export function computeBudgetStats(budgets, transactions) {
  const expenses = filterMonthlyExpenses(transactions);
  const spendMap = buildSpendMap(expenses);
  const totalMonthlySpend = expenses.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  return budgets.map((budget) =>
    computeSingleBudgetStats(budget, spendMap, totalMonthlySpend)
  );
}
