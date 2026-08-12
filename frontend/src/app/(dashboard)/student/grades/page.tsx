"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { StudentGradesView } from "@/features/student/StudentGradesView";
import { ROLES } from "@/constants/roles";

export default function StudentGradesPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
      <StudentGradesView />
    </RoleGuard>
  );
}
