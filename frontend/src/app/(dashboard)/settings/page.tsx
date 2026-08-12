"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
  Sun,
  Moon,
  Bell,
  Mail,
  Clock,
  ShieldCheck,
  Globe,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  LayoutGrid,
  ShieldAlert,
  GraduationCap,
  Award,
  Database,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { language, setLanguage, t, translateUserName } = useLanguage();

  const role = user?.role || "Admin";
  const isAdmin = role === "Admin";
  const isTeacher = role === "Teacher";
  const isStudent = role === "Student";

  const roleKey = user?.id ? `settings_${user.id}` : "settings_user";

  // Common preferences
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [defaultView, setDefaultView] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${roleKey}_defaultView`);
      if (saved) return saved;
    }
    return isAdmin ? "admin" : isTeacher ? "classrooms" : "student";
  });
  const [isSaving, setIsSaving] = useState(false);

  // Admin Specific
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMaintenanceMode(localStorage.getItem("system_maintenance_mode") === "true");
    }
  }, []);

  // Teacher Specific
  const [gradingScale, setGradingScale] = useState("percentage");
  const [lateSubmissionPolicy, setLateSubmissionPolicy] = useState("allow_flag");
  const [teacherEmailAlerts, setTeacherEmailAlerts] = useState(true);

  // Student Specific
  const [deadlineReminders, setDeadlineReminders] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${roleKey}_due_reminder_12h`);
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const [gradeReleaseAlerts, setGradeReleaseAlerts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${roleKey}_grade_alert`);
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(`${roleKey}_defaultView`, defaultView);
        localStorage.setItem(`${roleKey}_timezone`, timezone);
        if (isStudent) {
          localStorage.setItem(`${roleKey}_due_reminder_12h`, String(deadlineReminders));
          localStorage.setItem(`${roleKey}_grade_alert`, String(gradeReleaseAlerts));
        }
      }
      setIsSaving(false);
      showToast(t("msgSaveSuccess"), "success");
    }, 400);
  };

  const isBn = language === "bn";

  return (
    <div className="flex-1 min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl mx-auto my-auto space-y-6">
      {/* ─── PAGE TITLE ─── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {t("navSettings")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isBn ? "অ্যাকাউন্ট সেটিংস -" : "Account settings for"}{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {isBn ? (isAdmin ? "অ্যাডমিন অ্যাকাউন্ট" : isTeacher ? "শিক্ষক অ্যাকাউন্ট" : "শিক্ষার্থী অ্যাকাউন্ট") : `${role} Account`}
          </span>
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* ─── 1. APPEARANCE & DISPLAY ─── */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{t("secAppearance")}</h2>
              <p className="text-[11px] text-slate-400">
                {isBn ? "থিম মোড এবং ভাষা পছন্দসমূহ" : "Theme mode and language preferences"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5 min-w-0">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize truncate">
                    {t("lblTheme")}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {isBn ? "হালকা / গাঢ় থিম" : "Light / Dark theme"}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {t("lblLanguage")}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">English / বাংলা</p>
                </div>
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("en");
                    showToast(t("msgLangSwitchedEn"), "info");
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    language === "en"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("bn");
                    showToast(t("msgLangSwitchedBn"), "info");
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    language === "bn"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. ROLE SPECIFIC SETTINGS ─── */}

        {/* ───────────────── ADMIN SETTINGS ───────────────── */}
        {isAdmin && (
          <>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? "সিস্টেম প্রশাসন ও অপারেশনস" : "System Administration & Operations"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? "সিস্টেম ব্যাপী নিরাপত্তা এবং প্রশাসন নীতি" : "Platform-wide governance and security policies"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isBn ? "সিস্টেম রক্ষণাবেক্ষণ মোড" : "System Maintenance Mode"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn ? "ডাটাবেস আপডেটের সময় সাধারণ ব্যবহারকারীদের এক্সেস সীমিত করুন" : "Restrict student/teacher access while running database migrations"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !maintenanceMode;
                      setMaintenanceMode(nextVal);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("system_maintenance_mode", nextVal ? "true" : "false");
                      }
                      showToast(
                        nextVal
                          ? "System Maintenance Mode ENABLED! Student & Teacher logins are now restricted."
                          : "System Maintenance Mode DISABLED! Normal access restored.",
                        nextVal ? "warning" : "success"
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      maintenanceMode ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        maintenanceMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ───────────────── TEACHER SETTINGS ───────────────── */}
        {isTeacher && (
          <>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? "ক্লাসরুম ও মূল্যায়ন পছন্দসমূহ" : "Classroom & Evaluation Preferences"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? "ডিফল্ট গ্রেডিং স্কেল এবং জমা দেওয়ার নীতিমালা" : "Default grading criteria and submission policies"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default Grade Scale */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    {isBn ? "প্রাথমিক গ্রেড প্রদর্শন স্কেল" : "Primary Grade Display Scale"}
                  </label>
                  <select
                    value={gradingScale}
                    onChange={(e) => setGradingScale(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">{isBn ? "শতকরা হিসাব (০ - ১০০%)" : "Percentage (0 - 100%)"}</option>
                    <option value="letter">{isBn ? "লেটার গ্রেড (A+ থেকে F)" : "Letter Grades (A+ to F)"}</option>
                    <option value="gpa">{isBn ? "জিপিএ স্কেল (সর্বোচ্চ ৪.০)" : "GPA Scale (4.0 Max)"}</option>
                  </select>
                </div>

                {/* Late Policy */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {isBn ? "বিলম্বিত জমা নীতিমালা" : "Late Submission Policy"}
                  </label>
                  <select
                    value={lateSubmissionPolicy}
                    onChange={(e) => setLateSubmissionPolicy(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="allow_flag">{isBn ? "জমা গ্রহণ করুন এবং 'বিলম্বিত' চিহ্নিত করুন" : "Allow Submissions & Flag as Late"}</option>
                    <option value="hard_cutoff">{isBn ? "কঠোর ডেডলাইন (নির্দিষ্ট সময় পর আর জমা নয়)" : "Strict Deadline Hard Cutoff"}</option>
                  </select>
                </div>
              </div>

              {/* Teacher Email Alert */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {isBn ? "নতুন জমার জন্য ইমেইল বিজ্ঞপ্তি" : "New Submission Email Alerts"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn ? "শিক্ষার্থী অ্যাসাইনমেন্ট জমা দিলে তাৎক্ষণিক ইমেইল পান" : "Receive an email whenever a student submits an assignment in your classrooms"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTeacherEmailAlerts(!teacherEmailAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    teacherEmailAlerts ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      teacherEmailAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ───────────────── STUDENT SETTINGS ───────────────── */}
        {isStudent && (
          <>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? "শিক্ষা বিষয়ক বিজ্ঞপ্তি ও রিমাইন্ডার" : "Academic Notifications & Reminders"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? "স্বয়ংক্রিয় ডেডলাইন সতর্কবার্তা এবং গ্রেড মূল্যায়ন বিজ্ঞপ্তি" : "Automated deadline alerts and grade notifications"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* 12-Hour Due Date Reminders */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isBn ? "১২-ঘণ্টা আগে ডেডলাইন সতর্কবার্তা" : "12-Hour Assignment Due Reminder"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn ? "ডেডলাইনের ১২ ঘণ্টা আগে স্বয়ংক্রিয় নোটিফিকেশন রিমাইন্ডার পান" : "Get automated notification alerts 12 hours before any assignment due date"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !deadlineReminders;
                      setDeadlineReminders(nextVal);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(`${roleKey}_due_reminder_12h`, String(nextVal));
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      deadlineReminders ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        deadlineReminders ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Grade Release Alerts */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <Award className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isBn ? "তাৎক্ষণিক নম্বর/গ্রেড প্রকাশের সতর্কবার্তা" : "Instant Grade Release Alert"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn ? "শিক্ষক নম্বর প্রদান করলে সাথে সাথে নোটিফিকেশন পান" : "Receive immediate notifications when a teacher publishes your graded submission"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !gradeReleaseAlerts;
                      setGradeReleaseAlerts(nextVal);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(`${roleKey}_grade_alert`, String(nextVal));
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      gradeReleaseAlerts ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        gradeReleaseAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── 3. SYSTEM & REGIONAL PREFERENCES ─── */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn ? "ওয়ার্কস্পেস ও আঞ্চলিক পছন্দসমূহ" : "Workspace Preferences"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isBn ? "ডিফল্ট ল্যান্ডিং পেজ এবং সময় বিন্যাস" : "Default landing page and regional time formatting"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default View */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                {isBn ? "ডিফল্ট ল্যান্ডিং ভিউ" : "Default Landing View"}
              </label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isAdmin && (
                  <>
                    <option value="admin">{isBn ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin System Dashboard"}</option>
                    <option value="manage">{isBn ? "ক্লাস ও কারিকুলাম পরিচালনা" : "Manage Classes & Curriculum"}</option>
                    <option value="assignments">{isBn ? "অ্যাসাইনমেন্ট ভান্ডার" : "Assignments Repository"}</option>
                  </>
                )}
                {isTeacher && (
                  <>
                    <option value="classrooms">{isBn ? "আমার ক্লাসরুমসমূহ" : "My Classrooms"}</option>
                    <option value="dashboard">{isBn ? "শিক্ষক ড্যাশবোর্ড" : "Teacher Dashboard"}</option>
                    <option value="assignments">{isBn ? "অ্যাসাইনমেন্ট বিল্ডার" : "Assignments Builder"}</option>
                  </>
                )}
                {isStudent && (
                  <>
                    <option value="student">{isBn ? "শিক্ষার্থী ড্যাশবোর্ড" : "Student Dashboard"}</option>
                    <option value="calendar">{isBn ? "ক্যালেন্ডার ভিউ" : "Calendar View"}</option>
                    <option value="grades">{isBn ? "আমার গ্রেডসমূহ" : "My Grades"}</option>
                  </>
                )}
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                {isBn ? "সিস্টেম টাইমজোন" : "System Timezone"}
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Dhaka">Asia/Dhaka (UTC+06:00)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="America/New_York">Eastern Time (UTC-05:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── SINGLE PRIMARY BOTTOM SAVE ACTION ─── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="shadow-md shadow-blue-600/15"
          >
            {t("btnSaveChange")}
          </Button>
        </div>
      </form>
    </div>
  </div>
  );
}
