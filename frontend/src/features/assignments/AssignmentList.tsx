"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { assignmentService } from "@/services/assignmentService";
import { AssignmentListItem } from "@/types/assignment";
import { useCachedData } from "@/hooks/useCachedData";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Search, Plus, FileText, Eye, Filter, RotateCcw, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { getClassSolidBadge } from "@/utils/classLevelConfig";
import { Pagination } from "@/components/common/Pagination";

export function AssignmentList() {
  const { user } = useAuth();
  const isTeacher = user?.role === ROLES.TEACHER;
  const pageTitle = isTeacher ? "Created Assignments" : "Assignments";
  const pageSubtitle = isTeacher
    ? "Manage, view, and organize all your created class assignments"
    : "Browse, search, and manage course assignments";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: assignmentsData, isLoading } = useCachedData(
    `assignments:list:${page}`,
    async () => {
      return await assignmentService.getAssignments({ pageNumber: page, pageSize });
    },
    { deps: [page] }
  );

  const allAssignments = assignmentsData?.items || [];
  const totalCount = assignmentsData?.totalCount || 0;

  // Unique lists from data
  const allClassLevels = useMemo(() => {
    const levels = Array.from(new Set(allAssignments.map((a) => a.classLevel).filter(Boolean)));
    return levels.sort((a, b) => a - b);
  }, [allAssignments]);

  const allSubjects = useMemo(() => {
    const subs = Array.from(new Set(allAssignments.map((a) => a.subjectName).filter(Boolean)));
    return subs.sort((a, b) => a.localeCompare(b));
  }, [allAssignments]);

  // Correlated available dropdown options
  const availableClasses = useMemo(() => {
    if (selectedSubject === "all") return allClassLevels;
    const levels = Array.from(
      new Set(
        allAssignments
          .filter((a) => a.subjectName?.toLowerCase() === selectedSubject.toLowerCase())
          .map((a) => a.classLevel)
          .filter(Boolean)
      )
    );
    return levels.sort((a, b) => a - b);
  }, [allAssignments, selectedSubject, allClassLevels]);

  const availableSubjects = useMemo(() => {
    if (selectedClass === "all") return allSubjects;
    const subs = Array.from(
      new Set(
        allAssignments
          .filter((a) => String(a.classLevel) === String(selectedClass))
          .map((a) => a.subjectName)
          .filter(Boolean)
      )
    );
    return subs.sort((a, b) => a.localeCompare(b));
  }, [allAssignments, selectedClass, allSubjects]);

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setPage(1);
    if (selectedSubject !== "all" && val !== "all") {
      const validSubs = allAssignments
        .filter((a) => String(a.classLevel) === String(val))
        .map((a) => a.subjectName?.toLowerCase());
      if (!validSubs.includes(selectedSubject.toLowerCase())) {
        setSelectedSubject("all");
      }
    }
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubject(val);
    setPage(1);
    if (selectedClass !== "all" && val !== "all") {
      const validClasses = allAssignments
        .filter((a) => a.subjectName?.toLowerCase() === val.toLowerCase())
        .map((a) => String(a.classLevel));
      if (!validClasses.includes(String(selectedClass))) {
        setSelectedClass("all");
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSelectedStatus("all");
    setPage(1);
  };

  const filteredAssignments = useMemo(() => {
    return allAssignments.filter((ass) => {
      const matchesSearch =
        !searchTerm.trim() ||
        ass.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        ass.subjectName?.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesClass = selectedClass === "all" || String(ass.classLevel) === String(selectedClass);
      const matchesSubject =
        selectedSubject === "all" || ass.subjectName?.toLowerCase() === selectedSubject.toLowerCase();
      const matchesStatus =
        selectedStatus === "all" || ass.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesClass && matchesSubject && matchesStatus;
    });
  }, [allAssignments, searchTerm, selectedClass, selectedSubject, selectedStatus]);

  const totalPages = assignmentsData?.totalPages || Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedAssignments = filteredAssignments;

  const isFiltered =
    searchTerm !== "" || selectedClass !== "all" || selectedSubject !== "all" || selectedStatus !== "all";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{pageSubtitle}</p>
        </div>
        {user?.role === ROLES.TEACHER && (
          <Link href={ROUTES.CREATE_ASSIGNMENT}>
            <Button leftIcon={<Plus className="w-4 h-4" />}>New Assignment</Button>
          </Link>
        )}
      </div>

      {/* SEARCH AND CORRELATED FILTERS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search assignments by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Filters:</span>
          </div>

          {/* CLASS DROPDOWN FILTER */}
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
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

          {/* SUBJECT DROPDOWN FILTER */}
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/30 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
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

          {/* STATUS DROPDOWN FILTER */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>

          {/* RESET BUTTON */}
          {isFiltered && (
            <Button size="sm" variant="ghost" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ASSIGNMENTS TABLE */}
      {isLoading ? (
        <LoadingSpinner label="Loading assignments list..." />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="Try adjusting your class, subject, or search filters."
          icon={<FileText className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class · Subject</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Posted At</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssignments.map((ass) => (
                <TableRow key={ass.id}>
                  <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${getClassSolidBadge(ass.classLevel)}`}>
                        Class {ass.classLevel}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {ass.subjectName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={ROUTES.ASSIGNMENT_DETAILS(ass.id)}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors group"
                    >
                      {ass.title}
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(ass.createdAtUtc || ass.deadlineUtc)}</TableCell>
                  <TableCell className="text-xs font-medium">{formatDate(ass.deadlineUtc)}</TableCell>
                  <TableCell>
                    {(() => {
                      const isClosed = (ass.deadlineUtc && new Date(ass.deadlineUtc).getTime() < Date.now()) || ass.status === "Closed";
                      const statusLabel = isClosed ? "Closed" : ass.status;
                      return (
                        <Badge
                          variant={
                            isClosed
                              ? "error"
                              : ass.status === "Published"
                              ? "success"
                              : "default"
                          }
                        >
                          {statusLabel}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showRange
            pageSize={pageSize}
            totalItems={filteredAssignments.length}
          />
        </div>
      )}
    </div>
  );
}
