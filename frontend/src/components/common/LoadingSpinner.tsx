"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    setProgress(18);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          clearInterval(interval);
          return 94;
        }
        const step = Math.max(1, Math.floor((100 - prev) / 5));
        return prev + step;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const spinnerSizeClass = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }[size];

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8 text-slate-700 dark:text-slate-200 min-w-[300px] max-w-sm mx-auto text-center select-none", className)}>
      {/* Sleek Blue Circular Spinner Container with Progress % in Center */}
      <div className="relative flex items-center justify-center">
        <Loader2 className={cn("animate-spin text-blue-600 dark:text-blue-500 stroke-[2.5]", spinnerSizeClass)} />
        <span className="absolute text-xs font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
          {progress}%
        </span>
      </div>

      {/* Pure Blue Theme Progress Bar */}
      <div className="w-full max-w-[240px] bg-blue-50 dark:bg-slate-800/90 rounded-full h-2 overflow-hidden border border-blue-100 dark:border-blue-900/40 p-0.5 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 h-full rounded-full transition-all duration-200 ease-out shadow-sm shadow-blue-500/20"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label and Status */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-200">
          {label}
        </p>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
          {progress}% completed
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md transition-all p-4">
        <div className="bg-white/95 dark:bg-slate-900/95 border border-blue-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl shadow-blue-950/20">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[220px] w-full py-10">
      {content}
    </div>
  );
}
