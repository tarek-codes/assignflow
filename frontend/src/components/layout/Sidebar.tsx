"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Upload,
  UserCircle,
  Settings,
  CalendarDays,
  Layers,
  School,
  Award,
  LogOut,
  UserCheck,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ROLES } from "@/constants/roles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const isStudent = user?.role === ROLES.STUDENT;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;

  const navLinks = isStudent
    ? [
        { label: t("navDashboard"), href: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
        { label: t("navCalendar"), href: ROUTES.STUDENT_CALENDAR, icon: CalendarDays },
        { label: isStudent ? "My Submissions" : t("navSubmissions"), href: ROUTES.SUBMISSIONS, icon: Upload },
        { label: t("navMyGrades"), href: ROUTES.STUDENT_GRADES, icon: Award },
      ]
    : [
        { label: t("navDashboard"), href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        ...(isAdmin ? [{ label: t("navClasses"), href: ROUTES.MANAGE, icon: Layers }] : []),
        ...(isTeacher ? [{ label: t("navMyClassrooms"), href: ROUTES.TEACHER_CLASSROOMS, icon: School }] : []),
        { label: isTeacher ? "Created Assignments" : t("navAssignments"), href: ROUTES.ASSIGNMENTS, icon: FileText },
        { label: isTeacher ? "Received Submissions" : t("navSubmissions"), href: ROUTES.SUBMISSIONS, icon: Upload },
        ...(isAdmin ? [{ label: "Results", href: ROUTES.ADMIN_RESULTS, icon: Award }] : []),
        ...(isAdmin ? [{ label: t("navApprovals"), href: ROUTES.APPROVALS, icon: UserCheck }] : []),
      ];

  const accountLinks = [
    { label: t("navProfile"), href: ROUTES.PROFILE, icon: UserCircle },
    { label: t("navSettings"), href: ROUTES.SETTINGS, icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href ||
    (href !== ROUTES.DASHBOARD && href !== ROUTES.STUDENT_DASHBOARD && pathname.startsWith(href));

  const renderLink = (item: { label: string; href: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-150",
          active
            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50 font-bold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="relative hidden lg:flex flex-col w-68 border-r border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 min-h-screen shrink-0 transition-colors z-20">
      {/* ─── LOGO HEADER ─── */}
      <div className="sidebar-header flex items-center gap-3.5 px-5 pt-9 pb-5 border-b border-slate-200/70 dark:border-slate-800 shrink-0 transition-all">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/30 transition-transform group-hover:scale-105 shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          </div>
          <span className="font-sans-brand font-black text-slate-900 dark:text-slate-100 text-2xl tracking-tight leading-none">
            Assign<span className="animate-flow-text font-black pr-1.5 inline-block">Flow</span>
          </span>
        </Link>
      </div>

      {/* ─── NAVIGATION & ACCOUNT BODY ─── */}
      <div className="flex flex-col justify-between flex-1 py-5 px-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Menu */}
          <div>
            <p className="px-3.5 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t("secMenu")}
            </p>
            <nav className="space-y-1">
              {navLinks.map(renderLink)}
            </nav>
          </div>

          {/* Account Section */}
          <div>
            <p className="px-3.5 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t("secAccount")}
            </p>
            <nav className="space-y-1">
              {accountLinks.map(renderLink)}

              {/* Sign Out Button inside Account */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors mt-1.5"
              >
                <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                <span>{t("navSignOut")}</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
