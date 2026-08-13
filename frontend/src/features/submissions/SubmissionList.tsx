"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { submissionService } from "@/services/submissionService";
import { SubmissionListItem } from "@/types/submission";
import { useCachedData } from "@/hooks/useCachedData";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Upload, Search, Filter, RotateCcw, ArrowUpRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/common/Pagination";
import { formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { getClassSolidBadge, getCurriculumSubjectsForClass, canonicalizeSubjectName } from "@/utils/classLevelConfig";

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

function parseSubClassAndSubject(sub: SubmissionListItem) {
  let level = (sub as any).classLevel;
  let subject = (sub as any).subjectName;

  if ((!level || !subject) && sub.classSubject) {
    const matchClass = sub.classSubject.match(/Class\s*(\d+)/i);
    if (matchClass) {
      level = parseInt(matchClass[1], 10);
    }
    const parts = sub.classSubject.split(/[-·—(]/);
    if (parts.length > 1) {
      subject = parts[1].replace(/\)$/, "").trim();
    }
  }

  return {
    classLevel: level || 0,
    subjectName: canonicalizeSubjectName(subject),
  };
}

export function SubmissionList() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const rawParam = (searchParams.get("filter") || searchParams.get("status") || "").toLowerCase();
  const initialFilter = rawParam === "ungraded" ? "pending" : ["all", "pending", "graded", "late", "missing"].includes(rawParam) ? rawParam : "all";

  const isTeacher = user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isStudent = user?.role === ROLES.STUDENT;

  const pageTitle = isStudent
    ? "My Submissions"
    : isTeacher
    ? "Received Submissions"
    : "Submissions Workspace";

  const pageSubtitle = isStudent
    ? "Track your submitted coursework, status, and assigned marks"
    : isTeacher
    ? "Review and grade student submissions for your classrooms"
    : "Audit student submissions across classrooms";

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const submissionCacheKey = `submissions:full:list:${user?.id || "guest"}:${user?.role || "all"}`;
  const { data: allSubmissions = [], isLoading } = useCachedData<SubmissionListItem[]>(
    submissionCacheKey,
    async () => {
      return isStudent
        ? await submissionService.getMySubmissionsFull()
        : await submissionService.getAllSubmissionsFull();
    },
    { deps: [isStudent, user?.id, user?.role] }
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Parse each item once
  const parsedItemsMap = useMemo(() => {
    const list = Array.isArray(allSubmissions) ? allSubmissions : [];
    return list.map((sub) => ({
      sub,
      parsed: parseSubClassAndSubject(sub),
    }));
  }, [allSubmissions]);

  // Unique lists dynamically generated from teacher's received submissions
  const allClassLevels = useMemo(() => {
    const levels = Array.from(new Set(parsedItemsMap.map((p) => p.parsed.classLevel).filter(Boolean)));
    return levels.sort((a, b) => a - b);
  }, [parsedItemsMap]);

  const allSubjects = useMemo(() => {
    const subs = Array.from(new Set(parsedItemsMap.map((p) => p.parsed.subjectName).filter(Boolean)));
    return subs.sort((a, b) => a.localeCompare(b));
  }, [parsedItemsMap]);

  // Correlated available dropdown options
  const availableClasses = useMemo(() => {
    if (selectedSubject === "all") return allClassLevels;
    const levels = Array.from(
      new Set(
        parsedItemsMap
          .filter((p) => isSameSubject(p.parsed.subjectName, selectedSubject))
          .map((p) => p.parsed.classLevel)
          .filter(Boolean)
      )
    );
    return levels.sort((a, b) => a - b);
  }, [parsedItemsMap, selectedSubject, allClassLevels]);

  const availableSubjects = useMemo(() => {
    let curriculum: string[] = [];
    if (selectedClass !== "all") {
      curriculum = getCurriculumSubjectsForClass(Number(selectedClass));
    } else if (isStudent) {
      curriculum = getCurriculumSubjectsForClass(user?.classLevel || 6, user?.group);
    } else {
      curriculum = Array.from(new Set([6, 7, 8, 9, 10, 11, 12].flatMap((l) => getCurriculumSubjectsForClass(l))));
    }

    const subsFromSubmissions = selectedClass === "all"
      ? parsedItemsMap.map((p) => p.parsed.subjectName).filter(Boolean)
      : parsedItemsMap
          .filter((p) => String(p.parsed.classLevel) === String(selectedClass))
          .map((p) => p.parsed.subjectName)
          .filter(Boolean);

    const subs = Array.from(new Set([...curriculum, ...subsFromSubmissions]));
    return subs.sort((a, b) => a.localeCompare(b));
  }, [parsedItemsMap, selectedClass, isStudent, user?.classLevel, user?.group]);

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setPage(1);
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubject(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSelectedClass("all");
    setSelectedSubject("all");
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    return parsedItemsMap
      .filter(({ sub, parsed }) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          sub.assignmentTitle.toLowerCase().includes(q) ||
          (sub.studentName && sub.studentName.toLowerCase().includes(q)) ||
          (sub.studentNumber && sub.studentNumber.toLowerCase().includes(q));

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "graded" && sub.status === "Graded") ||
          (statusFilter === "pending" && (sub.status === "Submitted" || sub.status === "UnderReview" || sub.status === "Late")) ||
          (statusFilter === "late" && sub.status === "Late") ||
          (statusFilter === "missing" && sub.status === "Missing");

        const matchesClass = selectedClass === "all" || String(parsed.classLevel) === String(selectedClass);
        const matchesSubject = isSameSubject(parsed.subjectName, selectedSubject);

        return matchesSearch && matchesStatus && matchesClass && matchesSubject;
      })
      .sort((a, b) => {
        // Push "Missing" items to the end
        const aMissing = a.sub.status === "Missing" ? 1 : 0;
        const bMissing = b.sub.status === "Missing" ? 1 : 0;
        if (aMissing !== bMissing) return aMissing - bMissing;
        // Then sort by most recently submitted first
        const aTime = a.sub.submittedAtUtc ? new Date(a.sub.submittedAtUtc).getTime() : 0;
        const bTime = b.sub.submittedAtUtc ? new Date(b.sub.submittedAtUtc).getTime() : 0;
        return bTime - aTime;
      });
  }, [parsedItemsMap, searchQuery, statusFilter, selectedClass, selectedSubject]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const isFiltered =
    searchQuery !== "" || statusFilter !== "all" || selectedClass !== "all" || selectedSubject !== "all";

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{pageSubtitle}</p>
        </div>
      </div>

      {/* SEARCH AND CORRELATED FILTERS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={
              isStudent
                ? "Search by assignment title..."
                : "Search by student name, ID, or assignment..."
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Filters:</span>
          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="text-xs font-semibold rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Ungraded Submissions</option>
            <option value="graded">Graded Submissions</option>
            <option value="late">Late Submissions</option>
            <option value="missing">Missing / Overdue</option>
          </select>

          {/* CLASS DROPDOWN FILTER (TEACHER & ADMIN ONLY) */}
          {!isStudent && (
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
            >
              <option value="all">All Classes</option>
              {allClassLevels.map((lvl) => {
                const isAvailable = availableClasses.includes(lvl);
                return (
                  <option key={lvl} value={lvl} disabled={!isAvailable}>
                    Class {lvl} {!isAvailable ? "(No Subject Match)" : ""}
                  </option>
                );
              })}
            </select>
          )}

          {/* SUBJECT DROPDOWN FILTER */}
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/30 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {allSubjects.map((sub) => {
              const isAvailable = availableSubjects.includes(sub);
              return (
                <option key={sub} value={sub} disabled={!isAvailable}>
                  {sub} {!isAvailable ? "(No Class Match)" : ""}
                </option>
              );
            })}
          </select>

          {/* RESET BUTTON */}
          {isFiltered && (
            <Button size="sm" variant="ghost" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* SUBMISSIONS TABLE */}
      {isLoading ? (
        <LoadingSpinner label="Loading submissions..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No submissions found"
          description={
            isStudent
              ? "You have not submitted any assignments matching the criteria yet."
              : "No student submissions matched your search or selected filters."
          }
          icon={<Upload className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isStudent ? "Subject" : "Class · Subject"}</TableHead>
                  <TableHead>Assignment Title</TableHead>
                  {!isStudent && <TableHead>Student Name</TableHead>}
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map(({ sub, parsed }) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {isStudent ? (
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {parsed.subjectName}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {parsed.classLevel > 0 && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${getClassSolidBadge(
                                parsed.classLevel
                              )}`}
                            >
                              Class {parsed.classLevel}
                            </span>
                          )}
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {parsed.subjectName}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                      {isStudent ? (
                        <Link
                          href={sub.assignmentId ? ROUTES.ASSIGNMENT_DETAILS(sub.assignmentId) : ROUTES.SUBMISSION_DETAILS(sub.id)}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors group"
                        >
                          {sub.assignmentTitle}
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ) : (
                        <Link
                          href={ROUTES.SUBMISSION_DETAILS(sub.id)}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors group"
                          title="Click to view submission details"
                        >
                          {sub.assignmentTitle}
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      )}
                    </TableCell>
                    {!isStudent && (
                      <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
                        {sub.studentName}
                      </TableCell>
                    )}
                    <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                      {formatDate(sub.submittedAtUtc)}
                    </TableCell>
                    <TableCell>
                      {sub.status === "Graded" && sub.marks !== undefined ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                          {sub.marks} / {sub.maxMarks}
                        </span>
                      ) : sub.status === "Missing" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60 dark:border-red-900/50">
                          0 / {sub.maxMarks}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "Graded" ? "success" :
                          (sub.status as string) === "Missing" ? "error" :
                          sub.status === "Late" ? "warning" : "info"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showRange
            pageSize={pageSize}
            totalItems={filteredItems.length}
          />
        </div>
      )}
    </div>
  );
}
