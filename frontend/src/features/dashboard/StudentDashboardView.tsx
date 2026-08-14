"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submissionService } from "@/services/submissionService";
import { assignmentService } from "@/services/assignmentService";
import { dashboardService } from "@/services/dashboardService";
import { useCachedData, invalidateCachedPrefix } from "@/hooks/useCachedData";
import { cn } from "@/utils/cn";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { StudentDashboardData, StudentUpcomingAssignment } from "@/types/dashboard";
import { SubmissionDetail } from "@/types/submission";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { FilePreviewer } from "@/features/submissions/FilePreviewer";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FullscreenToggle } from "@/components/ui/FullscreenToggle";
import { Avatar } from "@/components/ui/Avatar";
import {
  Award,
  BookOpen,
  CalendarDays,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Clock3,
  Timer,

  Send,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Laptop,
  Globe,
  BookText,
  Landmark,
  HeartHandshake,
  Receipt,
  Coins,
  Binary,
} from "lucide-react";
import { formatDate, formatFullDateTime } from "@/utils/formatters";
import { getCurriculumSubjectsForClass } from "@/utils/classLevelConfig";

function CountdownTimer({ deadlineUtc }: { deadlineUtc: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number; isOverdue: boolean }>({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
    isOverdue: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(deadlineUtc).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, isOverdue: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, mins, secs, isOverdue: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadlineUtc]);

  if (timeLeft.isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200/80 dark:border-rose-900/60 shadow-xs">
        <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>Past Deadline</span>
      </span>
    );
  }

  const isUrgent = timeLeft.days === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-colors",
        isUrgent
          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80"
          : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80"
      )}
    >
      <Clock className={cn("w-3.5 h-3.5 shrink-0", isUrgent ? "text-amber-500 animate-pulse" : "text-blue-500")} />
      <span>
        {timeLeft.days > 0
          ? `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.mins).padStart(2, "0")}m ${String(timeLeft.secs).padStart(2, "0")}s left`
          : `${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.mins).padStart(2, "0")}m ${String(timeLeft.secs).padStart(2, "0")}s left`}
      </span>

    </span>
  );
}


function getSubjectThemeConfig(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics")) {
    return { icon: Atom, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300" };
  }
  if (n.includes("chem")) {
    return { icon: FlaskConical, bg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300" };
  }
  if (n.includes("bio")) {
    return { icon: Dna, bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" };
  }
  if (n.includes("ict") || n.includes("computer") || n.includes("info") || n.includes("digital") || n.includes("tech")) {
    return { icon: Laptop, bg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300" };
  }
  if (n.includes("higher math")) {
    return { icon: Binary, bg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300" };
  }
  if (n.includes("math")) {
    return { icon: Calculator, bg: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300" };
  }
  if (n.includes("bengali") || n.includes("bangla")) {
    return { icon: BookText, bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300" };
  }
  if (n.includes("eng")) {
    return { icon: Globe, bg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300" };
  }
  if (n.includes("bgs") || n.includes("global") || n.includes("history") || n.includes("social")) {
    return { icon: Landmark, bg: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300" };
  }
  if (n.includes("relig") || n.includes("moral")) {
    return { icon: HeartHandshake, bg: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300" };
  }
  if (n.includes("account")) {
    return { icon: Receipt, bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" };
  }
  if (n.includes("finan") || n.includes("bank")) {
    return { icon: Coins, bg: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-300" };
  }
  if (n.includes("art") || n.includes("culture")) {
    return { icon: Sparkles, bg: "bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300" };
  }
  if (n.includes("health") || n.includes("life") || n.includes("livelihood")) {
    return { icon: TrendingUp, bg: "bg-green-50 text-green-600 dark:bg-green-950/60 dark:text-green-300" };
  }
  return { icon: BookOpen, bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
}

interface SubjectGroup {
  subjectName: string;
  classLevel: number;
  totalAssignments: number;
  dueCount: number;
  submittedCount: number;
  assignments: StudentUpcomingAssignment[];
}

function matchSubjectKey(subName: string, curriculumSubjects: string[]): string {
  if (!subName) return "";
  const clean = subName.toLowerCase().trim();
  for (const currSub of curriculumSubjects) {
    const cClean = currSub.toLowerCase().trim();
    if (
      clean === cClean ||
      clean.includes(cClean) ||
      cClean.includes(clean) ||
      (cClean.includes("bangla") && clean.includes("bengali")) ||
      (cClean.includes("english") && clean.includes("english")) ||
      (cClean.includes("math") && clean.includes("math")) ||
      (cClean.includes("religion") && clean.includes("relig")) ||
      (cClean.includes("ict") && (clean.includes("ict") || clean.includes("info") || clean.includes("digital"))) ||
      (cClean.includes("bgs") && clean.includes("global"))
    ) {
      return currSub;
    }
  }
  return subName;
}

export function StudentDashboardView() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language, translateSubject, translateClass, translateUserName, toBanglaDigits } = useLanguage();
  const { showToast } = useToast();
  const { data, isLoading, refetch: refetchDashboard } = useCachedData(
    "dashboard:student",
    () => dashboardService.getStudentDashboard()
  );

  // Proactive background prefetching immediately after student dashboard loads
  useEffect(() => {
    if (!isLoading && data && user) {
      const timer = setTimeout(() => {
        assignmentService.getAllAssignments().catch(() => {});
        submissionService.getMySubmissionsFull().catch(() => {});
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, data, user]);

  const [selectedAssignment, setSelectedAssignment] = useState<StudentUpcomingAssignment | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionDetail | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<SubjectGroup | null>(null);

  const subjectGroups = useMemo<SubjectGroup[]>(() => {
    const level = data?.classLevel || 10;
    const group = data?.group || "Science";
    const curriculumSubjects = getCurriculumSubjectsForClass(level, group);

    const upcoming = data?.upcomingAssignments || [];

    const assignmentMap = new Map<string, StudentUpcomingAssignment[]>();
    upcoming.forEach((a) => {
      const key = matchSubjectKey(a.subjectName, curriculumSubjects);
      if (!assignmentMap.has(key)) assignmentMap.set(key, []);
      assignmentMap.get(key)!.push(a);
    });

    return curriculumSubjects.map((subjectName) => {
      const assignments = assignmentMap.get(subjectName) || [];
      return {
        subjectName,
        classLevel: level,
        totalAssignments: assignments.length,
        dueCount: assignments.filter((a) => !a.hasSubmitted).length,
        submittedCount: assignments.filter((a) => a.hasSubmitted).length,
        assignments,
      };
    });
  }, [data]);


  const activeSubjectGroup = useMemo(() => {
    if (!selectedSubject) return null;
    return subjectGroups.find((g) => g.subjectName === selectedSubject.subjectName) || selectedSubject;
  }, [subjectGroups, selectedSubject]);

  // Used by the Pending Assignments modal to list individual unsubmitted upcoming assignments
  const pendingAssignments = useMemo(() => {
    if (!data) return [];
    return (data.upcomingAssignments || []).filter((a) => !a.hasSubmitted);
  }, [data]);

  const handleOpenAssignment = (assignment: StudentUpcomingAssignment) => {
    setSelectedAssignment(assignment);
    setCurrentSubmission(null);
    setFile(null);
    setSubmissionText("");
    // Fetch existing submission if already submitted
    if (assignment.hasSubmitted) {
      submissionService.getMySubmission(assignment.assignmentId).then((sub) => {
        if (sub) setCurrentSubmission(sub);
      }).catch(() => { });
    }
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
    setCurrentSubmission(null);
    setFile(null);
    setSubmissionText("");
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!file) {
      showToast("Please select a file to submit.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await submissionService.submitOrReplace(selectedAssignment.assignmentId, {
        file,
        submissionText,
      });
      showToast("Assignment submitted successfully!", "success");
      handleCloseModal();

      await invalidateCachedPrefix("dashboard:");
      await invalidateCachedPrefix("submissions:");
      const res = await refetchDashboard();

      // If user is currently in a subject drill-in view, sync selectedSubject with fresh data
      if (selectedSubject && res) {
        const level = res.classLevel || 10;
        const group = res.group || "Science";
        const curriculumSubjects = getCurriculumSubjectsForClass(level, group);

        const assignmentMap = new Map<string, StudentUpcomingAssignment[]>();
        (res.upcomingAssignments || []).forEach((a) => {
          const key = a.subjectName.trim();
          if (!assignmentMap.has(key)) assignmentMap.set(key, []);
          assignmentMap.get(key)!.push(a);
        });

        const updatedSubjectAssignments = assignmentMap.get(selectedSubject.subjectName) || [];
        setSelectedSubject({
          ...selectedSubject,
          totalAssignments: updatedSubjectAssignments.length,
          dueCount: updatedSubjectAssignments.filter((a) => !a.hasSubmitted).length,
          submittedCount: updatedSubjectAssignments.filter((a) => a.hasSubmitted).length,
          assignments: updatedSubjectAssignments,
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to submit assignment.";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading dashboard..." />;
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{"Failed to load dashboard."}</p>
      <button
        onClick={() => refetchDashboard()}
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );

  const displayName = user?.fullName || data.studentName || "Student";
  const firstName = displayName.split(" ")[0];
  const studentClass = data.classLevel ? translateClass(data.classLevel) : translateClass(9);
  const rawGroup = data.group && data.group !== "None" ? data.group : "Science";
  const studentGroupBadge =
    data.classLevel && data.classLevel >= 9
      ? `${rawGroup} Group`
      : "";
  const studentId = data.studentNumber || "BD-2026-001";

  return (
    <div className="pt-3 sm:pt-4 space-y-8">

      {/* HEADER */}
      <section className="relative rounded-3xl bg-blue-600 px-6 py-7 text-white shadow-xl shadow-blue-600/10 sm:px-8 sm:py-8 z-10">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* CIRCULAR PROFILE AVATAR PLACE (SLEEK GLASS CIRCLE WITH DYNAMIC GENDER AVATAR OR CUSTOM PHOTO) */}
            <div className="shrink-0">
              <Avatar
                name={user?.fullName || "Student"}
                gender={user?.gender}
                isCurrentUser
                size="2xl"
                className="border-2 border-white/50 bg-white/15 backdrop-blur-md shadow-xl shadow-blue-900/20 ring-4 ring-white/10"
              />
            </div>

            {/* WELCOME TEXT (SHIFTED TO THE RIGHT) */}
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {language === "bn" ? `হ্যালো, ${translateUserName(firstName)}` : `Hi, ${firstName}`}
                </h1>
                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white border border-white/30 shadow-xs">
                  {t("navRoleStudent")}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-100">
                <CalendarDays className="h-4 w-4 text-blue-200 shrink-0" />
                <span>{formatFullDateTime(undefined, language)}</span>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                {t("studentDashboardWelcome")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            {/* CLASS CARD */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <CalendarDays className="h-5 w-5 text-blue-100" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{studentClass}</span>
                  {studentGroupBadge && (
                    <span className="inline-flex items-center rounded-full bg-white text-blue-700 font-extrabold px-2.5 py-0.5 text-xs shadow-sm">
                      {language === "bn"
                        ? `${rawGroup === "Science" ? "বিজ্ঞান" : rawGroup === "Business" ? "ব্যবসায় শিক্ষা" : "মানবিক"} বিভাগ`
                        : studentGroupBadge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-blue-100">{toBanglaDigits(studentId)}</p>
              </div>
            </div>

            {/* NOTIFICATION BELL, THEME TOGGLE & FULLSCREEN TOGGLE */}
            <NotificationDropdown variant="banner" />
            <ThemeToggle variant="banner" />
            <FullscreenToggle />
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t("lblPendingSubmissions"), value: toBanglaDigits(data.totalPending), helper: t("hlpNeedsAttention"), icon: Clock3, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300", onClick: () => setShowPendingModal(true) },
          { label: t("lblTotalSubmissions"), value: toBanglaDigits(data.totalSubmitted), helper: t("hlpWorkTurnedIn"), icon: CheckCircle2, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300", onClick: () => router.push(ROUTES.SUBMISSIONS) },
          { label: t("lblLateSubmissions"), value: toBanglaDigits(data.totalLate), helper: t("hlpPastDeadline"), icon: Clock3, color: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300", onClick: () => router.push(`${ROUTES.SUBMISSIONS}?status=late`) },
          { label: t("lblGradedSubmissions"), value: toBanglaDigits(data.grades ? data.grades.length : (data.totalGraded || 0)), helper: t("hlpFeedbackPublished"), icon: Award, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300", onClick: () => router.push(`${ROUTES.SUBMISSIONS}?status=graded`) },
        ].map(({ label, value, helper, icon: Icon, color, onClick }) => (
          <button key={label} onClick={onClick} className="text-left w-full cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl">{value}</p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">{helper}</p>
          </button>
        ))}
      </div>

      {/* SUBJECTS or DRILL-IN */}
      {!activeSubjectGroup ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {language === "bn" ? "আপনার বিষয়সমূহ" : "Your subjects"}
            </h2>
            <span className="text-slate-300 dark:text-slate-600 text-sm">·</span>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {language === "bn"
                ? "অ্যাসাইনমেন্ট ও ডেডলাইন দেখতে যেকোনো বিষয় নির্বাচন করুন।"
                : "Open a subject to see its assignments and deadlines."}
            </p>
          </div>

          {subjectGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-10 text-center">
              <p className="text-sm text-slate-400">
                {language === "bn" ? "বর্তমানে কোনো সক্রিয় বিষয় নেই।" : "No active subjects at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjectGroups.map((group) => {
                const { icon: SubjectIcon, bg: themeBg } = getSubjectThemeConfig(group.subjectName);
                return (
                  <button
                    key={group.subjectName}
                    onClick={() => setSelectedSubject(group)}
                    className="group text-left rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${themeBg}`}>
                        <SubjectIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 truncate transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
                        {translateSubject(group.subjectName)}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${group.dueCount > 0
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50"
                        }`}>
                        <span className={`h-2 w-2 rounded-full ${group.dueCount > 0 ? "bg-amber-500 dark:bg-amber-400" : "bg-emerald-500 dark:bg-emerald-400"
                          }`} />
                        {group.dueCount > 0
                          ? language === "bn" ? `${group.dueCount} টি বাকি` : `${group.dueCount} due`
                          : language === "bn" ? "০ টি বাকি" : "0 due"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SUBJECT ASSIGNMENTS DRILL-IN */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSubject(null)}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {translateSubject(activeSubjectGroup.subjectName)}
                </h2>
                {(() => {
                  const assignedTeacher = activeSubjectGroup.assignments.find((a) => a.teacherName)?.teacherName;
                  return assignedTeacher ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/60">
                      <UserIcon className="w-3 h-3 shrink-0" />
                      {language === "bn" ? `শিক্ষক: ${assignedTeacher}` : `Teacher: ${assignedTeacher}`}
                    </span>
                  ) : null;
                })()}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {activeSubjectGroup.assignments.length}{" "}
                {language === "bn" ? "টি অ্যাসাইনমেন্ট" : `assignment${activeSubjectGroup.assignments.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {(() => {
            const dueList = activeSubjectGroup.assignments.filter((a) => !a.hasSubmitted);

            return (
              <div className="pt-1">
                {dueList.length === 0 ? (
                  <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {language === "bn"
                        ? `বর্তমানে ${translateSubject(activeSubjectGroup.subjectName)} বিষয়ে কোনো বকেয়া অ্যাসাইনমেন্ট নেই।`
                        : `No due assignments for ${translateSubject(activeSubjectGroup.subjectName)}.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dueList.map((a) => (
                      <button
                        key={a.assignmentId}
                        onClick={() => handleOpenAssignment(a)}
                        className="w-full text-left py-3.5 flex items-center gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors group"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0 bg-amber-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {a.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-400 dark:text-slate-500">
                            <span>Posted {formatDate(a.createdAtUtc || a.deadlineUtc)}</span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span>Due {formatDate(a.deadlineUtc)}</span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span>{a.maxMarks} marks</span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <CountdownTimer deadlineUtc={a.deadlineUtc} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                          Action Required
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* PENDING SUBMISSIONS POPUP MODAL */}
      <Modal
        isOpen={showPendingModal}
        onClose={() => { setShowPendingModal(false); setPendingPage(1); }}
        title={language === "bn" ? "অপেক্ষমান অ্যাসাইনমেন্টসমূহ" : "Pending Assignments"}
        description={language === "bn" ? "জমা দেওয়ার জন্য অপেক্ষমান সকল অ্যাসাইনমেন্ট" : "All pending assignments awaiting your submission"}
        maxWidth="6xl"
      >
        <div className="space-y-4 pt-2 min-h-[420px] sm:min-h-[480px] flex flex-col justify-between">
          {pendingAssignments.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />}
              title={language === "bn" ? "কোনো অপেক্ষমান অ্যাসাইনমেন্ট নেই" : "No Pending Assignments"}
              description={language === "bn" ? "আপনার সকল অ্যাসাইনমেন্ট জমা সম্পন্ন হয়েছে!" : "You have no pending assignments right now. All tasks are submitted!"}
            />
          ) : (() => {
            const PENDING_PER_PAGE = 10;
            const totalPendingPages = Math.ceil(pendingAssignments.length / PENDING_PER_PAGE);
            const pagedPending = pendingAssignments.slice((pendingPage - 1) * PENDING_PER_PAGE, pendingPage * PENDING_PER_PAGE);
            return (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-950 dark:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider divide-x divide-slate-700/60">
                      <tr>
                        <th className="px-6 py-4 font-bold text-white w-2/5">{language === "bn" ? "শিরোনাম" : "Title"}</th>
                        <th className="px-6 py-4 font-bold text-white w-1/5">{language === "bn" ? "বিষয়" : "Subject"}</th>
                        <th className="px-6 py-4 font-bold text-white w-1/5">{language === "bn" ? "জমার শেষ তারিখ" : "Due Date"}</th>
                        <th className="px-6 py-4 font-bold text-white text-right w-1/5">{language === "bn" ? "অবশিষ্ট সময়" : "Time Remaining"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-800 dark:text-slate-200">
                      {pagedPending.map((a) => (
                        <tr key={a.assignmentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors duration-150 divide-x divide-slate-100 dark:divide-slate-700/50">
                          <td className="px-6 py-4 text-sm font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setShowPendingModal(false);
                                setPendingPage(1);
                                const g = subjectGroups.find(
                                  (sub) => sub.subjectName.trim().toLowerCase() === a.subjectName.trim().toLowerCase()
                                );
                                if (g) setSelectedSubject(g);
                                handleOpenAssignment(a);
                              }}
                              className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer transition-colors"
                            >
                              {a.title}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge variant="default" className="font-semibold text-xs px-2.5 py-1">
                              {translateSubject(a.subjectName)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {formatDate(a.deadlineUtc)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <CountdownTimer deadlineUtc={a.deadlineUtc} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPendingPages > 1 && (
                  <div className="flex items-center justify-between pt-1 px-1">
                    <p className="text-xs text-slate-400">
                      {`Showing ${(pendingPage - 1) * PENDING_PER_PAGE + 1}–${Math.min(pendingPage * PENDING_PER_PAGE, pendingAssignments.length)} of ${pendingAssignments.length}`}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                        disabled={pendingPage === 1}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                      </button>
                      {Array.from({ length: totalPendingPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPendingPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold border transition-colors ${
                            p === pendingPage
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPendingPage((p) => Math.min(totalPendingPages, p + 1))}
                        disabled={pendingPage === totalPendingPages}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Modal>


      {/* ASSIGNMENT DETAIL MODAL */}
      <Modal
        isOpen={selectedAssignment !== null}
        onClose={handleCloseModal}
        title={selectedAssignment?.title ?? "Assignment Details"}
        description={selectedAssignment?.subjectName ?? ""}
        maxWidth="2xl"
      >
        {selectedAssignment && (
          <form onSubmit={handleSubmitAssignment} className="space-y-5">
            {/* Meta */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Deadline</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(selectedAssignment.deadlineUtc)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Max Marks</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedAssignment.maxMarks}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Status</p>
                <p className={`font-medium ${selectedAssignment.hasSubmitted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
                  }`}>
                  {selectedAssignment.hasSubmitted ? "Submitted" : "Pending"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Description</p>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                {selectedAssignment.description || "No description provided."}
              </div>
            </div>

            {/* Instructions */}
            {selectedAssignment.instructions && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Instructions</p>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedAssignment.instructions}
                </div>
              </div>
            )}

            {/* Existing submission preview */}
            {currentSubmission && currentSubmission.fileUrl && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your submitted file</p>
                <FilePreviewer submissionId={currentSubmission.id} fileUrl={currentSubmission.fileUrl} />
              </div>
            )}

            {/* Upload */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {selectedAssignment.hasSubmitted ? "Replace your submission" : "Your submission"}
              </p>

              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
                  File <span className="text-slate-400">(PDF, DOCX, ZIP, PNG, etc.)</span>
                </label>
                <Input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                {file && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                    {file.name} - {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
                  Notes <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Add any notes for your teacher..."
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                {selectedAssignment.hasSubmitted ? "Resubmit" : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
