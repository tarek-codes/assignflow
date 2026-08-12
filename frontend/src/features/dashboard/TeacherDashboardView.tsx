"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Plus,
  UsersRound,
  GraduationCap,
  User as UserIcon,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { TeacherDashboardData } from "@/types/dashboard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatDate, formatFullDateTime } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";

export function TeacherDashboardView() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getTeacherDashboard()
      .then((res) => setData(res))
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading dashboard…" />;
  if (!data) return <p className="text-sm text-slate-500">Failed to load dashboard.</p>;

  const firstName = user?.fullName?.split(" ")[0] || "Teacher";
  const completionTotal = data.totalGraded + data.totalPendingReviews;
  const reviewProgress = completionTotal > 0 ? Math.round((data.totalGraded / completionTotal) * 100) : 100;

  const stats = [
    {
      label: t("navAssignments"),
      value: data.totalAssignments,
      helper: "View Created Assignments",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
      href: ROUTES.ASSIGNMENTS,
    },
    {
      label: "Ungraded Submissions",
      value: data.totalPendingReviews,
      helper: "To Be Graded",
      icon: Clock3,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
      href: `${ROUTES.SUBMISSIONS}?filter=pending`,
    },
    {
      label: t("lblGradedSubmissions"),
      value: data.totalGraded,
      helper: `${reviewProgress}% completion`,
      icon: ClipboardCheck,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
      href: `${ROUTES.SUBMISSIONS}?filter=graded`,
    },
  ];

  return (
    <div className="pt-3 sm:pt-4 space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 py-7 text-white shadow-xl shadow-blue-600/10 sm:px-8 sm:py-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* CIRCULAR PROFILE AVATAR PLACE (SLEEK GLASS CIRCLE WITH DEFAULT USER ICON) */}
            <div className="shrink-0">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white/50 bg-white/15 backdrop-blur-md shadow-xl shadow-blue-900/20 flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-white/10">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.fullName || "Teacher"} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white/90" />
                )}
              </div>
            </div>

            {/* WELCOME TEXT (SHIFTED TO THE RIGHT) */}
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hi, {firstName}</h1>
                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white border border-white/30 shadow-xs">
                  Teacher
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-100">
                <CalendarDays className="h-4 w-4 text-blue-200 shrink-0" />
                <span>{formatFullDateTime()}</span>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                {t("teacherDashboardWelcome")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <ThemeToggle variant="banner" />
            <Link href={ROUTES.CREATE_ASSIGNMENT}>
              <Button size="lg" className="w-full bg-white text-blue-600 shadow-lg hover:bg-blue-50 dark:bg-white dark:text-blue-600 dark:hover:bg-blue-50 sm:w-auto font-medium" leftIcon={<Plus className="h-4 w-4" />}>
                {t("btnCreateAssignment")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, helper, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 block"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{helper}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                <UsersRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pending reviews</h2>
                <p className="text-xs text-slate-400">Submissions waiting for feedback</p>
              </div>
            </div>
            <Link href={`${ROUTES.SUBMISSIONS}?filter=pending`} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.pendingReviews.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Review queue complete</p>
              <p className="mt-1 text-xs text-slate-400">All submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.pendingReviews.slice(0, 5).map((review) => (
                <div key={review.submissionId} className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {review.studentName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{review.studentName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{review.assignmentTitle} · {formatDate(review.submittedAtUtc)}</p>
                    </div>
                  </div>
                  <Link href={ROUTES.SUBMISSION_DETAILS(review.submissionId)}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 border-transparent shadow-xs" leftIcon={<GraduationCap className="h-3.5 w-3.5" />}>
                      Grade
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                <BookOpenCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Assignments</h2>
                <p className="text-xs text-slate-400">Your latest published assignments</p>
              </div>
            </div>
            <Link href={ROUTES.ASSIGNMENTS} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              View all <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </Link>
          </div>

          {data.recentAssignments.filter((a) => a.status === "Published" || a.status === "Draft").length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <BookOpenCheck className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No assignments yet</p>
              <p className="mt-1 text-xs text-slate-400">Create your first assignment to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.recentAssignments
                .filter((a) => a.status === "Published" || a.status === "Draft")
                .map((assignment) => (
                  <div key={assignment.id} className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{assignment.title}</p>
                        <Badge size="sm" variant={assignment.status === "Published" ? "success" : "default"}>{assignment.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{assignment.subjectName} · Class {assignment.classLevel} · {assignment.submissionCount} submissions</p>
                    </div>
                    <Link href={ROUTES.ASSIGNMENT_DETAILS(assignment.id)} className="shrink-0">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 border-transparent shadow-xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
