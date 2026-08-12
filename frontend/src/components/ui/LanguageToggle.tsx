"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageToggleProps {
  variant?: "button" | "pill" | "compact";
  className?: string;
}

export function LanguageToggle({ variant = "pill", className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "compact") {
    return (
      <button
        onClick={() => setLanguage(language === "en" ? "bn" : "en")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
          language === "bn"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
        } ${className}`}
        title="Switch Language / ভাষা পরিবর্তন করুন"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{language === "en" ? "EN" : "বাংলা"}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === "en"
            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === "bn"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
