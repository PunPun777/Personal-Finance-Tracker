import { useState, useEffect, useCallback } from "react";
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../services/goalService";

export function computeGoalProgress(goal) {
  const target = Number(goal.targetAmount) || 0;
  const saved = Number(goal.savedAmount) || 0;

  if (target === 0) {
    return { percentage: 0, remaining: 0, isCompleted: false, isOverAchieved: false };
  }

  const rawPercentage = (saved / target) * 100;
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  const remaining = Math.max(0, target - saved);
  const isCompleted = saved >= target;
  const isOverAchieved = saved > target;

  return { percentage, remaining, isCompleted, isOverAchieved, rawPercentage };
}

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchGoals();
      setGoals(data.goals);
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
      const { data } = await createGoal(formData);
      setGoals((prev) => [data.goal, ...prev]);
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
      const { data } = await updateGoal(id, formData);
      setGoals((prev) => prev.map((g) => (g._id === id ? data.goal : g)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setGoals((prev) => prev.filter((g) => g._id !== id));
    try {
      await deleteGoal(id);
      return { success: true };
    } catch (err) {
      await load();
      return { success: false, message: err.message };
    }
  }, [load]);

  return {
    goals,
    isLoading,
    isSubmitting,
    error,
    create,
    update,
    remove,
    reload: load,
  };
}
