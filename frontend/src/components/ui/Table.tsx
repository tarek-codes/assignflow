import React from "react";
import { cn } from "@/utils/cn";

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-sm">
      <table className={cn("w-full text-left border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-slate-950 dark:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider sticky top-0 z-10 divide-x divide-slate-700/60", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-800 dark:text-slate-200", className)} {...props}>{children}</tbody>;
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors duration-150 divide-x divide-slate-100 dark:divide-slate-700/50", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-5 py-3.5 font-bold text-white", className)} {...props}>{children}</th>;
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-4 whitespace-nowrap text-sm", className)} {...props}>{children}</td>;
}

