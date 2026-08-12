"use client";

import React, { use } from "react";
import { AssignmentDetail } from "@/features/assignments/AssignmentDetail";

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <AssignmentDetail assignmentId={parseInt(resolvedParams.id, 10)} />;
}
