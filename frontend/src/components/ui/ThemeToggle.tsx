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
  const isDark = theme === "dark";

  if (variant === "banner") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle light and dark mode"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={cn(
          "relative flex items-center justify-between w-[72px] h-[34px] rounded-full p-1 cursor-pointer transition-colors duration-300 select-none backdrop-blur-md shadow-inner border focus:outline-none focus:ring-2 focus:ring-blue-400/50",
          isDark
            ? "bg-slate-900/80 border-slate-700/80 text-slate-300"
            : "bg-white/30 border-white/50 text-white",
          className
        )}
      >
        {/* Left Side: Sun (Light Mode) */}
        <span className="flex items-center justify-center w-6 h-6 ml-0.5 z-0">
          <Sun className={cn("w-3.5 h-3.5 transition-colors duration-200", isDark ? "text-slate-400" : "text-amber-300 fill-amber-300")} />
        </span>

        {/* Right Side: Moon (Dark Mode) */}
        <span className="flex items-center justify-center w-6 h-6 mr-0.5 z-0">
          <Moon className={cn("w-3.5 h-3.5 transition-colors duration-200", isDark ? "text-blue-300 fill-blue-300" : "text-white/70")} />
        </span>

        {/* Sliding Knob (Left to Right Toggle) */}
        <span
          className={cn(
            "absolute top-1 left-1 w-6 h-6 rounded-full shadow-md backdrop-blur-lg transform transition-transform duration-300 ease-spring flex items-center justify-center border z-10",
            isDark
              ? "translate-x-[38px] bg-slate-800 border-slate-600 text-blue-400"
              : "translate-x-0 bg-white border-amber-200 text-amber-500"
          )}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "relative flex items-center justify-between w-[68px] h-[32px] rounded-full p-1 cursor-pointer transition-colors duration-300 select-none border focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner",
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-400"
          : "bg-slate-100 border-slate-300 text-slate-500",
        className
      )}
    >
      {/* Left Side: Sun (Light) */}
      <span className="flex items-center justify-center w-5 h-5 ml-0.5 z-0">
        <Sun className={cn("w-3.5 h-3.5 transition-colors duration-200", isDark ? "text-slate-500" : "text-amber-500")} />
      </span>

      {/* Right Side: Moon (Dark) */}
      <span className="flex items-center justify-center w-5 h-5 mr-0.5 z-0">
        <Moon className={cn("w-3.5 h-3.5 transition-colors duration-200", isDark ? "text-indigo-400" : "text-slate-400")} />
      </span>

      {/* Sliding Knob */}
      <span
        className={cn(
          "absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-spring flex items-center justify-center border z-10",
          isDark
            ? "translate-x-[36px] bg-slate-800 border-slate-600 text-indigo-400"
            : "translate-x-0 bg-white border-slate-200 text-amber-500"
        )}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
        )}
      </span>
    </button>
  );
}
