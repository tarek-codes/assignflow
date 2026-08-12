import React from "react";
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
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-6 text-slate-600 dark:text-slate-300", className)}>
      <Loader2 className={cn("animate-spin text-blue-600 dark:text-blue-400", sizeStyles[size])} />
      {label && <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
