"use client";

import React from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { ManageClassesView } from "@/features/manage/ManageClassesView";
import { ROLES } from "@/constants/roles";

export default function ManagePage() {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <div className="pt-[1.75cm]">
        <ManageClassesView />
      </div>
    </RoleGuard>
  );
}
