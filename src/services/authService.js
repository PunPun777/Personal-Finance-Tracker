import apiClient from "./apiClient";

export const loginUser = (credentials) =>
  apiClient.post("/auth/login", credentials).then((res) => res.data);

export const registerUser = (userData) =>
  apiClient.post("/auth/register", userData).then((res) => res.data);

export const getMe = () =>
  apiClient.get("/auth/me").then((res) => res.data);
