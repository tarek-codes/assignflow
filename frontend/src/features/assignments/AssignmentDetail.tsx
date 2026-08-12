"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assignmentService } from "@/services/assignmentService";
import { submissionService } from "@/services/submissionService";
import { userService } from "@/services/userService";
import { AssignmentDetail as IAssignmentDetail } from "@/types/assignment";
import { SubmissionDetail, SubmissionListItem } from "@/types/submission";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileUpload } from "@/components/ui/FileUpload";
import { TextArea } from "@/components/ui/TextArea";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FilePreviewer } from "@/features/submissions/FilePreviewer";
import { Pagination } from "@/components/common/Pagination";
import {
  Calendar,
  Award,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  CheckCircle2,
  Users,
  Inbox,
  Percent,
  Clock,
  Eye,
  Download,
  FileText,
  Filter,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export function AssignmentDetail({ assignmentId }: { assignmentId: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [assignment, setAssignment] = useState<IAssignmentDetail | null>(null);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionListItem[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Foldable Description & Instructions State (Default Folded/Closed)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);

  // Filter state for student submissions table
  const [showUngradedOnly, setShowUngradedOnly] = useState<boolean>(false);

  // Student upload state
  const [file, setFile] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher preview modal & pagination
  const [previewSub, setPreviewSub] = useState<SubmissionListItem | null>(null);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const pageSize = 5;

  const isTeacher = user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isStudent = user?.role === ROLES.STUDENT;

  // Dynamic Submissions Counters
  const totalGradedCount = React.useMemo(
    () => allSubmissions.filter((s) => s.status === "Graded").length,
    [allSubmissions]
  );

  const ungradedSubmittedCount = React.useMemo(
    () => allSubmissions.filter((s) => s.status !== "Graded" && (s.status as string) !== "Missing").length,
    [allSubmissions]
  );

  // Actual submissions submitted by students (excluding Missing status)
  const actualSubmittedCount = React.useMemo(
    () => allSubmissions.filter((s) => (s.status as string) !== "Missing" && s.submittedAtUtc != null).length,
    [allSubmissions]
  );
  
  // Filtered submissions list — ungraded = submitted but not graded (excludes Missing)
  const filteredSubmissions = React.useMemo(() => {
    let list = allSubmissions;
    if (showUngradedOnly) {
      list = allSubmissions.filter((s) => s.status !== "Graded" && (s.status as string) !== "Missing");
    }
    // Sort Missing to the end
    return [...list].sort((a, b) => {
      const aMissing = (a.status as string) === "Missing" ? 1 : 0;
      const bMissing = (b.status as string) === "Missing" ? 1 : 0;
      return aMissing - bMissing;
    });
  }, [allSubmissions, showUngradedOnly]);

  const totalSubmissionsPages = Math.ceil(filteredSubmissions.length / pageSize);
  const paginatedSubmissions = React.useMemo(() => {
    const start = (submissionsPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, submissionsPage, pageSize]);

  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const assignRes = await assignmentService.getAssignmentById(assignmentId);
      setAssignment(assignRes);

      if (isTeacher || isAdmin) {
        const [allStudents, allSubRes] = await Promise.all([
          userService.getAllStudents().catch(() => []),
          submissionService.getSubmissionsForAssignment(assignmentId, { pageNumber: 1, pageSize: 100 }).catch(() => null),
        ]);

        if (assignRes?.classLevel && allStudents.length > 0) {
          const classStudents = allStudents.filter(
            (s) => Number(s.classLevel) === Number(assignRes.classLevel)
          );
          setEnrolledStudentsCount(classStudents.length);
        }

        if (allSubRes?.items) {
          setAllSubmissions(allSubRes.items);
          setSubmissionsCount(allSubRes.totalCount ?? allSubRes.items.length);
        } else if (allSubRes?.totalCount !== undefined) {
          setSubmissionsCount(allSubRes.totalCount);
        }
      }

      if (isStudent) {
        const subRes = await submissionService.getMySubmission(assignmentId).catch(() => null);
        if (subRes) {
          setSubmission(subRes);
          if (subRes.submissionText) setSubmissionText(subRes.submissionText);
        }
      }
    } catch (err) {
      showToast("Failed to load assignment details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  if (isLoading) return <LoadingSpinner label="Loading assignment details..." />;
  if (!assignment) return <p className="text-sm text-slate-500">Assignment not found.</p>;

  // Dynamic Analytics calculation matching classroom total enrolled students
  const expectedCount =
    enrolledStudentsCount !== null && enrolledStudentsCount > 0
      ? enrolledStudentsCount
      : Math.max(allSubmissions.length, 1);

  const currentCount = actualSubmittedCount;
  const percentage = expectedCount > 0 ? Math.min(100, Math.round((currentCount / expectedCount) * 100)) : 0;
  
  const gradingLeftCount = ungradedSubmittedCount;

  // Auto-mark status as Closed if deadline has passed
  const isPastDeadline = assignment?.deadlineUtc ? new Date(assignment.deadlineUtc).getTime() < Date.now() : false;
  const displayStatus = isPastDeadline || assignment?.status === "Closed" ? "Closed" : assignment?.status;

  const handlePublish = async () => {
    try {
      await assignmentService.publishAssignment(assignmentId);
      showToast("Assignment published successfully!", "success");
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to publish assignment.", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await assignmentService.deleteAssignment(assignmentId);
      showToast("Assignment deleted successfully.", "success");
      router.push(ROUTES.ASSIGNMENTS);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete assignment.", "error");
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast("Please select a PDF or DOCX file to upload.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionService.submitOrReplace(assignmentId, {
        file,
        submissionText,
      });
      showToast("Assignment submitted successfully!", "success");
      setFile(null);
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to submit assignment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* BREADCRUMB & BACK LINK */}
      <div className="flex items-center justify-between">
        <Link
          href={isStudent ? ROUTES.DASHBOARD : ROUTES.ASSIGNMENTS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to {isStudent ? "Dashboard" : "Assignments"}</span>
        </Link>
      </div>

      {/* ───────────────── TOP CARD (WIDER & TALLER) ───────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Header Row: Left (Title + Subject + Class) | Right (Status + Score) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {assignment.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center px-3 py-1 rounded-md font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                {assignment.subjectName}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-md font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Class {assignment.classLevel}
              </span>
            </div>
          </div>

          {/* TOP RIGHT: STATUS BADGE & SCORES (FOR STUDENTS) OR ACTIONS (TEACHERS) */}
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            {isStudent && (
              <>
                {submission ? (
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {submission.status === "Graded" && submission.marks !== undefined ? (
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-medium block">Score</span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {submission.marks} / {submission.maxMarks || assignment.maxMarks}{" "}
                            <span className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80">Marks</span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Pending Evaluation</span>
                      )}

                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          submission.status === "Graded"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/60"
                            : submission.status === "Late"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/60"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/60"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    <div className="space-y-1 mt-1 text-right">
                      <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <span className="text-slate-400 font-normal">Submitted on: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatDate(submission.submittedAtUtc)}
                        </span>
                      </div>

                      {submission.submissionText && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xs sm:max-w-sm ml-auto leading-relaxed text-right">
                          <span className="font-bold text-slate-700 dark:text-slate-300 not-italic">Note: </span>
                          <span className="italic">
                            "{submission.submissionText}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-400 border border-slate-200 dark:border-slate-700">
                    Not Submitted
                  </span>
                )}
              </>
            )}

            {(isTeacher || isAdmin) && (
              <div className="flex items-center gap-2">
                <Badge variant={displayStatus === "Closed" ? "danger" : displayStatus === "Published" ? "success" : "default"}>
                  {displayStatus}
                </Badge>
                {isTeacher && !isAdmin && (
                  <>
                    {assignment.status === "Draft" && (
                      <Button size="sm" onClick={handlePublish} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                        Publish
                      </Button>
                    )}
                    <Link href={ROUTES.EDIT_ASSIGNMENT(assignment.id)}>
                      <Button size="sm" variant="outline" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                        Edit
                      </Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={handleDelete} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Compact Inline Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div>
            <span className="text-slate-400 font-medium">Posted: </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(assignment.createdAtUtc || assignment.deadlineUtc)}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
          <div>
            <span className="text-slate-400 font-medium">Deadline: </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(assignment.deadlineUtc)}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
          <div>
            <span className="text-slate-400 font-medium">Max Marks: </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{assignment.maxMarks} Marks</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
          <div>
            <span className="text-slate-400 font-medium">Resubmission: </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {assignment.allowResubmission ? "Allowed" : "Single Only"}
            </span>
          </div>
        </div>

        {/* Description & Instructions */}
        {(assignment.description || assignment.instructions) && (
          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
            {assignment.description && (
              <p className="whitespace-pre-line leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-slate-200">Description: </span>
                {assignment.description}
              </p>
            )}
            {assignment.instructions && (
              <p className="whitespace-pre-line leading-relaxed text-slate-500 dark:text-slate-400 pt-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Instructions: </span>
                {assignment.instructions}
              </p>
            )}
          </div>
        )}

        {/* STUDENT SUBMISSION SECTION */}
        {isStudent && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {submission ? (
              <div className="space-y-4">
                {submission.status === "Graded" && submission.feedback && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    <span className="font-bold text-amber-800 dark:text-amber-200">Teacher's Feedback: </span>
                    "{submission.feedback}"
                  </p>
                )}

                {submission.fileUrl && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Submitted Work File
                    </p>
                    <FilePreviewer submissionId={submission.id} fileUrl={submission.fileUrl} />
                  </div>
                )}

                {assignment.allowResubmission && submission.status !== "Graded" && (
                  <form onSubmit={handleStudentSubmit} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <FileUpload
                      label="Replace Submission File (PDF or DOCX)"
                      accept=".pdf,.docx"
                      onFileSelect={(f) => setFile(f)}
                    />
                    <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
                      Replace Submission
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <FileUpload
                  label="Upload Submission File (PDF or DOCX)"
                  accept=".pdf,.docx"
                  onFileSelect={(f) => setFile(f)}
                />
                <TextArea
                  label="Submission Comments / Text (Optional)"
                  placeholder="Add notes for your teacher..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                />
                <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Submit Assignment
                </Button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ───────────────── BOTTOM CARD: TEACHER & ADMIN SUBMISSIONS WORKSPACE ───────────────── */}
      {(isTeacher || isAdmin) && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Student Submissions ({filteredSubmissions.length})
              </h2>

              {/* DYNAMIC LIVE COUNTERS */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Submissions Received: {currentCount}/{expectedCount}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {percentage}%
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Total Graded: {totalGradedCount}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Grading Left: {gradingLeftCount}
                </span>
              </div>

              {/* CLICKABLE "SHOW UNGRADED ONLY" FILTER */}
              <button
                type="button"
                onClick={() => {
                  setShowUngradedOnly((prev) => !prev);
                  setSubmissionsPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  showUngradedOnly
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {showUngradedOnly ? "Showing Ungraded Only" : "Show Ungraded Only"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {allSubmissions.length === 0 ? (
              <EmptyState
                title="No student submissions yet"
                description="No students have turned in their work for this assignment so far."
                icon={<Inbox className="w-10 h-10 text-slate-400" />}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedSubmissions.map((sub) => {
                const isPdf = sub.fileUrl?.toLowerCase().endsWith(".pdf");
                const downloadUrl = sub.fileUrl ? submissionService.getDownloadUrl(sub.id) : null;
                return (
                  <div key={sub.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {sub.studentName}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">{sub.studentNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-slate-400">Submitted</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(sub.submittedAtUtc)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          sub.status === "Graded" ? "success" :
                          sub.status === "Late" ? "warning" :
                          (sub.status as string) === "Missing" ? "error" : "info"
                        }
                        size="sm"
                      >
                        {sub.status === "Graded" ? `${sub.marks}/${sub.maxMarks}` :
                         (sub.status as string) === "Missing" ? "Missing" :
                         sub.status === "Late" ? "Late" : "Pending"}
                      </Badge>
                      {sub.fileUrl && (sub.status as string) !== "Missing" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Preview submission"
                            onClick={() => setPreviewSub(sub)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Preview
                          </Button>
                          {downloadUrl && (
                            <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Download submission"
                                leftIcon={<Download className="w-3.5 h-3.5" />}
                              >
                                Download
                              </Button>
                            </a>
                          )}
                        </>
                      )}
                      <Link href={ROUTES.SUBMISSION_DETAILS(sub.id)}>
                        {isTeacher && (sub.status === "Submitted" || sub.status === "Late" || sub.status === "UnderReview") ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 border-transparent shadow-xs"
                            leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                          >
                            Grade
                          </Button>
                        ) : isTeacher ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 border-transparent shadow-xs"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Details
                          </Button>
                        )}
                      </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Pagination
              currentPage={submissionsPage}
              totalPages={totalSubmissionsPages}
              onPageChange={setSubmissionsPage}
              showRange
              pageSize={pageSize}
              totalItems={filteredSubmissions.length}
              className="pt-3 border-t border-slate-100 dark:border-slate-800"
            />
          </div>
        </div>
      )}

      {/* TEACHER SUBMISSION PREVIEW MODAL */}
      <Modal
        isOpen={previewSub !== null}
        onClose={() => setPreviewSub(null)}
        title={`Submission — ${previewSub?.studentName}`}
        description={`${previewSub?.studentNumber} · Submitted ${formatDate(previewSub?.submittedAtUtc)}`}
        maxWidth="3xl"
      >
        {previewSub && (
          <div className="space-y-4">
            <FilePreviewer submissionId={previewSub.id} fileUrl={previewSub.fileUrl} autoShowPreview={true} />
            {previewSub.submissionText && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Student Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {previewSub.submissionText}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
