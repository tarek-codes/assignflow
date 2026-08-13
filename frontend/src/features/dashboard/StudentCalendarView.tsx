"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCachedData, invalidateCachedPrefix } from "@/hooks/useCachedData";
import { dashboardService } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";
import { StudentDashboardData, StudentUpcomingAssignment } from "@/types/dashboard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submissionService } from "@/services/submissionService";
import { useToast } from "@/context/ToastContext";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Send,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";

import { useLanguage } from "@/context/LanguageContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const BANGLA_MONTHS = [
  "জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BANGLA_DAYS_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

interface CalendarCell {
  date: Date;
  inMonth: boolean;
  assignments: StudentUpcomingAssignment[];
}

export function StudentCalendarView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { language, translateSubject } = useLanguage();
  const { data, isLoading, refetch } = useCachedData(
    "dashboard:student",
    () => dashboardService.getStudentDashboard()
  );

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [selectedAssignment, setSelectedAssignment] = useState<StudentUpcomingAssignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetch = () => {
    void refetch();
  };

  /* ── build calendar grid ── */
  const cells = useMemo<CalendarCell[]>(() => {
    const all = data?.upcomingAssignments ?? [];
    const dim = getDaysInMonth(year, month);
    const startDay = new Date(year, month, 1).getDay();
    const out: CalendarCell[] = [];

    // leading blanks from prev month
    const prevDim = getDaysInMonth(year, month - 1);
    for (let i = startDay - 1; i >= 0; i--) {
      out.push({ date: new Date(year, month - 1, prevDim - i), inMonth: false, assignments: [] });
    }
    // current month
    for (let d = 1; d <= dim; d++) {
      const matched = all.filter((a) => {
        const dl = new Date(a.deadlineUtc);
        return dl.getFullYear() === year && dl.getMonth() === month && dl.getDate() === d;
      });
      out.push({ date: new Date(year, month, d), inMonth: true, assignments: matched });
    }
    // trailing
    const trail = 42 - out.length;
    for (let d = 1; d <= trail; d++) {
      out.push({ date: new Date(year, month + 1, d), inMonth: false, assignments: [] });
    }
    return out;
  }, [data, year, month]);

  const monthAssignments = useMemo(() => {
    return (data?.upcomingAssignments ?? [])
      .filter((a) => {
        const dl = new Date(a.deadlineUtc);
        return dl.getFullYear() === year && dl.getMonth() === month;
      })
      .sort((a, b) => new Date(a.deadlineUtc).getTime() - new Date(b.deadlineUtc).getTime());
  }, [data, year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const openAssignment = (a: StudentUpcomingAssignment) => {
    setSelectedAssignment(a);
    setFile(null);
    setNotes("");
  };
  const closeModal = () => {
    setSelectedAssignment(null);
    setFile(null);
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!file) { showToast("Please select a file.", "error"); return; }
    setIsSubmitting(true);
    try {
      await submissionService.submitOrReplace(selectedAssignment.assignmentId, { file, submissionText: notes });
      showToast("Submitted successfully!", "success");
      closeModal();
      await invalidateCachedPrefix("dashboard:");
      await invalidateCachedPrefix("submissions:");
      await refetch();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Submission failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading calendar…" />;

  const today = new Date();

  return (
    <div className="space-y-5">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {language === "bn" ? "ক্যালেন্ডার" : "Calendar"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "bn" ? "অ্যাসাইনমেন্টের ডেডলাইন এক নজরে" : "Assignment deadlines at a glance."}
          </p>
        </div>
      </div>

      {/* ─── CALENDAR ─── */}
      <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/5">
        {/* Month Nav with Blue Accent */}
        <div className="flex items-center justify-between px-5 py-3 bg-blue-600 text-white">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold tracking-wide">
            {language === "bn" ? BANGLA_MONTHS[month] : MONTHS[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-blue-50/60 dark:bg-slate-800/60">
          {(language === "bn" ? BANGLA_DAYS_SHORT : DAYS_SHORT).map((d) => (
            <div key={d} className="py-2 text-center text-xs font-bold text-blue-700 dark:text-blue-300">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const isToday =
              c.date.getDate() === today.getDate() &&
              c.date.getMonth() === today.getMonth() &&
              c.date.getFullYear() === today.getFullYear();

            return (
              <div
                key={i}
                className={`min-h-[68px] p-1.5 border-b border-r border-slate-100 dark:border-slate-800 transition-colors ${
                  isToday
                    ? "bg-blue-50/40 dark:bg-blue-950/20"
                    : c.inMonth
                    ? "bg-white dark:bg-slate-900"
                    : "bg-slate-50/50 dark:bg-slate-950/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-flex items-center justify-center text-xs font-bold ${
                    isToday
                      ? "w-5 h-5 rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : c.inMonth
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-300 dark:text-slate-600"
                  }`}>
                    {c.date.getDate()}
                  </span>

                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {language === "bn" ? "আজ" : "Today"}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {c.assignments.slice(0, 2).map((a) => (
                    <button
                      key={a.assignmentId}
                      onClick={() => openAssignment(a)}
                      className={`w-full text-left text-[10px] leading-tight font-semibold px-1.5 py-0.5 rounded-md truncate transition-colors ${
                        a.hasSubmitted
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {a.title}
                    </button>
                  ))}
                  {c.assignments.length > 2 && (
                    <span className="text-[9px] font-bold text-slate-400 pl-1 block">+{c.assignments.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MONTH DEADLINES LIST ─── */}
      {monthAssignments.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Deadlines in {MONTHS[month]}
          </h2>
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50 shadow-sm">
            {monthAssignments.slice(0, 4).map((a) => {
              const dl = new Date(a.deadlineUtc);
              return (
                <button
                  key={a.assignmentId}
                  onClick={() => openAssignment(a)}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  {/* Date chip */}
                  <div className="shrink-0 w-8 h-8 rounded-md bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold leading-none">
                      {MONTHS[dl.getMonth()].slice(0, 3)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
                      {dl.getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {a.subjectName} · {a.maxMarks} marks
                    </p>
                  </div>

                  {/* Status */}
                  <span className={`text-[11px] font-semibold shrink-0 ${
                    a.hasSubmitted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}>
                    {a.hasSubmitted ? "Done" : "Pending"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            No deadlines in {MONTHS[month]}.
          </p>
        </div>
      )}

      {/* ─── MODAL ─── */}
      <Modal
        isOpen={selectedAssignment !== null}
        onClose={closeModal}
        title={selectedAssignment?.title ?? "Assignment Details"}
        description={selectedAssignment?.subjectName ?? ""}
        maxWidth="2xl"
      >
        {selectedAssignment && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Deadline</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(selectedAssignment.deadlineUtc)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Max Marks</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedAssignment.maxMarks}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Status</p>
                <p className={`font-medium ${
                  selectedAssignment.hasSubmitted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {selectedAssignment.hasSubmitted ? "Submitted" : "Pending"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Description</p>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                {selectedAssignment.description || "No description provided."}
              </div>
            </div>

            {selectedAssignment.instructions && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Instructions</p>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedAssignment.instructions}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your submission</p>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
                  File <span className="text-slate-400">(PDF, DOCX, ZIP, PNG, etc.)</span>
                </label>
                <Input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
                {file && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                    {file.name} — {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
                  Notes <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for your teacher…"
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
              <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
                {selectedAssignment.hasSubmitted ? "Resubmit" : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
