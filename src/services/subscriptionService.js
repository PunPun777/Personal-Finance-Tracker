import apiClient from "./apiClient";

export const fetchSubscriptions = () =>
  apiClient.get("/subscriptions").then((res) => res.data);

export const createSubscription = (data) =>
  apiClient.post("/subscriptions", data).then((res) => res.data);

export const updateSubscription = (id, data) =>
  apiClient.put(`/subscriptions/${id}`, data).then((res) => res.data);

export const deleteSubscription = (id) =>
  apiClient.delete(`/subscriptions/${id}`).then((res) => res.data);

export const processDueSubscriptions = () =>
  apiClient.post("/subscriptions/process-due").then((res) => res.data);
