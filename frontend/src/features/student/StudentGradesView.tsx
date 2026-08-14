"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, BookOpen, CheckCircle2, Filter, MessageSquare, Search, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { useCachedData } from "@/hooks/useCachedData";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { getCurriculumSubjectsForClass, canonicalizeSubjectName } from "@/utils/classLevelConfig";
import { Pagination } from "@/components/common/Pagination";
import { useLanguage } from "@/context/LanguageContext";

const isSameSubject = (subA: string, subB: string): boolean => {
  if (!subA || !subB) return false;
  if (subB === "All" || subA === "All" || subB === "all" || subA === "all") return true;
  const a = subA.toLowerCase().trim();
  const b = subB.toLowerCase().trim();
  if (a === b || a.includes(b) || b.includes(a)) return true;
  if ((a.includes("bangla") || a.includes("bengali")) && (b.includes("bangla") || b.includes("bengali"))) return true;
  if (a.includes("english") && b.includes("english")) return true;
  if (a.includes("math") && b.includes("math")) return true;
  if ((a.includes("ict") || a.includes("digital") || a.includes("information")) && (b.includes("ict") || b.includes("digital") || b.includes("information"))) return true;
  return false;
};

export function StudentGradesView() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language, translateSubject } = useLanguage();
  const { data, isLoading } = useCachedData(
    user?.id ? `dashboard:student:${user.id}` : "dashboard:student",
    () => dashboardService.getStudentDashboard()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const grades = data?.grades || [];

  const subjects = useMemo(() => {
    const cLevel = data?.classLevel || 6;
    const grp = data?.group;
    const curriculum = getCurriculumSubjectsForClass(cLevel, grp);
    const set = new Set<string>();
    curriculum.forEach((s) => set.add(canonicalizeSubjectName(s)));
    grades.forEach((g) => {
      if (g.subjectName) set.add(canonicalizeSubjectName(g.subjectName));
    });
    return ["All", ...Array.from(set).sort()];
  }, [grades, data?.classLevel, data?.group]);

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchesSearch =
        g.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = isSameSubject(g.subjectName, selectedSubject);
      return matchesSearch && matchesSubject;
    });
  }, [grades, searchTerm, selectedSubject]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject]);

  const totalPages = Math.ceil(filteredGrades.length / pageSize);
  const paginatedGrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGrades.slice(start, start + pageSize);
  }, [filteredGrades, currentPage]);

  const stats = useMemo(() => {
    if (grades.length === 0) {
      return {
        avgPercentage: 0,
        totalGraded: 0,
        highestMark: 0,
        highestSubject: null as { name: string; avgPct: number } | null,
        lowestSubject: null as { name: string; avgPct: number } | null,
      };
    }
    let totalPct = 0;
    let highest = 0;
    const subjectMap: Record<string, { totalMarks: number; totalMax: number }> = {};

    grades.forEach((g) => {
      const pct = g.maxMarks > 0 ? (g.marks / g.maxMarks) * 100 : 0;
      totalPct += pct;
      if (pct > highest) highest = pct;

      const sub = g.subjectName || "General";
      if (!subjectMap[sub]) subjectMap[sub] = { totalMarks: 0, totalMax: 0 };
      subjectMap[sub].totalMarks += g.marks;
      subjectMap[sub].totalMax += g.maxMarks;
    });

    const subjectList = Object.entries(subjectMap).map(([name, d]) => {
      const avgPct = d.totalMax > 0 ? Math.round((d.totalMarks / d.totalMax) * 100) : 0;
      return { name, avgPct };
    });

    subjectList.sort((a, b) => b.avgPct - a.avgPct);

    return {
      avgPercentage: Math.round(totalPct / grades.length),
      totalGraded: data?.totalGraded || grades.length,
      highestMark: Math.round(highest),
      highestSubject: subjectList[0] || null,
      lowestSubject: subjectList.length > 1 ? subjectList[subjectList.length - 1] : subjectList[0] || null,
    };
  }, [grades, data]);

  const classRank = useMemo(() => {
    if (data?.positionInClass && data.positionInClass > 0) {
      return `#${data.positionInClass}`;
    }
    return "N/A";
  }, [data?.positionInClass]);

  if (isLoading) return <LoadingSpinner label="Loading grades..." />;
  if (!data) return <p className="text-sm text-slate-500">Failed to load grades data.</p>;

  return (
    <div className="space-y-7">
      {/* ─── HEADER ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 py-7 text-white shadow-xl shadow-blue-600/15 sm:px-8 sm:py-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-blue-100 backdrop-blur-sm">
              <Award className="h-3.5 w-3.5" /> {language === "bn" ? "অ্যাকাডেমিক পারফরম্যান্স" : "Academic performance"}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("navMyGrades")}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              {language === "bn"
                ? "আপনার মূল্যায়িত কাজ, নম্বর, শতকরা ফলাফল এবং শিক্ষকের মন্তব্য দেখুন।"
                : "Review your graded work, total marks, percentage results, and teacher feedback."}
            </p>
          </div>
          {grades.length > 0 && (
            <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 backdrop-blur-sm">
              <div>
                <p className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">{language === "bn" ? "গড় স্কোর" : "Average Score"}</p>
                <p className="text-2xl font-bold text-white tabular-nums">{stats.avgPercentage}%</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">{language === "bn" ? "শ্রেণীতে অবস্থান" : "Position in Class"}</p>
                <p className="text-2xl font-bold text-white tabular-nums">{classRank}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Graded Assignments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Graded Assignments</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl">
                {stats.totalGraded}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">Completed & evaluated</p>
        </div>

        {/* Card 2: Top Result (SWAPPED) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Result</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl">
                {stats.highestMark}%
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">Highest single score achieved</p>
        </div>

        {/* Card 3: Highest Performing Subject (SWAPPED) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Highest Performing Subject</p>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-950 dark:text-white truncate">
                {stats.highestSubject ? stats.highestSubject.name : "N/A"}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {stats.highestSubject ? `${stats.highestSubject.avgPct}% Avg Score` : "No graded subjects"}
          </p>
        </div>

        {/* Card 4: Lowest Performing Subject */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lowest Performing Subject</p>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-950 dark:text-white truncate">
                {stats.lowestSubject ? stats.lowestSubject.name : "N/A"}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {stats.lowestSubject ? `${stats.lowestSubject.avgPct}% Avg Score` : "No graded subjects"}
          </p>
        </div>
      </div>

      {/* ─── FILTER BAR ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search assignment or subject…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="text-xs"
          />
        </div>

        <div className="w-full sm:w-64 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjects.map((sub) => ({
              value: sub,
              label: sub === "All" ? "Filter by subject (All)" : sub,
            }))}
            className="text-xs font-semibold border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/30"
          />
        </div>
      </div>

      {/* ─── GRADES TABLE ─── */}
      {filteredGrades.length === 0 ? (
        <EmptyState
          title="No graded assignments found"
          description={
            searchTerm || selectedSubject !== "All"
              ? "No grades match your current search or filter criteria."
              : "Once your teachers grade your submitted work, your results and feedback will appear here."
          }
          icon={<Award className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment & Subject</TableHead>
                  <TableHead>Graded Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Teacher Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGrades.map((g) => {
                  const isGraded = g.marks !== undefined && g.marks !== null && g.gradedAtUtc;
                  const pct = isGraded && g.maxMarks > 0 ? Math.round((g.marks / g.maxMarks) * 100) : null;
                  const badgeVariant = pct !== null ? (pct >= 80 ? "success" : pct >= 60 ? "info" : "warning") : "warning";

                  return (
                    <TableRow
                      key={g.submissionId}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      onClick={() => router.push(ROUTES.SUBMISSION_DETAILS(g.submissionId))}
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 inline-flex items-center gap-1 group-hover:underline">
                            {g.assignmentTitle}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.subjectName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                        {g.gradedAtUtc ? formatDate(g.gradedAtUtc) : "Pending"}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {isGraded ? (
                          <>
                            {g.marks} <span className="text-xs font-normal text-slate-400">/ {g.maxMarks}</span>
                          </>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant} size="sm">
                          {pct !== null ? `${pct}%` : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {g.feedback ? (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            "{g.feedback}"
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No written feedback</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredGrades.length}
          />
        </div>
      )}
    </div>
  );
}
