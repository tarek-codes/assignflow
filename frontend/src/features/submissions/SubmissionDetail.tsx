"use client";

import React, { useEffect, useState } from "react";
import { submissionService } from "@/services/submissionService";
import { assignmentService } from "@/services/assignmentService";
import { SubmissionDetail as ISubmissionDetail } from "@/types/submission";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { FilePreviewer } from "./FilePreviewer";
import { SubmissionGradeForm } from "./SubmissionGradeForm";
import { User, Calendar, Award, Clock } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export function SubmissionDetail({ submissionId }: { submissionId: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submission, setSubmission] = useState<ISubmissionDetail | null>(null);
  const [assignmentInfo, setAssignmentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubmission = () => {
    setIsLoading(true);
    submissionService
      .getSubmissionById(submissionId)
      .then((res) => {
        setSubmission(res);
        if (res?.assignmentId) {
          assignmentService.getAssignmentById(res.assignmentId).then(setAssignmentInfo).catch(() => {});
        }
      })
      .catch(() => showToast("Failed to load submission details.", "error"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  if (isLoading) return <LoadingSpinner label="Loading submission..." />;
  if (!submission) return <p className="text-sm text-slate-500">Submission not found.</p>;

  const canGrade = user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Submissions", href: ROUTES.SUBMISSIONS },
          { label: `Submission #${submission.id}` },
        ]}
      />

      {/* ─── PLAIN TEXT HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl tracking-tight">
            {submission.assignmentTitle}
          </h1>

          {/* ALL METADATA IN ONE SINGLE HORIZONTAL LINE (LEFT TO RIGHT) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Submitted by <span className="font-semibold text-slate-700 dark:text-slate-300">{submission.studentName}</span> ({submission.studentNumber})
            </span>

            {assignmentInfo?.createdAtUtc && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>
                  Posted: <strong className="text-slate-700 dark:text-slate-300">{formatDate(assignmentInfo.createdAtUtc)}</strong>
                </span>
              </>
            )}

            {assignmentInfo?.deadlineUtc && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>
                  Deadline: <strong className="text-slate-700 dark:text-slate-300">{formatDate(assignmentInfo.deadlineUtc)}</strong>
                </span>
              </>
            )}

            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className={assignmentInfo?.allowResubmission ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500"}>
              Resubmission: {assignmentInfo?.allowResubmission ? "Allowed" : "Not Allowed"}
            </span>

            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className={(assignmentInfo as any)?.allowLateSubmissions ?? true ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>
              Late Submission: {(assignmentInfo as any)?.allowLateSubmissions ?? true ? "Allowed" : "Not Allowed"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          <Badge variant={submission.status === "Graded" ? "success" : (submission.status as string) === "Missing" ? "error" : "warning"} size="md">
            {submission.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── LEFT / MAIN COLUMN (ONLY SUBMITTED FILE & PREVIEW) ─── */}
        <div className="lg:col-span-2 space-y-3">

          {/* CARD 1: SUBMITTED FILE & PREVIEW (SOLID SLATE CARD) */}
          {(submission.status as string) === "Missing" ? (
            <Card className="p-3 space-y-2 rounded-xl border border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950 shadow-xs">
              <CardHeader className="pb-1 border-b border-amber-200 dark:border-amber-800">
                <CardTitle className="text-base font-bold text-amber-950 dark:text-amber-100">
                  No Submitted File
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  This student did not submit any coursework before the assignment deadline, and late submissions were not permitted. The submission was automatically marked as Missing with 0 marks.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-3 space-y-2 rounded-xl border border-slate-300 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <CardHeader className="pb-1 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-base font-bold text-slate-950 dark:text-white">
                  Submitted File & Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilePreviewer submissionId={submission.id} fileUrl={submission.fileUrl} autoShowPreview={true} />
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Administrator Audit View
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submissions are read-only for system administrators. Marks evaluation and grading are reserved for subject instructors.
              </p>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN (METADATA + STUDENT NOTES + GRADE & EVALUATION FORM) ─── */}
        <div className="space-y-3">

          {/* CARD 4: SUBMISSION METADATA (SOLID BLUE CARD) */}
          <Card className="p-3 space-y-2 rounded-xl border border-blue-300 bg-blue-100 dark:border-blue-800 dark:bg-blue-950 shadow-xs">
            <CardHeader className="pb-1 border-b border-blue-200 dark:border-blue-900">
              <CardTitle className="text-sm font-bold text-blue-950 dark:text-blue-100">
                Submission Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-blue-900 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Student
                </span>
                <span className="font-semibold text-slate-950 dark:text-slate-100">{submission.studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-900 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Submitted At
                </span>
                <span className="font-semibold text-slate-950 dark:text-slate-100">
                  {formatDate(submission.submittedAtUtc)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-900 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Grade Assigned
                </span>
                <span className="font-bold">
                  {submission.marks !== undefined && submission.marks !== null && submission.status === "Graded" ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">{submission.marks} / {submission.maxMarks}</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-300 font-bold">Pending</span>
                  )}
                </span>
              </div>
              {submission.feedback && (
                <div className="pt-1.5 border-t border-blue-200 dark:border-blue-900">
                  <p className="font-bold text-blue-950 dark:text-blue-200 mb-0.5">Teacher Feedback</p>
                  <p className="text-slate-900 dark:text-slate-200 italic bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-md border border-blue-200 dark:border-blue-900">
                    "{submission.feedback}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: STUDENT NOTES / SUBMISSION TEXT (SOLID AMBER CARD) */}
          {submission.submissionText && (
            <Card className="p-3 space-y-2 rounded-xl border border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950 shadow-xs">
              <CardHeader className="pb-1 border-b border-amber-200 dark:border-amber-900">
                <CardTitle className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  Student Notes / Submission Text
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0.5">
                <p className="text-xs text-amber-950 dark:text-amber-200 whitespace-pre-line leading-relaxed font-medium">
                  {submission.submissionText}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CARD 3: GRADE & EVALUATION FORM (SOLID EMERALD CARD - PLACED UNDER STUDENT NOTES ON RIGHT SIDE) */}
          {canGrade && (submission.status as string) !== "Missing" && (
            <Card className="p-3 space-y-2 rounded-xl border border-emerald-300 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 shadow-xs">
              <CardHeader className="pb-1 border-b border-emerald-200 dark:border-emerald-900">
                <CardTitle className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Grade & Evaluation Form
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0.5">
                <SubmissionGradeForm submission={submission} onGraded={loadSubmission} />
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
