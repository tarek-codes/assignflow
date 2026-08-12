"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/utils/cn";

export interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "banner";
}

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === "banner") {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/40 text-white shadow-md backdrop-blur-md transition-all active:scale-95 font-semibold text-xs",
          className
        )}
      >
        {theme === "dark" ? (
          <>
            <Sun className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Switch to Light</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-white fill-white" />
            <span>Switch to Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
