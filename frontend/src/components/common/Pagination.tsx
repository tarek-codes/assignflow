"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  if (total > 1) pages.push(total);
  return pages;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Show "Showing X–Y of Z" instead of "Page X of Y" on the left. */
  showRange?: boolean;
  pageSize?: number;
  totalItems?: number;
  className?: string;
}

/**
 * Shared pagination control used across every table in the system.
 * - Prev / Next chevron buttons
 * - Numbered page buttons with ellipsis for large page counts
 * - A "Go to page" input alongside the buttons (press Enter to jump)
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showRange = false,
  pageSize = 10,
  totalItems = 0,
  className = "",
}: PaginationProps) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  // Keep the input in sync when the page changes externally (filters, etc.)
  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const jumpToPage = () => {
    const v = parseInt(inputValue, 10);
    if (isNaN(v)) return;
    const clamped = Math.min(totalPages, Math.max(1, v));
    onPageChange(clamped);
    setInputValue(String(clamped));
  };

  return (
    <div className={`flex items-center justify-between pt-2 ${className}`}>
      <span className="text-xs text-slate-500 font-medium">
        {showRange ? (
          <>
            Showing {start}&ndash;{end} of {totalItems}
          </>
        ) : (
          <>
            Page {currentPage} of {totalPages}
          </>
        )}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers(currentPage, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400 select-none">
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[2rem] h-8 rounded-lg text-xs font-bold transition-all ${
                currentPage === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Jump-to-page input */}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(val);
              const v = parseInt(val, 10);
              if (!isNaN(v)) {
                const clamped = Math.min(totalPages, Math.max(1, v));
                onPageChange(clamped);
              }
            }}
            onBlur={() => setInputValue(String(currentPage))}
            className="w-14 text-center text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
            title="Type a page number to jump"
          />
        </div>
      </div>
    </div>
  );
}
