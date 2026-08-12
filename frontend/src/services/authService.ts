import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { AuthResponse, LoginRequest } from "@/types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ exists: boolean }>(`${API_ENDPOINTS.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(email)}`);
      return response.data?.exists ?? false;
    } catch {
      return false;
    }
  },
};
