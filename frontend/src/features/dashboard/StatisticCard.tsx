import React from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export interface StatisticCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: string;
  className?: string;
}

export function StatisticCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  trend,
  className,
}: StatisticCardProps) {
  return (
    <Card hoverEffect className={cn("flex flex-col justify-between gap-4 p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-2xl shrink-0", iconBgColor)}>{icon}</div>
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700/50">
          {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
          {trend && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{trend}</span>}
        </div>
      )}
    </Card>
  );
}
