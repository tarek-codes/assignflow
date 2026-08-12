"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { LoadingSpinner } from "./LoadingSpinner";

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(ROUTES.LOGIN);
      } else if (!allowedRoles.includes(user.role)) {
        router.push(ROUTES.UNAUTHORIZED);
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Verifying access permissions..." />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
