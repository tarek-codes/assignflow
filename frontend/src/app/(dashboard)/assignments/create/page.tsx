"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { AssignmentForm } from "@/features/assignments/AssignmentForm";
import { ROLES } from "@/constants/roles";

export default function CreateAssignmentPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.TEACHER]}>
      <AssignmentForm />
    </RoleGuard>
  );
}
