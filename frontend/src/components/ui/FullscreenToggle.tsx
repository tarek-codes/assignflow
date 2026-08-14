"use client";

import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { cn } from "@/utils/cn";
import { useLanguage } from "@/context/LanguageContext";

export interface FullscreenToggleProps {
  className?: string;
}

export function FullscreenToggle({ className }: FullscreenToggleProps) {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen mode:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      aria-label="Toggle Fullscreen"
      title={isFullscreen ? t("btnExitFullscreen") : t("btnGoFullscreen")}
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 select-none backdrop-blur-md border shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-white/10 hover:bg-white/20 border-white/30 text-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:border-slate-700/80 dark:text-blue-200 text-xs font-semibold shrink-0",
        className
      )}
    >
      {isFullscreen ? (
        <>
          <Minimize className="w-3.5 h-3.5 shrink-0 transition-transform hover:scale-110" />
          <span className="whitespace-nowrap">{t("btnExitFullscreen")}</span>
        </>
      ) : (
        <>
          <Maximize className="w-3.5 h-3.5 shrink-0 transition-transform hover:scale-110" />
          <span className="whitespace-nowrap">{t("btnGoFullscreen")}</span>
        </>
      )}
    </button>
  );
}
