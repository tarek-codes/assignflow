"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { StudentDashboardView } from "@/features/dashboard/StudentDashboardView";
import { ROLES } from "@/constants/roles";

export default function StudentPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
      <StudentDashboardView />
    </RoleGuard>
  );
}
