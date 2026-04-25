import apiClient from "./apiClient";

export const fetchGoals = () =>
  apiClient.get("/goals").then((res) => res.data);

export const createGoal = (data) =>
  apiClient.post("/goals", data).then((res) => res.data);

export const updateGoal = (id, data) =>
  apiClient.put(`/goals/${id}`, data).then((res) => res.data);

export const deleteGoal = (id) =>
  apiClient.delete(`/goals/${id}`).then((res) => res.data);
