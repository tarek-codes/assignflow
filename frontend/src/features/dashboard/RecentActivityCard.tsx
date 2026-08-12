import React from "react";
import { RecentActivity } from "@/types/dashboard";
import { formatDate } from "@/utils/formatters";
import { Activity } from "lucide-react";

export function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  const top4 = activities.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Recent Activity</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Latest system events</p>
          </div>
        </div>
        {top4.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {top4.length} events
          </span>
        )}
      </div>

      {top4.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-slate-400">No recent activity.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {top4.map((act, index) => (
            <div key={index} className="flex items-center justify-between px-5 py-3 text-xs sm:text-sm hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">{act.userName || "System"}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 font-medium">({act.userRole || "User"})</span>
                <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{act.description}</span>
              </div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                {formatDate(act.timestampUtc)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
