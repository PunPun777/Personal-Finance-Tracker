import apiClient from "./apiClient";

export const fetchAccounts = () =>
  apiClient.get("/accounts").then((res) => res.data);

export const createAccount = (data) =>
  apiClient.post("/accounts", data).then((res) => res.data);

export const updateAccount = (id, data) =>
  apiClient.put(`/accounts/${id}`, data).then((res) => res.data);

export const deleteAccount = (id) =>
  apiClient.delete(`/accounts/${id}`).then((res) => res.data);
