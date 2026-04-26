import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";
import { fetchTransactions } from "../services/transactionService";
import { computeBudgetStats } from "../utils/computeBudgetStats";

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Fetch budgets and current-month transactions in parallel
      const [budgetsRes, txRes] = await Promise.all([
        fetchBudgets(),
        fetchTransactions({ limit: 500, sortBy: "date", sortOrder: "desc" }),
      ]);
      if (isMounted.current) {
        setBudgets(budgetsRes.data?.budgets ?? []);
        setTransactions(txRes.data?.transactions ?? []);
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

  const create = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      const { data } = await createBudget(formData);
      setBudgets((prev) => [data.budget, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const update = useCallback(async (id, formData) => {
    setIsSubmitting(true);
    try {
      const { data } = await updateBudget(id, formData);
      setBudgets((prev) =>
        prev.map((b) => (b._id === id ? data.budget : b))
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    // Optimistic removal
    setBudgets((prev) => prev.filter((b) => b._id !== id));
    try {
      await deleteBudget(id);
      return { success: true };
    } catch (err) {
      // Rollback on failure
      await load();
      return { success: false, message: err.message };
    }
  }, [load]);

  // Derived: merge budgets with computed spend stats from transactions
  const enrichedBudgets = computeBudgetStats(budgets, transactions);

  return {
    budgets: enrichedBudgets,
    isLoading,
    isSubmitting,
    error,
    create,
    update,
    remove,
    reload: load,
  };
}
