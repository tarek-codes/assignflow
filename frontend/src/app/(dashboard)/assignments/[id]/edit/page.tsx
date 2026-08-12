"use client";

import React, { use, useEffect, useState } from "react";
import { RoleGuard } from "@/components/common/RoleGuard";
import { AssignmentForm } from "@/features/assignments/AssignmentForm";
import { assignmentService } from "@/services/assignmentService";
import { AssignmentDetail } from "@/types/assignment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ROLES } from "@/constants/roles";

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = parseInt(resolvedParams.id, 10);
  const [data, setData] = useState<AssignmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    assignmentService
      .getAssignmentById(assignmentId)
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [assignmentId]);

  return (
    <RoleGuard allowedRoles={[ROLES.TEACHER]}>
      {isLoading ? (
        <LoadingSpinner label="Loading assignment data..." />
      ) : !data ? (
        <p className="text-sm text-slate-500">Assignment not found.</p>
      ) : (
        <AssignmentForm initialData={data} />
      )}
    </RoleGuard>
  );
}
