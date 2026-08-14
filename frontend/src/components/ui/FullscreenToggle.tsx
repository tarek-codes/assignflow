"use client";

import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { cn } from "@/utils/cn";

export interface FullscreenToggleProps {
  className?: string;
}

export function FullscreenToggle({ className }: FullscreenToggleProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 select-none backdrop-blur-md border shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-white/10 hover:bg-white/20 border-white/30 text-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:border-slate-700/80 dark:text-blue-200",
        className
      )}
    >
      {isFullscreen ? (
        <Minimize className="w-4 h-4 transition-transform hover:scale-110" />
      ) : (
        <Maximize className="w-4 h-4 transition-transform hover:scale-110" />
      )}
    </button>
  );
}
