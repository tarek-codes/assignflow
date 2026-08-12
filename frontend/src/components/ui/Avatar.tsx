import React from "react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isCurrentUser?: boolean;
}

export function Avatar({ name, src, size = "md", isCurrentUser, className, ...props }: AvatarProps) {
  const { user } = useAuth();
  const avatarSrc = src || (isCurrentUser ? user?.avatarUrl : undefined);

  const getInitials = (n: string) => {
    if (!n) return "?";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-20 h-20 text-2xl font-bold font-mono",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold overflow-hidden shrink-0 border border-blue-200 dark:border-blue-800",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
