"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { assignmentService } from "@/services/assignmentService";
import {
  useAllAssignments,
  useAllStudents,
  useClassesPage,
  useInvalidateDataCache,
} from "@/hooks/queries/useDataQueries";
import { ClassListItem } from "@/types/class";
import { AssignmentListItem, AssignmentDetail } from "@/types/assignment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { Avatar } from "@/components/ui/Avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { getClassLevelConfig, SubjectLogo } from "@/utils/classLevelConfig";
import { Pagination } from "@/components/common/Pagination";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Send,
  RefreshCw,
  Trash2,
  Users,
  Sparkles,
  School,
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

import { useLanguage } from "@/context/LanguageContext";

function getSubjectIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics")) return Atom;
  if (n.includes("chem")) return FlaskConical;
  if (n.includes("bio")) return Dna;
  if (n.includes("ict") || n.includes("computer") || n.includes("info")) return Laptop;
  if (n.includes("higher math")) return Binary;
  if (n.includes("math")) return Calculator;
  if (n.includes("bengali") || n.includes("bangla")) return BookText;
  if (n.includes("eng")) return Globe;
  if (n.includes("bgs") || n.includes("global") || n.includes("history")) return Landmark;
  if (n.includes("relig") || n.includes("moral")) return HeartHandshake;
  if (n.includes("account")) return Receipt;
  if (n.includes("finan") || n.includes("bank")) return Coins;
  return BookOpen;
}

export function TeacherClassroomsView() {
  const { showToast } = useToast();
  const { t, translateSubject, translateClass } = useLanguage();
  const { invalidateAssignments, invalidateDashboards } = useInvalidateDataCache();
  const { data: classes = [], isPending: isLoadingClasses } = useClassesPage(1, 100);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassListItem | null>(null);
  const { data: allStudents = [], isPending: studentsPending } = useAllStudents({
    enabled: Boolean(selectedClassroom),
  });
  const { data: allAssignments = [], isPending: assignmentsPending } = useAllAssignments({
    enabled: Boolean(selectedClassroom),
  });
  const [activeSegment, setActiveSegment] = useState<"all" | "primary" | "secondary" | "higher_secondary">("all");

  // Classroom Detail State
  const [activeTab, setActiveTab] = useState<"assignments" | "students">("assignments");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentsPage, setStudentsPage] = useState(1);
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const pageSize = 8;

  // Create / Edit Assignment Modal State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentListItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formMaxMarks, setFormMaxMarks] = useState<number>(100);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Reset detail pagination when classroom changes
  useEffect(() => {
    if (!selectedClassroom) return;
    setStudentSearch("");
    setStudentsPage(1);
    setAssignmentsPage(1);
  }, [selectedClassroom]);

  const students = useMemo(() => {
    if (!selectedClassroom) return [];
    return allStudents.filter((s) => Number(s.classLevel) === Number(selectedClassroom.classLevel));
  }, [allStudents, selectedClassroom]);

  const assignments = useMemo(() => {
    if (!selectedClassroom) return [];
    return allAssignments.filter((a) => {
      const matchesLevel = Number(a.classLevel) === Number(selectedClassroom.classLevel);
      const matchesSubject =
        a.subjectName?.trim().toLowerCase() === selectedClassroom.subjectName?.trim().toLowerCase();
      const matchesClassId = a.classId ? Number(a.classId) === Number(selectedClassroom.id) : true;
      return matchesLevel && matchesSubject && matchesClassId;
    });
  }, [allAssignments, selectedClassroom]);

  const isLoadingDetail =
    Boolean(selectedClassroom) &&
    ((studentsPending && allStudents.length === 0) || (assignmentsPending && allAssignments.length === 0));

  // Filtered students by search
  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(term) ||
        s.firstName?.toLowerCase().includes(term) ||
        s.lastName?.toLowerCase().includes(term) ||
        s.studentNumber?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)
    );
  }, [students, studentSearch]);

  useEffect(() => {
    setStudentsPage(1);
  }, [studentSearch]);

  const totalStudentsPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = useMemo(() => {
    const start = (studentsPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, studentsPage]);

  const totalAssignmentsPages = Math.ceil(assignments.length / pageSize);
  const paginatedAssignments = useMemo(() => {
    const start = (assignmentsPage - 1) * pageSize;
    return assignments.slice(start, start + pageSize);
  }, [assignments, assignmentsPage]);

  // Open modal to create assignment
  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setFormTitle("");
    setFormDescription("");
    setFormInstructions("");
    // Default deadline to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormDeadline(nextWeek.toISOString().slice(0, 16));
    setFormMaxMarks(100);
    setIsAssignmentModalOpen(true);
  };

  // Open modal to edit assignment
  const handleOpenEditModal = (assignment: AssignmentListItem) => {
    setEditingAssignment(assignment);
    setFormTitle(assignment.title);
    setFormDescription("");
    setFormInstructions("");
    setFormDeadline(new Date(assignment.deadlineUtc).toISOString().slice(0, 16));
    setFormMaxMarks(assignment.maxMarks);

    // Fetch details if needed
    assignmentService
      .getAssignmentById(assignment.id)
      .then((detail) => {
        setFormDescription(detail.description || "");
        setFormInstructions(detail.instructions || "");
      })
      .catch(() => { });

    setIsAssignmentModalOpen(true);
  };

  // Submit Create or Edit Assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroom) return;
    if (!formTitle.trim()) {
      showToast("Assignment title is required.", "warning");
      return;
    }
    if (!formDeadline) {
      showToast("Deadline date and time are required.", "warning");
      return;
    }

    setIsSavingAssignment(true);
    try {
      if (editingAssignment) {
        // Update
        const updated = await assignmentService.updateAssignment(editingAssignment.id, {
          classId: selectedClassroom.id,
          title: formTitle,
          description: formDescription,
          instructions: formInstructions,
          deadlineUtc: new Date(formDeadline).toISOString(),
          maxMarks: formMaxMarks,
          allowResubmission: true,
        });
        showToast(`Assignment "${updated.title}" updated successfully.`, "success");
        await invalidateAssignments();
        await invalidateDashboards();
      } else {
        // Create
        const created = await assignmentService.createAssignment({
          classId: selectedClassroom.id,
          title: formTitle,
          description: formDescription,
          instructions: formInstructions,
          deadlineUtc: new Date(formDeadline).toISOString(),
          maxMarks: formMaxMarks,
          allowResubmission: true,
        });
        showToast(`Assignment "${created.title}" created successfully!`, "success");
        await invalidateAssignments();
        await invalidateDashboards();
      }
      setIsAssignmentModalOpen(false);
    } catch (err: any) {
      let msg = "Failed to save assignment.";
      if (err?.response?.data) {
        const d = err.response.data;
        if (d.message) msg = d.message;
        else if (d.errors && typeof d.errors === "object") {
          const firstKey = Object.keys(d.errors)[0];
          if (firstKey && Array.isArray(d.errors[firstKey]) && d.errors[firstKey].length > 0) {
            msg = d.errors[firstKey][0];
          }
        } else if (d.title) {
          msg = d.title;
        }
      }
      showToast(msg, "error");
    } finally {
      setIsSavingAssignment(false);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await assignmentService.deleteAssignment(id);
      showToast(`Assignment "${title}" deleted successfully.`, "success");
      await invalidateAssignments();
      await invalidateDashboards();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete assignment.", "error");
    }
  };

  // Toggle Publish / Draft
  const handleTogglePublish = async (assignment: AssignmentListItem) => {
    try {
      if (assignment.status === "Draft") {
        await assignmentService.publishAssignment(assignment.id);
        showToast(`"${assignment.title}" published!`, "success");
        await invalidateAssignments();
      } else {
        await assignmentService.saveDraft(assignment.id);
        showToast(`"${assignment.title}" saved as draft.`, "success");
        await invalidateAssignments();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update status.", "error");
    }
  };

  if (isLoadingClasses) return <LoadingSpinner label="Loading your classrooms…" />;

  return (
    <div className="space-y-6">
      {!selectedClassroom ? (
        /* ─── CLASSROOMS GRID VIEW ─── */
        <>
          <section className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 py-7 text-white shadow-xl shadow-blue-600/10 sm:px-8 sm:py-8">
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("secMyClassrooms")}</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  {t("selectAssignedClass")}
                </p>
              </div>
              <Badge variant="primary" size="sm" className="bg-white/20 text-white border-white/30 self-start sm:self-center">
                {t("activeClassroomCount", { count: classes.length })}
              </Badge>
            </div>
          </section>

          {/* Segment Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("secAcademicSegments")}</h2>
            </div>

            {/* Segment Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 self-start sm:self-auto">
              {[
                { id: "all", label: t("tabAllClassrooms") },
                { id: "primary", label: t("tabPrimary") },
                { id: "secondary", label: t("tabSecondary") },
                { id: "higher_secondary", label: t("tabHigherSecondary") },
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

          {classes.length === 0 ? (
            <EmptyState
              title="No classrooms assigned"
              description="You currently have no assigned Class-Subject pairs. Contact your school administrator to assign classes."
              icon={<School className="w-10 h-10 text-slate-400" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes
                .filter((cls) => {
                  if (activeSegment === "primary") return cls.classLevel >= 1 && cls.classLevel <= 5;
                  if (activeSegment === "secondary") return cls.classLevel >= 6 && cls.classLevel <= 10;
                  if (activeSegment === "higher_secondary") return cls.classLevel >= 11;
                  return true;
                })
                .map((cls) => {
                  const SubjectIcon = getSubjectIcon(cls.subjectName);
                  const classConfig = getClassLevelConfig(cls.classLevel);

                  return (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClassroom(cls);
                        setActiveTab("assignments");
                      }}
                      className={`group text-left rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 ${classConfig.hoverBorder} hover:shadow-xl focus:outline-none dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          {/* Bold Number Logo */}
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${classConfig.iconBg} text-2xl font-black tracking-tight shrink-0 transition-colors shadow-sm`}>
                            {classConfig.numberLabel}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classConfig.badgeBg}`}>
                              {translateClass(cls.classLevel)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              {classConfig.segment.name}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 ${classConfig.textColor} flex items-center justify-center min-w-7 h-7 font-bold`}>
                              <SubjectLogo subjectName={cls.subjectName} className="h-4 w-4" />
                            </div>
                            <h2 className={`text-lg font-bold text-slate-900 dark:text-white group-hover:${classConfig.textColor} transition-colors`}>
                              {translateSubject(cls.subjectName)}
                            </h2>
                          </div>
                          {cls.description &&
                            !cls.description.toLowerCase().startsWith("class") &&
                            !cls.description.toLowerCase().includes(cls.subjectName.toLowerCase()) && (
                              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                {cls.description}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className={`mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-bold ${classConfig.textColor}`}>
                        <span>{t("viewStudentsAndAssignments")}</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </>
      ) : (
        /* ─── CLASSROOM DETAIL VIEW (STUDENTS & ASSIGNMENTS) ─── */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedClassroom(null)}
                className="p-2 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {translateClass(selectedClassroom.classLevel)} · {translateSubject(selectedClassroom.subjectName)}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage enrolled students and coursework for this classroom
                </p>
              </div>
            </div>
          </div>

          {/* ─── TABS NAV ─── */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "assignments"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <FileText className="w-4 h-4" />
              {t("tabClassAssignments")} ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "students"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <Users className="w-4 h-4" />
              {t("tabEnrolledStudents")} ({students.length})
            </button>
          </div>

          {/* ─── TAB CONTENT ─── */}
          {isLoadingDetail ? (
            <LoadingSpinner label="Loading classroom content…" />
          ) : activeTab === "assignments" ? (
            /* ASSIGNMENTS TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Total {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} in Class {selectedClassroom.classLevel} — {selectedClassroom.subjectName}
                </p>
                <Button size="sm" onClick={handleOpenCreateModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Assignment
                </Button>
              </div>

              {assignments.length === 0 ? (
                <EmptyState
                  title="No assignments created yet"
                  description="Create your first assignment for this class to get started."
                  icon={<FileText className="w-10 h-10 text-slate-400" />}
                  action={
                    <Button size="sm" onClick={handleOpenCreateModal}>
                      Create Assignment
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <Link
                              href={ROUTES.ASSIGNMENT_DETAILS(assignment.id)}
                              className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                            >
                              {assignment.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(assignment.createdAtUtc)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(assignment.deadlineUtc)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              size="sm"
                              variant={assignment.status === "Published" ? "success" : "warning"}
                            >
                              {assignment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium tabular-nums">{assignment.maxMarks}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTogglePublish(assignment)}
                                title={assignment.status === "Draft" ? "Publish" : "Move to Draft"}
                              >
                                {assignment.status === "Draft" ? "Publish" : "Draft"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEditModal(assignment)}
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Pagination
                    currentPage={assignmentsPage}
                    totalPages={totalAssignmentsPages}
                    onPageChange={setAssignmentsPage}
                    showRange
                    pageSize={pageSize}
                    totalItems={assignments.length}
                    className="border-t border-slate-100 dark:border-slate-800 pt-3"
                  />
                </div>
              )}
            </div>
          ) : (
            /* STUDENTS TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="w-full max-w-md">
                  <Input
                    placeholder={t("btnSearch")}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Showing {filteredStudents.length} of {students.length} students
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <EmptyState
                  title="No students found"
                  description={
                    studentSearch
                      ? "No students match your search criteria."
                      : "No students are currently registered for this class level."
                  }
                  icon={<Users className="w-10 h-10 text-slate-400" />}
                />
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("thStudent")}</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>{t("thEmail")}</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => {
                        const name =
                          student.fullName ||
                          `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                          "Student";
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={name} size="sm" />
                                <span>{name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-slate-500">
                              {student.studentNumber}
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">
                              {student.email}
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                              {student.phone || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <Pagination
                    currentPage={studentsPage}
                    totalPages={totalStudentsPages}
                    onPageChange={setStudentsPage}
                    showRange
                    pageSize={pageSize}
                    totalItems={filteredStudents.length}
                    className="border-t border-slate-100 dark:border-slate-800 pt-3"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── CREATE / EDIT ASSIGNMENT MODAL ─── */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={
          editingAssignment
            ? `Edit Assignment — ${selectedClassroom?.subjectName}`
            : `New Assignment — Class ${selectedClassroom?.classLevel} (${selectedClassroom?.subjectName})`
        }
        description="Fill out assignment details for your students."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <Input
            label="Assignment Title *"
            placeholder="e.g. Chapter 4 Practice Problems"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <TextArea
            label="Description"
            placeholder="Brief overview of the assignment topic…"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
          />

          <TextArea
            label="Instructions"
            placeholder="Step by step submission guidelines for students…"
            value={formInstructions}
            onChange={(e) => setFormInstructions(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deadline (Date & Time) *"
              type="datetime-local"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
              required
            />

            <Input
              label="Max Marks *"
              type="number"
              min={1}
              max={1000}
              value={formMaxMarks}
              onChange={(e) => setFormMaxMarks(parseInt(e.target.value, 10) || 100)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingAssignment}>
              {editingAssignment ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
