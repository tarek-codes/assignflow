import React from "react";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm border border-transparent",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
      outline:
        "bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 border border-transparent",
      danger:
        "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 shadow-sm border border-transparent",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm font-medium rounded-xl gap-2",
      lg: "px-5 py-2.5 text-base font-medium rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
