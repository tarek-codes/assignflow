"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { AuthResponse, LoginRequest, User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
  removeAvatar: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          const storedAvatar = localStorage.getItem("user_avatar_" + parsedUser.id);
          if (storedAvatar) {
            parsedUser.avatarUrl = storedAvatar;
          }
          setAccessToken(storedToken);
          setUser(parsedUser);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    const storedAvatar = localStorage.getItem("user_avatar_" + response.userId);
    const userData: User = {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
      avatarUrl: storedAvatar || undefined,
    };

    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setAccessToken(response.accessToken);
    setUser(userData);

    return response;
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    const updatedUser = { ...user, avatarUrl };
    setUser(updatedUser);

    try {
      const { avatarUrl: _, ...userNoAvatar } = updatedUser;
      localStorage.setItem("user", JSON.stringify(userNoAvatar));
      localStorage.setItem("user_avatar_" + user.id, avatarUrl);
    } catch (err) {
      console.warn("Storage quota limit reached when persisting avatar:", err);
    }
  };

  const removeAvatar = () => {
    if (!user) return;
    const { avatarUrl, ...restUser } = user;
    setUser(restUser);
    try {
      localStorage.setItem("user", JSON.stringify(restUser));
      localStorage.removeItem("user_avatar_" + user.id);
    } catch (err) {
      console.warn("Storage error while removing avatar:", err);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken && !!user,
        isLoading,
        login,
        logout,
        updateAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
