"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { assignmentService } from "@/services/assignmentService";
import { AssignmentListItem } from "@/types/assignment";
import { useCachedData } from "@/hooks/useCachedData";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
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
  const { language, t, translateSubject, translateClass, toBanglaDigits } = useLanguage();
  const isBn = language === "bn";

  const isTeacher = user?.role === ROLES.TEACHER;
  const pageTitle = isBn
    ? (isTeacher ? "তৈরিকৃত অ্যাসাইনমেন্টসমূহ" : "অ্যাসাইনমেন্টসমূহ")
    : (isTeacher ? "Created Assignments" : "Assignments");
  
  const pageSubtitle = isBn
    ? (isTeacher ? "আপনার তৈরিকৃত সকল ক্লাস অ্যাসাইনমেন্ট পরিচালনা, দেখুন ও বিন্যস্ত করুন" : "কোর্স অ্যাসাইনমেন্টসমূহ খুঁজুন, দেখুন এবং পরিচালনা করুন")
    : (isTeacher ? "Manage, view, and organize all your created class assignments" : "Browse, search, and manage course assignments");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const cacheKey = `assignments:full:list:${user?.id || "guest"}:${user?.role || "all"}`;
  const { data: allAssignments = [], isLoading } = useCachedData<AssignmentListItem[]>(
    cacheKey,
    async () => {
      return await assignmentService.getAllAssignments();
    },
    { deps: [user?.id, user?.role] }
  );

  const allClassLevels = useMemo(() => {
    const levels = Array.from(new Set(allAssignments.map((a) => a.classLevel).filter(Boolean)));
    return levels.sort((a, b) => a - b);
  }, [allAssignments]);

  const allSubjects = useMemo(() => {
    const subs = Array.from(new Set(allAssignments.map((a) => a.subjectName).filter(Boolean)));
    return subs.sort((a, b) => a.localeCompare(b));
  }, [allAssignments]);

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

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const paginatedAssignments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, page, pageSize]);

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
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              {isBn ? "নতুন অ্যাসাইনমেন্ট" : "New Assignment"}
            </Button>
          </Link>
        )}
      </div>

      {/* SEARCH AND CORRELATED FILTERS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={isBn ? "শিরোনাম বা বিষয় দ্বারা অনুসন্ধান করুন..." : "Search assignments by title or subject..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10 text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{isBn ? "ফিল্টার:" : "Filters:"}</span>
          </div>

          {/* CLASS DROPDOWN FILTER */}
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
          >
            <option value="all">{isBn ? "সকল শ্রেণী" : "All Classes"}</option>
            {allClassLevels
              .filter((lvl) => availableClasses.includes(lvl))
              .map((lvl) => (
                <option key={lvl} value={lvl}>
                  {translateClass(lvl)}
                </option>
              ))}
          </select>

          {/* SUBJECT DROPDOWN FILTER */}
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/30 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
          >
            <option value="all">{isBn ? "সকল বিষয়" : "All Subjects"}</option>
            {allSubjects
              .filter((sub) => availableSubjects.includes(sub))
              .map((sub) => (
                <option key={sub} value={sub}>
                  {translateSubject(sub)}
                </option>
              ))}
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
            <option value="all">{isBn ? "সকল স্ট্যাটাস" : "All Statuses"}</option>
            <option value="published">{isBn ? "প্রকাশিত" : "Published"}</option>
            <option value="draft">{isBn ? "খসড়া" : "Draft"}</option>
            <option value="closed">{isBn ? "বন্ধ" : "Closed"}</option>
          </select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              {isBn ? "রিসেট" : "Reset"}
            </Button>
          )}
        </div>
      </div>

      {/* ASSIGNMENTS TABLE */}
      {isLoading ? (
        <LoadingSpinner label={isBn ? "অ্যাসাইনমেন্ট লোড করা হচ্ছে..." : "Loading assignments..."} />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10 text-slate-400" />}
          title={isBn ? "কোন অ্যাসাইনমেন্ট পাওয়া যায়নি" : "No assignments found"}
          description={
            isBn
              ? "আপনার বর্তমান ফিল্টারের সাথে কোন অ্যাসাইনমেন্ট মেলেনি।"
              : (isFiltered
              ? "No assignments match your current filters. Try resetting your search or filter settings."
              : isTeacher
              ? "You haven't created any assignments yet."
              : "No course assignments have been published yet.")
          }
          action={
            isTeacher && !isFiltered ? (
              <Link href={ROUTES.CREATE_ASSIGNMENT}>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  {isBn ? "প্রথম অ্যাসাইনমেন্ট তৈরি করুন" : "Create First Assignment"}
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBn ? "অ্যাসাইনমেন্ট এর শিরোনাম" : "Assignment Title"}</TableHead>
                <TableHead>{isBn ? "শ্রেণী" : "Class"}</TableHead>
                <TableHead>{isBn ? "বিষয়" : "Subject"}</TableHead>
                <TableHead>{isBn ? "সর্বোচ্চ নম্বর" : "Max Marks"}</TableHead>
                <TableHead>{isBn ? "শেষ সময়" : "Deadline"}</TableHead>
                <TableHead>{isBn ? "স্ট্যাটাস" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssignments.map((ass) => (
                <TableRow key={ass.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.ASSIGNMENT_DETAILS(ass.id)}
                      className="group/title flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="truncate max-w-xs">{ass.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className={getClassSolidBadge(ass.classLevel)}>
                      {translateClass(ass.classLevel)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {translateSubject(ass.subjectName || "General")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {toBanglaDigits(ass.maxMarks)}
                  </TableCell>
                  <TableCell className="text-xs font-medium">{formatDate(ass.deadlineUtc, isBn ? "bn" : "en")}</TableCell>
                  <TableCell>
                    {(() => {
                      const isClosed = (ass.deadlineUtc && new Date(ass.deadlineUtc).getTime() < Date.now()) || ass.status === "Closed";
                      const statusLabel = isClosed
                        ? (isBn ? "বন্ধ" : "Closed")
                        : ass.status === "Published"
                        ? (isBn ? "প্রকাশিত" : "Published")
                        : (isBn ? "খসড়া" : "Draft");
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
