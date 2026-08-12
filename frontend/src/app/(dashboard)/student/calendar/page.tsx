"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { StudentCalendarView } from "@/features/dashboard/StudentCalendarView";
import { ROLES } from "@/constants/roles";

export default function StudentCalendarPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
      <div className="pt-[1.75cm]">
        <StudentCalendarView />
      </div>
    </RoleGuard>
  );
}
