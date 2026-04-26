import apiClient from "./apiClient";

export const fetchBudgets = () =>
  apiClient.get("/budgets").then((res) => res.data);

export const createBudget = (data) =>
  apiClient.post("/budgets", data).then((res) => res.data);

export const updateBudget = (id, data) =>
  apiClient.put(`/budgets/${id}`, data).then((res) => res.data);

export const deleteBudget = (id) =>
  apiClient.delete(`/budgets/${id}`).then((res) => res.data);
