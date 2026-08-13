import React, { useMemo, useState } from "react";
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

/**
 * Generates a deterministic Open Peeps SVG avatar URL based on name and gender.
 */
export function getGenderAvatarUri(name: string, gender?: string): string {
  const g = (gender || "").toLowerCase();
  const isFemale = g === "female";
  const seed = `${isFemale ? "female_peep" : "male_peep"}_${name || "user"}`;
  const facialHair = isFemale ? 0 : 30;

  // Use DiceBear API Endpoint for Open Peeps
  return `https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(seed)}&facialHairProbability=${facialHair}&maskProbability=0&backgroundColor=transparent`;
}

/**
 * Generates a local fallback SVG avatar data URI using @dicebear/core and openPeeps
 */
export function getLocalGenderAvatarUri(name: string, gender?: string): string {
  const g = (gender || "").toLowerCase();
  const isFemale = g === "female";
  const seed = `${isFemale ? "female_peep" : "male_peep"}_${name || "user"}`;

  try {
    const avatar = createAvatar(openPeeps, {
      seed,
      facialHairProbability: isFemale ? 0 : 30,
      maskProbability: 0,
      backgroundColor: ["transparent"],
    });
    return avatar.toDataUri();
  } catch (err) {
    console.error("Failed to generate avatar:", err);
    return "";
  }
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  gender?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isCurrentUser?: boolean;
}

export function Avatar({ name, src, gender, size = "md", isCurrentUser, className, ...props }: AvatarProps) {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);

  // Resolve avatar source: passed src > current user's avatarUrl > undefined
  const avatarSrc = src || (isCurrentUser ? user?.avatarUrl : undefined);

  // Get gender from user context if available
  const resolvedGender = gender || (isCurrentUser ? user?.gender : undefined);

  const primaryApiUri = useMemo(() => {
    if (avatarSrc) return null;
    return getGenderAvatarUri(name || user?.fullName || "User", resolvedGender);
  }, [avatarSrc, name, user?.fullName, resolvedGender]);

  const fallbackDataUri = useMemo(() => {
    if (avatarSrc || !hasError) return null;
    return getLocalGenderAvatarUri(name || user?.fullName || "User", resolvedGender);
  }, [avatarSrc, hasError, name, user?.fullName, resolvedGender]);

  const activeSrc = avatarSrc || (hasError ? fallbackDataUri : primaryApiUri);

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-20 h-20 text-2xl font-bold",
    "2xl": "w-28 h-28 sm:w-36 sm:h-36 text-3xl font-bold",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {activeSrc ? (
        <img
          src={activeSrc}
          alt={name || "User Avatar"}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover p-0.5 scale-105 transition-transform"
        />
      ) : (
        <span className="font-semibold uppercase text-slate-600 dark:text-slate-300">
          {(name || "U").slice(0, 2)}
        </span>
      )}
    </div>
  );
}
