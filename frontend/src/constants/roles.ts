export const ROLES = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
