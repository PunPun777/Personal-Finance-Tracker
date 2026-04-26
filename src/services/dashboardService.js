import apiClient from "./apiClient";

export const fetchDashboardTransactions = () =>
  apiClient.get("/transactions", { params: { limit: 200, sortBy: "date", sortOrder: "desc" } }).then((res) => res.data);

export const fetchDashboardGoals = () =>
  apiClient.get("/goals").then((res) => res.data);
