import { useState, useEffect, useCallback } from "react";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchTransactions({ limit: 100, sortBy: "date", sortOrder: "desc" });
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      const { data } = await createTransaction(formData);
      setTransactions((prev) => [data.transaction, ...prev]);
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
      const { data } = await updateTransaction(id, formData);
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? data.transaction : t))
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    try {
      await deleteTransaction(id);
      return { success: true };
    } catch (err) {
      await load();
      return { success: false, message: err.message };
    }
  }, [load]);

  return {
    transactions,
    isLoading,
    isSubmitting,
    error,
    create,
    update,
    remove,
    reload: load,
  };
}
