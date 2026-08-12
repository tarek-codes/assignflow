import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} Assignment Management System. All rights reserved.</p>
        <p className="text-[11px] text-slate-400">Enterprise Academic Portal • Next.js & ASP.NET Core API</p>
      </div>
    </footer>
  );
}
