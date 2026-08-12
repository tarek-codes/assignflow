"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { ROUTES } from "@/constants/routes";

import { ShieldAlert } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Authenticating user session..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isMaintenanceActive = typeof window !== "undefined" && localStorage.getItem("system_maintenance_mode") === "true";

  if (isMaintenanceActive && user?.role !== "Admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 shadow-md">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Under Maintenance</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          The portal is currently undergoing scheduled database updates and system maintenance. Student and teacher access is temporarily suspended.
        </p>
        <div className="mt-6">
          <button
            onClick={async () => {
              await logout();
              router.push(ROUTES.LOGIN);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
