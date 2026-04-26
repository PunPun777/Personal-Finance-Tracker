import { OVERALL_BUDGET_CATEGORY } from "../constants/budgetCategories";

/**
 * Returns { year, month } for the current calendar month.
 */
export function getCurrentMonthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Filters transactions to only those within the current calendar month
 * that are expenses.
 */
export function filterMonthlyExpenses(transactions) {
  const { start, end } = getCurrentMonthBounds();
  return transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const date = new Date(t.date);
    return date >= start && date <= end;
  });
}

/**
 * Builds a category → total spend map from a list of expense transactions.
 */
export function buildSpendMap(expenses) {
  const map = {};
  for (const t of expenses) {
    const cat = t.category || "Other";
    map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
  }
  return map;
}

/**
 * Computes derived stats for a single budget against a spend map.
 *
 * @param {Object} budget   - { _id, category, limit }
 * @param {Object} spendMap - category → number
 * @param {number} totalMonthlySpend - sum of ALL expense amounts this month
 * @returns {Object} budget + { spent, remaining, percentage, status }
 */
export function computeSingleBudgetStats(budget, spendMap, totalMonthlySpend) {
  const limit = Number(budget.limit) || 0;

  const spent =
    budget.category === OVERALL_BUDGET_CATEGORY
      ? totalMonthlySpend
      : spendMap[budget.category] || 0;

  // Edge: zero-limit budget
  if (limit === 0) {
    return {
      ...budget,
      spent: 0,
      remaining: 0,
      percentage: 0,
      status: "no-limit",
    };
  }

  const remaining = limit - spent;
  // Cap display percentage at 100 — over-budget is surfaced via status
  const percentage = Math.min((spent / limit) * 100, 100);

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
    percentage: Math.round(percentage * 10) / 10, // 1 decimal place
    status,
  };
}

/**
 * Enriches an entire list of budgets with computed stats.
 */
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
