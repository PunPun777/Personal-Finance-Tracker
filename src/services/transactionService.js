import apiClient from "./apiClient";

export const fetchTransactions = (params) =>
  apiClient.get("/transactions", { params }).then((res) => res.data);

export const createTransaction = (data) =>
  apiClient.post("/transactions", data).then((res) => res.data);

export const updateTransaction = (id, data) =>
  apiClient.put(`/transactions/${id}`, data).then((res) => res.data);

export const deleteTransaction = (id) =>
  apiClient.delete(`/transactions/${id}`).then((res) => res.data);
