"use client";

import React, { Suspense } from "react";
import { SubmissionList } from "@/features/submissions/SubmissionList";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading submissions..." />}>
      <SubmissionList />
    </Suspense>
  );
}
