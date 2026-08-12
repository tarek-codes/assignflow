"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers,
  Mail,
  Search,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { classService } from "@/services/classService";
import { userService } from "@/services/userService";
import { TeacherListItem, StudentListItem } from "@/services/userService";
import { ClassListItem } from "@/types/class";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { useToast } from "@/context/ToastContext";
import { getClassLevelConfig, getSubjectTheme, SubjectLogo } from "@/utils/classLevelConfig";
import { Pagination } from "@/components/common/Pagination";

interface ClassLevelGroup {
  classLevel: number;
  subjects: ClassListItem[];
}

export function ManageClassesView() {
  const { showToast } = useToast();

  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [subjectPage, setSubjectPage] = useState(1);
  const [activeSegment, setActiveSegment] = useState<"all" | "primary" | "secondary" | "higher_secondary">("all");
  const [assignTarget, setAssignTarget] = useState<ClassListItem | null>(null);

  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningTeacherId, setAssigningTeacherId] = useState<number | null>(null);

  const loadTeachers = () => {
    setTeachersLoading(true);
    userService
      .getAllTeachers()
      .then((res) => setTeachers(res))
      .catch(() => showToast("Failed to load teachers.", "error"))
      .finally(() => setTeachersLoading(false));
  };

  const fetchClasses = () => {
    setIsLoading(true);
    classService
      .getAllClasses()
      .then(setClasses)
      .catch(() => showToast("Failed to load classes.", "error"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    userService.getAllStudents().then(setStudents).catch(() => { });

    // Reload the teacher roster whenever a new teacher is approved elsewhere
    // (e.g. Account Approvals page) so this picker always shows fresh data.
    const handleRosterChange = () => loadTeachers();
    if (typeof window !== "undefined") {
      window.addEventListener("teacher-roster-changed", handleRosterChange);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("teacher-roster-changed", handleRosterChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute exact count of enrolled students per class level
  const studentsCountByClass = useMemo(() => {
    const map = new Map<number, number>();
    students.forEach((s) => {
      if (s.classLevel) {
        map.set(s.classLevel, (map.get(s.classLevel) || 0) + 1);
      }
    });
    return map;
  }, [students]);

  const levelGroups = useMemo<ClassLevelGroup[]>(() => {
    const map = new Map<number, ClassListItem[]>();
    classes.forEach((c) => {
      if (!map.has(c.classLevel)) map.set(c.classLevel, []);
      map.get(c.classLevel)!.push(c);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([classLevel, subjects]) => ({
        classLevel,
        subjects: subjects.sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
      }));
  }, [classes]);

  const selectedGroup = levelGroups.find((g) => g.classLevel === selectedLevel) || null;

  const openAssignModal = (target: ClassListItem) => {
    setAssignTarget(target);
    setSearchTerm("");
    // Always fetch the latest teacher roster when opening the modal so
    // newly-approved teachers appear immediately.
    loadTeachers();
  };

  const closeAssignModal = () => {
    setAssignTarget(null);
    setSearchTerm("");
  };

  /**
   * Determines whether a teacher is qualified to teach a given subject.
   *
   * Rules (case-insensitive, trim-tolerant):
   *  1. Exact name match  -> qualified.
   *  2. Teacher with no declared subjects -> qualified (generalist, allowed).
   *  3. Base-name fallback: a teacher who teaches the bare base subject
   *     (e.g. "Bangla") is considered qualified for its paper variants
   *     ("Bangla 1st Paper", "Bangla 2nd Paper") and vice-versa, so that a
   *     teacher approved with the base subject still shows up for every
   *     paper of that subject in any class.
   */
  const isTeacherQualified = (teacher: TeacherListItem, subjectName: string): boolean => {
    const target = subjectName.trim().toLowerCase();
    if (!target) return true;
    if (!teacher.taughtSubjects || teacher.taughtSubjects.length === 0) return true;

    // Strip a trailing paper suffix (e.g. "1st paper", "2nd paper") to get the base subject.
    const baseName = (raw: string) =>
      raw.trim().toLowerCase().replace(/\s+(1st|2nd|3rd|\d+(?:st|nd|rd|th)?)\s+paper$/i, "");
    const targetBase = baseName(target);

    return teacher.taughtSubjects.some((s) => {
      const sub = s.trim().toLowerCase();
      if (sub === target) return true;
      const subBase = baseName(sub);
      // Only fall back to base-name equality when at least one side had a
      // stripped paper suffix — avoids "physics" matching "physical education".
      if (targetBase !== target || subBase !== sub) {
        return subBase === targetBase;
      }
      return false;
    });
  };

  // Filter teachers to strictly show ONLY qualified teachers for the selected subject
  const filteredTeachers = useMemo(() => {
    if (!assignTarget) return [];

    const term = searchTerm.trim().toLowerCase();

    return teachers.filter((t) => {
      // 1. Must be qualified for the target subject
      if (!isTeacherQualified(t, assignTarget.subjectName)) return false;

      // 2. Filter search term if provided
      if (!term) return true;
      const name = (t.fullName || `${t.firstName || ""} ${t.lastName || ""}`).toLowerCase();
      return (
        name.includes(term) ||
        t.email.toLowerCase().includes(term) ||
        (t.designation || "").toLowerCase().includes(term)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers, searchTerm, assignTarget]);

  const handleAssign = async (teacher: TeacherListItem) => {
    if (!assignTarget) return;

    if (!isTeacherQualified(teacher, assignTarget.subjectName)) {
      const teacherName =
        teacher.fullName || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "This teacher";
      showToast(
        `${teacherName} does not teach ${assignTarget.subjectName} and cannot be assigned to this subject.`,
        "error"
      );
      return;
    }

    setAssigningTeacherId(teacher.id);
    try {
      const updated = await classService.assignTeacher(assignTarget.id, { teacherId: teacher.id });
      setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(`${teacher.fullName || teacher.firstName} assigned to ${assignTarget.subjectName}.`, "success");
      closeAssignModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to assign teacher.";
      showToast(msg, "error");
    } finally {
      setAssigningTeacherId(null);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading classes…" />;

  return (
    <div className="space-y-7">
      {/* ─── HEADER ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 py-7 text-white shadow-xl shadow-blue-600/10 sm:px-8 sm:py-8">
        {/* Large Human Teacher Backdrop Icon */}
        <div className="absolute right-2 -bottom-6 opacity-20 pointer-events-none select-none">
          <GraduationCap className="h-64 w-64 text-white stroke-[1.2]" />
        </div>
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-blue-100">
            <Layers className="h-3.5 w-3.5" /> Class management
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Manage & Assign Teachers</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
            Browse each class level with subjects, & assign the right teacher.
          </p>
        </div>
      </section>

      {!selectedGroup ? (
        /* ─── CLASS LEVELS (LANDING WITH THREE SEGMENTS) ─── */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Academic Segments</h2>
            </div>

            {/* Segment Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 self-start sm:self-auto">
              {[
                { id: "all", label: "All Levels" },
                { id: "primary", label: "Primary (1-5)" },
                { id: "secondary", label: "Secondary (6-10)" },
                { id: "higher_secondary", label: "Higher Secondary (11-12)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSegment(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSegment === tab.id
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {levelGroups.length === 0 ? (
            <EmptyState
              title="No classes found"
              description="Create classes and subjects first to manage teacher assignments."
              icon={<Layers className="w-10 h-10 text-slate-400" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {levelGroups
                .filter((group) => {
                  if (activeSegment === "primary") return group.classLevel >= 1 && group.classLevel <= 5;
                  if (activeSegment === "secondary") return group.classLevel >= 6 && group.classLevel <= 10;
                  if (activeSegment === "higher_secondary") return group.classLevel >= 11;
                  return true;
                })
                .map((group) => {
                  const unassignedCount = group.subjects.filter((s) => !s.teacherId).length;
                  const config = getClassLevelConfig(group.classLevel);
                  const enrolledCount = studentsCountByClass.get(group.classLevel) || 0;

                  return (
                    <button
                      key={group.classLevel}
                      onClick={() => setSelectedLevel(group.classLevel)}
                      className={`group text-left rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${config.hoverBorder} hover:shadow-md focus:outline-none dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          {/* Bold Number Logo */}
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.iconBg} text-xl font-black tracking-tight shrink-0 transition-colors shadow-sm`}>
                            {config.numberLabel}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.badgeBg}`}>
                              Class {group.classLevel}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              {config.segment.name}
                            </span>
                          </div>
                        </div>
                        <h3 className={`mt-4 text-base font-bold text-slate-800 transition-colors dark:text-slate-100 group-hover:${config.textColor}`}>
                          Class {group.classLevel}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {enrolledCount} Enrolled Student{enrolledCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        /* ─── SUBJECTS FOR SELECTED CLASS (COMPACT DRILL-IN TABLE) ─── */
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedLevel(null);
                  setSubjectPage(1);
                }}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Class {selectedGroup.classLevel} · Subjects
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {selectedGroup.subjects.length} subject{selectedGroup.subjects.length !== 1 ? "s" : ""} · Click Re-Assign to assign or change the teacher
                </p>
              </div>
            </div>

            {/* Top Pagination badge indicator */}
            {selectedGroup.subjects.length > 5 && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Page {subjectPage} of {Math.ceil(selectedGroup.subjects.length / 5)}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Subject</TableHead>
                  <TableHead className="w-2/5">Assigned Teacher</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedGroup.subjects
                  .slice((subjectPage - 1) * 5, subjectPage * 5)
                  .map((subject, idx) => {
                    const theme = getSubjectTheme(subject.subjectName, (subjectPage - 1) * 5 + idx);
                    const isAssigned = Boolean(subject.teacherId);

                    return (
                      <TableRow key={subject.id}>
                        {/* Subject Name & Icon */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} font-bold text-xs shadow-sm`}>
                              <SubjectLogo subjectName={subject.subjectName} className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {subject.subjectName}
                              </span>
                              <div className="mt-0.5 sm:hidden">
                                <Badge size="sm" variant={isAssigned ? "success" : "warning"}>
                                  {isAssigned ? "Assigned" : "Unassigned"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Currently Assigned Teacher */}
                        <TableCell className="py-2">
                          {isAssigned ? (
                            <div className="flex items-center gap-2.5">
                              <Avatar name={subject.teacherName || "Teacher"} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {subject.teacherName}
                                </p>
                                <Badge size="sm" variant="success" className="mt-0.5">
                                  Assigned
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                              <span className="text-xs font-semibold italic">No teacher assigned yet</span>
                              <Badge size="sm" variant="warning">
                                Unassigned
                              </Badge>
                            </div>
                          )}
                        </TableCell>

                        {/* Re-Assign Action Button */}
                        <TableCell className="py-2 text-right">
                          <Button
                            size="sm"
                            variant={isAssigned ? "outline" : "primary"}
                            onClick={() => openAssignModal(subject)}
                            className="inline-flex items-center gap-1.5"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            <span>{isAssigned ? "Re-Assign" : "Assign Teacher"}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={subjectPage}
              totalPages={Math.ceil(selectedGroup.subjects.length / 5)}
              onPageChange={setSubjectPage}
              showRange
              pageSize={5}
              totalItems={selectedGroup.subjects.length}
              className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
            />
          </div>
        </div>
      )}

      {/* ─── ASSIGN TEACHER MODAL ─── */}
      <Modal
        isOpen={assignTarget !== null}
        onClose={closeAssignModal}
        title={assignTarget ? `Assign teacher — ${assignTarget.subjectName}` : ""}
        description={assignTarget ? `Class ${assignTarget.classLevel}` : ""}
        maxWidth="lg"
      >
        {assignTarget && (
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Search teacher by name, email, or designation…"
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                searchTerm ? (
                  <button onClick={() => setSearchTerm("")} className="pointer-events-auto">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  </button>
                ) : undefined
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {assignTarget.teacherId > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-xs dark:border-blue-900/50 dark:bg-blue-950/40">
                <Avatar name={assignTarget.teacherName} size="sm" />
                <div className="min-w-0">
                  <p className="font-medium text-blue-900 dark:text-blue-200">Currently assigned</p>
                  <p className="truncate text-blue-700 dark:text-blue-300">{assignTarget.teacherName}</p>
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {teachersLoading ? (
                <LoadingSpinner label="Loading teachers…" />
              ) : filteredTeachers.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-400">No teachers match your search.</p>
                </div>
              ) : (
                filteredTeachers.map((teacher) => {
                  const isCurrent = teacher.id === assignTarget.teacherId;
                  const isAssigning = assigningTeacherId === teacher.id;
                  const name = teacher.fullName || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
                  const isQualified = isTeacherQualified(teacher, assignTarget.subjectName);

                  return (
                    <div key={teacher.id} className="flex items-center gap-3 px-3.5 py-3">
                      <Avatar name={name || "Teacher"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{name || "Teacher"}</p>
                          {isCurrent && <Badge size="sm" variant="primary">Current</Badge>}
                          {!isQualified && <Badge size="sm" variant="warning">Not Qualified</Badge>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        {teacher.taughtSubjects && teacher.taughtSubjects.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {teacher.taughtSubjects.slice(0, 3).map((s, i) => (
                              <Badge key={i} size="sm" variant={isTeacherQualified(teacher, s) ? "info" : "default"}>{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isCurrent ? "ghost" : isQualified ? "primary" : "outline"}
                        disabled={isCurrent}
                        isLoading={isAssigning}
                        onClick={() => handleAssign(teacher)}
                      >
                        {isCurrent ? "Assigned" : isQualified ? "Assign" : "Not Qualified"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
