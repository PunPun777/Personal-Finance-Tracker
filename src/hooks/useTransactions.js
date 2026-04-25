import { useState, useEffect, useCallback, useRef } from "react";
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchTransactions({ limit: 100, sortBy: "date", sortOrder: "desc" });
      if (isMounted.current) setTransactions(data.transactions);
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
