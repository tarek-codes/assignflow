"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { TeacherDashboardView } from "@/features/dashboard/TeacherDashboardView";
import { ROLES } from "@/constants/roles";

export default function TeacherPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
      <TeacherDashboardView />
    </RoleGuard>
  );
}
