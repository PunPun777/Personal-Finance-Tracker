import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  processDueSubscriptions,
} from "../services/subscriptionService";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
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
      const res = await fetchSubscriptions();
      if (isMounted.current) {
        setSubscriptions(res.data?.subscriptions ?? []);
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
      const { data } = await createSubscription(formData);
      if (isMounted.current) {
        setSubscriptions((prev) => {
          const newSubs = [data.subscription, ...prev];
          return newSubs.sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
        });
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
      const { data } = await updateSubscription(id, formData);
      if (isMounted.current) {
        setSubscriptions((prev) => {
          const newSubs = prev.map((s) => (s._id === id ? data.subscription : s));
          return newSubs.sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
        });
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
      const snapshot = subscriptions;
      setSubscriptions((prev) => prev.filter((s) => s._id !== id));
      try {
        await deleteSubscription(id);
        return { success: true };
      } catch (err) {
        if (isMounted.current) setSubscriptions(snapshot);
        return {
          success: false,
          message: err.response?.data?.message ?? err.message,
        };
      }
    },
    [subscriptions]
  );

  const processDue = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const { data } = await processDueSubscriptions();
      await load(); // Reload to get updated nextBillingDates
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message ?? err.message,
      };
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  }, [load]);

  return {
    subscriptions,
    isLoading,
    isSubmitting,
    error,
    create,
    update,
    remove,
    processDue,
    reload: load,
  };
}
