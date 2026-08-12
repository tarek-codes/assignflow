"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { AdminDashboardView } from "@/features/dashboard/AdminDashboardView";
import { ROLES } from "@/constants/roles";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <AdminDashboardView />
    </RoleGuard>
  );
}
