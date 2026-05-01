import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../services/accountService";

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAccounts();
      if (isMounted.current) {
        setAccounts(res.data?.accounts ?? []);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message ?? err.message);
      }
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
      const { data } = await createAccount(formData);
      if (isMounted.current) {
        // Prepend new account so it appears at the top
        setAccounts((prev) => [data.account, ...prev]);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message ?? err.message,
      };
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  }, []);

  const update = useCallback(async (id, formData) => {
    setIsSubmitting(true);
    try {
      const { data } = await updateAccount(id, formData);
      if (isMounted.current) {
        setAccounts((prev) =>
          prev.map((a) => (a._id === id ? data.account : a))
        );
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message ?? err.message,
      };
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(
    async (id) => {
      // Optimistic removal — instant UI feedback
      const snapshot = accounts;
      setAccounts((prev) => prev.filter((a) => a._id !== id));
      try {
        await deleteAccount(id);
        return { success: true };
      } catch (err) {
        // Rollback on failure
        if (isMounted.current) setAccounts(snapshot);
        return {
          success: false,
          message: err.response?.data?.message ?? err.message,
        };
      }
    },
    [accounts]
  );

  return {
    accounts,
    isLoading,
    isSubmitting,
    error,
    create,
    update,
    remove,
    reload: load,
  };
}
