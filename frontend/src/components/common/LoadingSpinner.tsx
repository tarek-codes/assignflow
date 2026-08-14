"use client";

import React from "react";
import { BookOpenCheck } from "lucide-react";
import { cn } from "@/utils/cn";

export interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  progress?: number; // Real optional progress percentage (0 - 100)
  className?: string;
}

export function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
  size = "md",
  progress,
  className,
}: LoadingSpinnerProps) {
  const hasRealProgress = typeof progress === "number" && !isNaN(progress);
  const normalizedProgress = hasRealProgress ? Math.min(100, Math.max(0, Math.round(progress))) : null;

  const sizeConfig = {
    sm: {
      container: "w-10 h-10",
      svg: 40,
      stroke: 3.5,
      icon: "w-4 h-4",
      text: "text-[10px]",
      bar: "max-w-[180px] h-1.5",
    },
    md: {
      container: "w-16 h-16",
      svg: 64,
      stroke: 4.5,
      icon: "w-6 h-6",
      text: "text-xs",
      bar: "max-w-[240px] h-2",
    },
    lg: {
      container: "w-20 h-20",
      svg: 80,
      stroke: 5.5,
      icon: "w-8 h-8",
      text: "text-sm",
      bar: "max-w-[300px] h-2.5",
    },
  }[size];

  const radius = (sizeConfig.svg - sizeConfig.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = normalizedProgress !== null
    ? circumference - (normalizedProgress / 100) * circumference
    : 0;

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 text-slate-700 dark:text-slate-200 min-w-[260px] max-w-sm mx-auto text-center select-none",
        className
      )}
    >
      {/* Ultra-Modern Multi-Layer Glowing Circular Spinner */}
      <div className={cn("relative flex items-center justify-center", sizeConfig.container)}>
        {/* Soft Ambient Backdrop Blur Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-500/30 blur-xl animate-pulse" />

        {/* Outer Rotating SVG Track & Arc */}
        <svg
          className={cn(
            "w-full h-full transform -rotate-90",
            normalizedProgress === null && "animate-spin"
          )}
          viewBox={`0 0 ${sizeConfig.svg} ${sizeConfig.svg}`}
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={sizeConfig.svg / 2}
            cy={sizeConfig.svg / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className="text-slate-200/80 dark:text-slate-800/80"
          />

          {/* Active Gradient Stroke */}
          <circle
            cx={sizeConfig.svg / 2}
            cy={sizeConfig.svg / 2}
            r={radius}
            fill="none"
            stroke="url(#spinnerGradient)"
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={normalizedProgress !== null ? strokeDashoffset : circumference * 0.3}
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Content: Real Progress % OR Glowing Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          {normalizedProgress !== null ? (
            <span className={cn("font-black tracking-tight text-blue-600 dark:text-blue-400 tabular-nums", sizeConfig.text)}>
              {normalizedProgress}%
            </span>
          ) : (
            <BookOpenCheck className={cn("text-blue-600 dark:text-blue-400 animate-pulse stroke-[2.2]", sizeConfig.icon)} />
          )}
        </div>
      </div>

      {/* Progress Bar Component */}
      <div className={cn("w-full bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-800 p-0.5 shadow-inner relative", sizeConfig.bar)}>
        {normalizedProgress !== null ? (
          /* Real Progress Bar */
          <div
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs shadow-blue-500/30"
            style={{ width: `${normalizedProgress}%` }}
          />
        ) : (
          /* Indeterminate Animated Shimmer Bar */
          <div className="w-full h-full relative overflow-hidden rounded-full bg-blue-100/50 dark:bg-blue-950/40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600 to-transparent w-2/3 h-full rounded-full animate-shimmer" />
          </div>
        )}
      </div>

      {/* Label & Status Line */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-bold tracking-wide text-slate-800 dark:text-slate-100">
          {label}
        </p>
        {normalizedProgress !== null && (
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
            {normalizedProgress}% completed
          </span>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md transition-all p-4">
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl shadow-slate-950/30">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full py-8">
      {content}
    </div>
  );
}
