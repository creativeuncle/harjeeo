import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes("/auth/refresh");
    if (error.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;

      // The impersonated access token expired. Refreshing here would use
      // the admin's own refresh cookie and silently swap the identity back
      // without saying so — instead, cleanly end impersonation and retry
      // as the admin.
      const { impersonatorAdmin, stopImpersonation } = useAuthStore.getState();
      if (impersonatorAdmin) {
        stopImpersonation();
        original.headers.Authorization = `Bearer ${impersonatorAdmin.accessToken}`;
        return api(original);
      }

      try {
        refreshPromise ??= api.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
        const { data } = await refreshPromise;
        useAuthStore.getState().setSession(data.user, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        throw refreshError;
      }
    }
    throw error;
  }
);
