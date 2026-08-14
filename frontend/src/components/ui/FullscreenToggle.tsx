"use client";

import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { cn } from "@/utils/cn";
import { useLanguage } from "@/context/LanguageContext";

export interface FullscreenToggleProps {
  className?: string;
  variant?: "default" | "compact";
}

export function FullscreenToggle({ className, variant = "default" }: FullscreenToggleProps) {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkIsFullscreen = () => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkIsFullscreen());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        if ((e as any)._f11Handled) return;
        (e as any)._f11Handled = true;
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    // Sync on mount
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!checkIsFullscreen()) {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        const doc = document as any;
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
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
