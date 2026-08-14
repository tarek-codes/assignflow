"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Plus,
  Eye,
  EyeOff,
  Phone,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

const CURRICULUM_SUBJECTS = [
  "Bengali Literature",
  "English Grammar & Composition",
  "General Mathematics",
  "Higher Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "Bangladesh & Global Studies",
  "Religion & Moral Education",
  "Principles of Accounting",
  "Finance & Banking",
  "Science",
  "Digital Technology",
  "History and Social Science",
  "Life and Livelihood",
  "Arts and Culture",
  "Health Protection",
  "Bangla 1st Paper",
  "Bangla 2nd Paper",
  "English 1st Paper",
  "English 2nd Paper",
  "Physics 1st Paper",
  "Physics 2nd Paper",
  "Chemistry 1st Paper",
  "Chemistry 2nd Paper",
  "Biology 1st Paper",
  "Biology 2nd Paper",
  "Higher Mathematics 1st Paper",
  "Higher Mathematics 2nd Paper",
  "Accounting 1st Paper",
  "Accounting 2nd Paper",
  "Finance, Banking and Insurance 1st Paper",
  "Finance, Banking and Insurance 2nd Paper",
  "Business Organization and Management 1st Paper",
  "Business Organization and Management 2nd Paper",
  "Marketing 1st Paper",
  "Marketing 2nd Paper",
  "Production Management & Marketing 1st Paper",
  "Production Management & Marketing 2nd Paper",
  "Economics 1st Paper",
  "Economics 2nd Paper",
  "Civics & Good Governance 1st Paper",
  "Civics & Good Governance 2nd Paper",
  "History 1st Paper",
  "History 2nd Paper",
  "Islamic History & Culture 1st Paper",
  "Islamic History & Culture 2nd Paper",
  "Logic 1st Paper",
  "Logic 2nd Paper",
  "Sociology 1st Paper",
  "Sociology 2nd Paper",
  "Social Work 1st Paper",
  "Social Work 2nd Paper",
  "Geography 1st Paper",
  "Geography 2nd Paper",
  "Psychology 1st Paper",
  "Psychology 2nd Paper",
];


const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language, translateClass, translateSubject } = useLanguage();

  const [role, setRole] = useState<"Student" | "Teacher">("Student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [classLevel, setClassLevel] = useState("9");
  const [group, setGroup] = useState("Science");

  // Multi-subject state for teachers
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["General Mathematics", "Physics"]);
  const [subjectToAdd, setSubjectToAdd] = useState("");

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddSubject = (subjectName: string) => {
    if (!subjectName) return;
    if (!selectedSubjects.includes(subjectName)) {
      setSelectedSubjects((prev) => [...prev, subjectName]);
    }
    setSubjectToAdd("");
  };

  const handleRemoveSubject = (subjectName: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s !== subjectName));
  };

  const PHONE_REGEX = /^(?:\+880\s?1|01)[3-9]\d{2}[-.\s]?\d{6}$|^\+?[1-9]\d{8,14}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (!gender) {
      setErrorMsg("Please select your gender.");
      return;
    }

    setIsSubmitting(true);

    try {
      const isAvailable = await authService.checkEmailExists(trimmedEmail);
      if (isAvailable) {
        setIsSubmitting(false);
        setErrorMsg("This email address is already registered.");
        return;
      }

      let existingRequests: any[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("registration_requests");
        if (stored) existingRequests = JSON.parse(stored);
      }

      const duplicatePending = existingRequests.find(
        (r: any) => r.email?.toLowerCase() === trimmedEmail.toLowerCase()
      );

      if (duplicatePending) {
        setIsSubmitting(false);
        setErrorMsg("A registration request for this email is already pending.");
        return;
      }

      const nameParts = trimmedName.split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || (role === "Teacher" ? "Teacher" : "Student");

      const newRequest = {
        id: "req_" + Date.now(),
        fullName: trimmedName,
        firstName,
        lastName,
        email: trimmedEmail,
        password: password,
        phone: trimmedPhone || "+880 1700-000000",
        gender,
        role,
        classLevel: role === "Student" ? parseInt(classLevel) : undefined,
        group: role === "Student" && parseInt(classLevel) >= 9 ? group : undefined,
        subjectSpecialization: role === "Teacher" ? selectedSubjects.join(", ") : undefined,
        taughtSubjects: role === "Teacher" ? selectedSubjects : undefined,
        notes: notes.trim(),
        requestedAtUtc: new Date().toISOString(),
        status: "Pending",
      };

      if (typeof window !== "undefined") {
        existingRequests.unshift(newRequest);
        localStorage.setItem("registration_requests", JSON.stringify(existingRequests));
      }

      setIsSubmitting(false);
      setSubmitted(true);
      showToast("Account registration request submitted to Admin!", "success");
    } catch {
      setIsSubmitting(false);
      setErrorMsg("Unable to verify email availability. Please try again.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-10 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px]">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-x-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{language === "bn" ? "হোমে ফিরে যান" : "Back to Home"}</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 flex items-center gap-2">
        <LanguageToggle variant="pill" />
      </div>

      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/25">
              <UserPlus className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="font-sans-brand text-base font-black tracking-tight">AssignFlow</p>
              <p className="text-xs text-slate-400">{t("authAccountOnboarding")}</p>
            </div>
          </div>

          <div className="relative max-w-lg py-8 space-y-6">
            <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              {t("authJoinAcademicWorkspace")}
              <span className="mt-1.5 block text-blue-400">{t("authPortalLabel")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t("authRegisterSubtitle")}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t("authAdminReviewNote")}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t("authInstantAccessNote")}</span>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-slate-500">{t("authFooterSecurityNote")}</p>
        </section>

        <section className="relative flex items-center justify-center p-8 sm:p-10 lg:p-12">
          <div className="w-full max-w-2xl">
            {submitted ? (
              <div className="text-center space-y-5 py-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("authRequestSuccess")}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Your request for a <span className="font-bold text-blue-600 dark:text-blue-400">{role === "Student" ? t("authStudentRole") : t("authTeacherRole")}</span> has been queued for Administrator approval.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t("authFullName")}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t("authEmail")}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t("authRequestedRole")}:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{role === "Student" ? t("authStudentRole") : t("authTeacherRole")}</span>
                  </div>
                  {role === "Teacher" && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t("authTaughtSubjectsLabel")}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {selectedSubjects.map(s => translateSubject(s)).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <Link href="/login">
                    <Button size="lg" className="w-full rounded-xl">
                      {t("authReturnLogin")}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-3xl">
                    {t("authRegisterTitle")}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t("authRegisterSubtitle")}
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authRequestedRole")}</label>
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setRole("Student")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${role === "Student"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                      >
                        <User className="w-4 h-4" /> {t("authStudentRole")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("Teacher")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${role === "Teacher"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                      >
                        <GraduationCap className="w-4 h-4" /> {t("authTeacherRole")}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authFullName")}</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={language === "bn" ? "যেমন: তানভির আহমেদ" : "e.g. Sarah Jenkins"}
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authEmail")}</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@school.edu"
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authPhone")}</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 01700-123456"
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                    {/* Gender Select Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === "bn" ? "লিঙ্গ (Gender) *" : "Gender *"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm pointer-events-none">
                          {gender === "Female" ? "♀" : "♂"}
                        </span>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                          required
                        >
                          <option value="Male">{language === "bn" ? "পুরুষ (Male)" : "Male (♂)"}</option>
                          <option value="Female">{language === "bn" ? "মহিলা (Female)" : "Female (♀)"}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authPassword")}</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {role === "Student" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authClassLevelLabel")}</label>
                        <select
                          value={classLevel}
                          onChange={(e) => setClassLevel(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                        >
                          {[6, 7, 8, 9, 10, 11, 12].map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {translateClass(lvl)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {parseInt(classLevel, 10) >= 9 && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {language === "bn" ? "বিভাগ / গ্রুপ *" : "Academic Group *"}
                          </label>
                          <select
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                          >
                            <option value="Science">{language === "bn" ? "বিজ্ঞান (Science)" : "Science"}</option>
                            <option value="Humanities">{language === "bn" ? "মানবিক (Humanities)" : "Humanities"}</option>
                            <option value="Business Studies">{language === "bn" ? "ব্যবসায় শিক্ষা (Business Studies)" : "Business Studies"}</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authTaughtSubjectsLabel")}</label>
                      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900">
                        {selectedSubjects.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No subjects selected yet</span>
                        ) : (
                          selectedSubjects.map((sub) => (
                            <span key={sub} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                              <span>{translateSubject(sub)}</span>
                              <button type="button" onClick={() => handleRemoveSubject(sub)} className="hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={subjectToAdd}
                          onChange={(e) => setSubjectToAdd(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          <option value="">-- {t("authSelectSubjectOption")} --</option>
                          {CURRICULUM_SUBJECTS.filter((s) => !selectedSubjects.includes(s)).map((sub) => (
                            <option key={sub} value={sub}>{translateSubject(sub)}</option>
                          ))}
                        </select>
                        <Button type="button" size="sm" variant="outline" onClick={() => handleAddSubject(subjectToAdd)} disabled={!subjectToAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("authAdditionalNotes")}</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={language === "bn" ? "আবেদন তৈরির কারণ বা মন্তব্য..." : "Reason for account creation request..."}
                      className="w-full p-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-xl mt-2" isLoading={isSubmitting} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {isSubmitting ? t("authSubmittingRegister") : t("authSubmitRegister")}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  {t("authAlreadyHaveAccount")}{" "}
                  <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {t("authSignInHere")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
