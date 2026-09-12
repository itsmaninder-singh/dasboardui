import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { queryClient } from "./queryClient";
import { ApiResponse } from "../types/api";

export const API_BASE_URL = "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // HttpOnly cookies sent automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach in-memory Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency lock for refresh token calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: 401 handling & single-flight refresh retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If no response (network down) or not 401, reject immediately
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints themselves (e.g. login failed or refresh failed)
    const url = originalRequest.url || "";
    if (url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    // Prevent recursive retries
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue this request until the ongoing refresh finishes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Refresh reads the HttpOnly cookie automatically
      const refreshResponse = await axios.post<ApiResponse<{ user: any; accessToken: string }>>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { user, accessToken } = refreshResponse.data.data;

      // Update Zustand in-memory store
      useAuthStore.getState().setAuth(user, accessToken);

      // Process queued requests with the new token
      processQueue(null, accessToken);

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      // Refresh failed — clear all client state, clear query cache, redirect
      useAuthStore.getState().clearAuth();
      queryClient.clear();

      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
