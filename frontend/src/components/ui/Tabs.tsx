"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab: externalActiveTab, onChange, className }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || "");
  const currentTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const handleSelect = (id: string) => {
    if (onChange) onChange(id);
    else setInternalActiveTab(id);
  };

  return (
    <div className={cn("flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-700/80", className)}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              isActive
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
            )}
          >
            {tab.icon && <span className="shrink-0 text-current">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-md font-bold tabular-nums",
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                    : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
