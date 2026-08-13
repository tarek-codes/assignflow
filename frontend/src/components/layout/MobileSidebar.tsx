"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, FileText, Upload, User, Settings, CalendarDays, Layers, Award, School, LogOut, UserCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ROLES } from "@/constants/roles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isStudent = user?.role === ROLES.STUDENT;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;

  const navLinks = isStudent
    ? [
        { label: t("navDashboard"), href: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
        { label: t("navCalendar"), href: ROUTES.STUDENT_CALENDAR, icon: CalendarDays },
        { label: t("navMySubmissions"), href: ROUTES.SUBMISSIONS, icon: Upload },
        { label: t("navMyGrades"), href: ROUTES.STUDENT_GRADES, icon: Award },
      ]
    : [
        { label: t("navDashboard"), href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        ...(isAdmin ? [{ label: t("navClasses"), href: ROUTES.MANAGE, icon: Layers }] : []),
        ...(isTeacher ? [{ label: t("navMyClassrooms"), href: ROUTES.TEACHER_CLASSROOMS, icon: School }] : []),
        { label: isTeacher ? t("navCreatedAssignments") : t("navAssignments"), href: ROUTES.ASSIGNMENTS, icon: FileText },
        { label: isTeacher ? t("navReceivedSubmissions") : t("navSubmissions"), href: ROUTES.SUBMISSIONS, icon: Upload },
        ...(isAdmin ? [{ label: t("navResults"), href: ROUTES.ADMIN_RESULTS, icon: Award }] : []),
        ...(isAdmin ? [{ label: t("navApprovals"), href: ROUTES.APPROVALS, icon: UserCheck }] : []),
      ];

  const accountLinks = [
    { label: t("navProfile"), href: ROUTES.PROFILE, icon: User },
    { label: t("navSettings"), href: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25">AF</div>
              <div>
                <span className="block font-black text-slate-900 dark:text-slate-100 text-lg">Assign<span className="animate-flow-text font-black pr-1.5 inline-block">Flow</span></span>
                <span className="block text-xs text-slate-400">Academic workspace</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <div>
            <p className="mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t("secMenu")}
            </p>
            <nav className="flex flex-col gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account Section */}
          <div>
            <p className="mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t("secAccount")}
            </p>
            <nav className="flex flex-col gap-1">
              {accountLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="mt-2 w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                <span>{t("navSignOut")}</span>
              </button>

              {isAdmin && pathname === ROUTES.DASHBOARD && (
                <div className="mt-auto mb-10 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 px-3.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium text-left leading-relaxed">
                  © {new Date().getFullYear()} AssignFlow. All rights reserved
                </div>
              )}



            </nav>
          </div>
        </div>
      </div>
    </div>

  );
}
