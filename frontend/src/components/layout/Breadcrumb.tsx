import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4", className)}>
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
