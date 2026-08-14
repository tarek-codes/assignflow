"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  translations,
  TranslationKey,
  SUBJECT_TRANSLATIONS,
  CLASS_LEVEL_TRANSLATIONS,
} from "@/constants/translations";
import { translateUserName as transliterateName, translateDetailText as transliterateDetail } from "@/utils/transliteration";

export type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  translateSubject: (subjectName?: string) => string;
  translateClass: (level?: number | string) => string;
  translateUserName: (name?: string) => string;
  translateDetailText: (text?: string) => string;
  toBanglaDigits: (strOrNum?: string | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "app_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLanguage === "en" || savedLanguage === "bn") {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Sync with role-specific keys if present
    ["student", "teacher", "admin"].forEach((role) => {
      localStorage.setItem(`${role}_language`, lang);
    });
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, rawVal]) => {
        const valStr = language === "bn" ? toBanglaDigits(rawVal) : String(rawVal);
        text = text.replace(new RegExp(`{\\s*${paramKey}\\s*}`, "g"), valStr);
      });
    }

    return text;
  };

  const translateSubject = (subjectName?: string): string => {
    if (!subjectName) return "";
    const cleanKey = subjectName.trim().toLowerCase();

    // 1. Direct match
    const entry = SUBJECT_TRANSLATIONS[cleanKey];
    if (entry) {
      return entry[language] || subjectName;
    }

    // 2. Fuzzy normalized match (& vs and)
    const normalized = cleanKey.replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
    for (const [key, val] of Object.entries(SUBJECT_TRANSLATIONS)) {
      const normKey = key.replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
      if (normKey === normalized) {
        return val[language] || subjectName;
      }
    }

    // 3. Transliteration fallback for unknown subject titles in Bangla
    return language === "bn" ? transliterateName(subjectName, "bn") : subjectName;
  };

  const translateClass = (level?: number | string): string => {
    if (level === undefined || level === null) return "";
    const numLevel = typeof level === "number" ? level : parseInt(String(level).replace(/\D/g, ""), 10);
    if (!isNaN(numLevel) && CLASS_LEVEL_TRANSLATIONS[numLevel]) {
      return CLASS_LEVEL_TRANSLATIONS[numLevel][language];
    }
    return `Class ${level}`;
  };

  const toBanglaDigits = (strOrNum?: string | number): string => {
    if (strOrNum === undefined || strOrNum === null) return "";
    const str = String(strOrNum);
    if (language !== "bn") return str;
    const banglaNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return str.replace(/[0-9]/g, (digit) => banglaNums[parseInt(digit, 10)]);
  };

  const translateUserName = (name?: string): string => {
    return transliterateName(name, language);
  };

  const translateDetailText = (text?: string): string => {
    return transliterateDetail(text, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateSubject,
        translateClass,
        translateUserName,
        translateDetailText,
        toBanglaDigits,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
