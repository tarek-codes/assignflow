import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (typeof window !== "undefined" && error.response) {
      const status = error.response.status;

      if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");
        const storedUser = localStorage.getItem("user");

        if (refreshToken && storedUser) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(apiClient(originalRequest));
                },
                reject: (err: any) => reject(err),
              });
            });
          }

          isRefreshing = true;

          try {
            const user = JSON.parse(storedUser);
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              refreshToken,
              email: user.email,
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            processQueue(null, newAccessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return apiClient(originalRequest);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
