import { UserRole } from "@/constants/roles";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  gender?: string;
  avatarUrl?: string;
  classLevel?: number;
  group?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  gender?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
}
