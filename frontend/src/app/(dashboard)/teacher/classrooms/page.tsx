"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { TeacherClassroomsView } from "@/features/teacher/TeacherClassroomsView";
import { ROLES } from "@/constants/roles";

export default function TeacherClassroomsPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
      <div className="pt-[1.75cm]">
        <TeacherClassroomsView />
      </div>
    </RoleGuard>
  );
}
