"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-[#f6f8fc] dark:bg-slate-950 transition-colors">
        {/* Sidebar & Mobile Drawer */}
        <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Sidebar />

        {/* Main Content Area (Pushed straight to top) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Bar (Only visible on lg:hidden) */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            <span className="font-sans-brand font-black text-slate-900 dark:text-slate-100 text-lg tracking-tight">
              Assign<span className="text-blue-600 dark:text-blue-400">Flow</span>
            </span>

            <ThemeToggle />
          </header>

          <main className="relative mx-auto w-full max-w-370 flex-1 overflow-x-hidden p-3.5 sm:p-4 lg:px-6 lg:py-3.5 flex flex-col justify-between">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(59,130,246,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_75%_0%,rgba(59,130,246,0.08),transparent_32%)]" />
            <div className="relative">
              {children}
            </div>

            {/* ─── MINIMAL THIN FOOTER ─── */}
            <footer className="relative mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-1 shrink-0">
              <p>© {new Date().getFullYear()} AssignFlow System. All rights reserved.</p>
              <div className="flex items-center gap-3 font-medium">
                <span>Assignment Submission Platform</span>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
