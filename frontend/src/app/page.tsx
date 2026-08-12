"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ClipboardList,
  BarChart3,
  Calendar,
  Lock,
  Layers,
  Award,
  Clock,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  const handlePortalRedirect = () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }
    let targetRoute = ROUTES.DASHBOARD;
    if (typeof window !== "undefined" && user?.id) {
      const savedView = localStorage.getItem(`settings_${user.id}_defaultView`);
      if (savedView === "manage") targetRoute = ROUTES.ADMIN_MANAGE;
      else if (savedView === "assignments") targetRoute = ROUTES.ASSIGNMENTS;
      else if (savedView === "classrooms") targetRoute = ROUTES.TEACHER_CLASSROOMS;
      else if (savedView === "calendar") targetRoute = ROUTES.STUDENT_CALENDAR;
      else if (savedView === "grades") targetRoute = ROUTES.STUDENT_GRADES;
    }
    router.push(targetRoute);
  };

  const coreFeatures = [
    {
      icon: ClipboardList,
      title: "Smart Assignment Creation",
      desc: "Teachers effortlessly publish tasks with multi-file support, strict deadline controls, and target classroom mapping.",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    },
    {
      icon: FileCheck2,
      title: "Structured Submission Engine",
      desc: "Students submit work seamlessly, track due dates, get instant submission status badges, and resubmit within policy limits.",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      icon: Award,
      title: "Fair Grading & Feedback",
      desc: "Rich evaluation interface with automatic percentage calculation, performance grade tiers (A+ down to F), and custom notes.",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    },
    {
      icon: BarChart3,
      title: "System-Wide Analytics",
      desc: "Interactive admin dashboards featuring monthly assignment creation trends, status distributions, and position heatmaps.",
      color: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
    },
    {
      icon: Layers,
      title: "Class & Group Filtering",
      desc: "Curriculum mapping across Classes 6–12 with specialized group filters (Science, Business Studies, Humanities) for Classes 9–12.",
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400",
    },
    {
      icon: Lock,
      title: "Role-Based Access Control",
      desc: "Granular permissions for Admins, Teachers, and Students, complete with approval workflows and user directory management.",
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
    },
  ];

  const rolePillars = [
    {
      role: "Administrator",
      icon: ShieldCheck,
      badge: "Full Control",
      points: [
        "Real-time analytics dashboard & monthly metrics",
        "Student & Teacher directory with Gender filters",
        "Class 9–12 Group filtering (Science/Business/Humanities)",
        "System approval queue for new account requests",
      ],
      color: "border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      role: "Teacher",
      icon: GraduationCap,
      badge: "Academic Lead",
      points: [
        "Create, edit, and publish class assignments",
        "Review received submissions with inline document viewer",
        "Grade work with custom feedback and percentage marks",
        "Track class submission counts (e.g. 13/15 turned in)",
      ],
      color: "border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20",
      accent: "text-violet-600 dark:text-violet-400",
    },
    {
      role: "Student",
      icon: Users,
      badge: "Learner Portal",
      points: [
        "Clear task list sorted by upcoming deadlines",
        "Interactive calendar view for assignment planning",
        "Detailed grades breakdown and teacher feedback",
        "Distinct status tracking for pending, graded, or late work",
      ],
      color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans-brand transition-colors duration-200 selection:bg-blue-200 selection:text-blue-950">
      {/* ─── FLOATING CAPSULE NAVIGATION BAR ─── */}
      <header className="relative z-40 w-full pt-8 sm:pt-10 lg:pt-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 shadow-xl shadow-slate-900/5 backdrop-blur-md px-5 py-3 sm:px-7 sm:py-3.5 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <BookOpenCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-950 dark:text-white">AssignFlow</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-400">
                Academic Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isAuthenticated ? (
              <Button
                onClick={handlePortalRedirect}
                className="ml-1.5 gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 px-4 py-2"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <div className="ml-1 flex items-center gap-1.5">
                <Link
                  href={ROUTES.LOGIN}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  Register
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:28px_28px]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/50 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Next-Generation Assignment Management System</span>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-600/40 ring-4 ring-blue-500/20 animate-pulse">
              <BookOpenCheck className="h-11 w-11 sm:h-14 sm:w-14" />
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white">
              Assign<span className="text-blue-600 dark:text-blue-400">Flow</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base lg:text-lg font-semibold text-slate-500 dark:text-slate-400 max-w-xl">
              Empowering Academic Excellence Through Seamless Assignment & Submission Workflows
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex w-40 items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 px-6 py-3.5 transition-all hover:-translate-y-0.5"
            >
              <span>Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex w-40 items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-extrabold text-sm shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3.5 transition-all hover:-translate-y-0.5"
            >
              <span>Register</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50">
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">Admin Control</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Central User & System Metrics</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50">
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">Smart Workflows</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Submission-Grading Simplified</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50">
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">Real-Time</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Grading & Feedback</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50">
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">100% Secure</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Role-Based Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURES GRID ─── */}
      <section className="mt-12 sm:mt-20 lg:mt-28 py-24 sm:py-36 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">System Capabilities</h2>
            <p className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Engineered for Modern Educational Excellence
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Designed with a clean, high-contrast aesthetic that keeps educators and students focused on learning outcomes.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feat.color} shadow-xs`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ROLE PILLARS ─── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Tailored Workspaces</h2>
            <p className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              One Platform, Three Tailored Experiences
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Each user role receives a bespoke interface optimized for their exact responsibilities.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {rolePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.role}
                  className={`rounded-2xl border ${pillar.color} p-6 sm:p-7 backdrop-blur-sm flex flex-col justify-between shadow-sm`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 ${pillar.accent} shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {pillar.role} Experience
                    </h3>

                    <ul className="mt-5 space-y-3">
                      {pillar.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${pillar.accent}`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    <button
                      onClick={handlePortalRedirect}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-current ${pillar.accent}`}
                    >
                      <span>Explore {pillar.role} Portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <BookOpenCheck className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">AssignFlow Portal</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <Link href={ROUTES.LOGIN} className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <span>&bull;</span>
            <Link href="/register" className="hover:text-blue-600 transition-colors">
              Register Account
            </Link>
            <span>&bull;</span>
            <button onClick={handlePortalRedirect} className="hover:text-blue-600 transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

