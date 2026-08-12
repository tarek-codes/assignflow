import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/utils/cn";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records to display at this moment.",
  icon = <FolderOpen className="w-10 h-10 text-slate-400" />,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl my-4", className)}>
      <div className="p-4 bg-slate-100 dark:bg-slate-700/60 rounded-2xl mb-3">{icon}</div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
