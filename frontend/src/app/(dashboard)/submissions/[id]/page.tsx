"use client";

import React, { use } from "react";
import { SubmissionDetail } from "@/features/submissions/SubmissionDetail";

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <SubmissionDetail submissionId={parseInt(resolvedParams.id, 10)} />;
}
