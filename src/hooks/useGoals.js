import { useState, useEffect, useCallback, useRef } from "react";
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
    return { percentage: 0, remaining: 0, isCompleted: false, isOverAchieved: false, status: "on-track" };
  }

  const rawPercentage = (saved / target) * 100;
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  const remaining = Math.max(0, target - saved);
  const isCompleted = saved >= target;
  const isOverAchieved = saved > target;

  let status = "on-track";
  if (isCompleted) {
    status = "completed";
  } else if (goal.targetDate) {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);

    if (targetDate < today) {
      status = "at-risk";
    } else if (goal.createdAt) {
      const createdAt = new Date(goal.createdAt);
      const totalDays = (targetDate - createdAt) / (1000 * 60 * 60 * 24);
      const daysPassed = (today - createdAt) / (1000 * 60 * 60 * 24);
      const timePercentage = (daysPassed / totalDays) * 100;
      if (timePercentage > percentage + 15) {
        status = "at-risk";
      }
    } else {
      const daysLeft = (targetDate - today) / (1000 * 60 * 60 * 24);
      if (daysLeft < 30 && percentage < 80) {
        status = "at-risk";
      }
    }
  }

  return { percentage, remaining, isCompleted, isOverAchieved, rawPercentage, status };
}

export function useGoals() {
  const [goals, setGoals] = useState([]);
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
      const { data } = await fetchGoals();
      if (isMounted.current) setGoals(data.goals);
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
