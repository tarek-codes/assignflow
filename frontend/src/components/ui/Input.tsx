import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, type, showPasswordToggle = true, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPasswordType = type === "password";
    const actualType = isPasswordType && isPasswordVisible ? "text" : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={actualType}
            className={cn(
              "w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
              leftIcon && "pl-10",
              (rightIcon || (isPasswordType && showPasswordToggle)) && "pr-10",
              error && "border-red-500 focus:ring-red-500 dark:border-red-500",
              className
            )}
            {...props}
          />
          {isPasswordType && showPasswordToggle ? (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-md"
              tabIndex={-1}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 text-slate-400 dark:text-slate-500">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
