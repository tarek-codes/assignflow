"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
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
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    setProgress(15);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        // Smooth logarithmic step increment
        const step = Math.max(1, Math.floor((100 - prev) / 6));
        return prev + step;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-6 text-slate-600 dark:text-slate-300 min-w-[280px]", className)}>
      <div className="relative flex items-center justify-center">
        <Loader2 className={cn("animate-spin text-blue-600 dark:text-blue-400", sizeStyles[size])} />
        <span className="absolute text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
          {progress}%
        </span>
      </div>

      <div className="w-full max-w-[220px] bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 h-1.5 rounded-full transition-all duration-200 ease-out shadow-xs"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-blue-500 animate-pulse shrink-0" />
        <p className="text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300">
          {label} <span className="tabular-nums font-mono text-blue-600 dark:text-blue-400">({progress}%)</span>
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-all">
        {content}
      </div>
    );
  }

  return content;
}
