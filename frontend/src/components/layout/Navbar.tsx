"use client";

import React from "react";
import { Menu, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { FullscreenToggle } from "@/components/ui/FullscreenToggle";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { useLanguage } from "@/context/LanguageContext";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { t, translateUserName } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-7 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand */}
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/30 transition-transform group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>
            <span className="font-sans-brand font-black text-slate-900 dark:text-slate-100 text-xl sm:text-2xl tracking-tight">
              Assign<span className="text-blue-600 dark:text-blue-400">Flow</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <FullscreenToggle className="hidden sm:flex" />
          <LanguageToggle variant="compact" />
          <ThemeToggle />
          <NotificationDropdown />

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <Avatar name={user.fullName} isCurrentUser size="sm" />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
                    {translateUserName(user.fullName)}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
                    {user.role === "Student" ? t("navRoleStudent") : user.role === "Teacher" ? t("navRoleTeacher") : t("navRoleAdmin")}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {dropdownOpen && (
                <div
                  onClick={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{translateUserName(user.fullName)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={ROUTES.PROFILE}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {t("navProfile")}
                  </Link>
                  <Link
                    href={ROUTES.SETTINGS}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    {t("navSettings")}
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("navSignOut")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
