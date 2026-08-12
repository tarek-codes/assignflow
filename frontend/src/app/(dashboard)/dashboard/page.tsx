"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminDashboardView } from "@/features/dashboard/AdminDashboardView";
import { TeacherDashboardView } from "@/features/dashboard/TeacherDashboardView";
import { StudentDashboardView } from "@/features/dashboard/StudentDashboardView";
import { ROLES } from "@/constants/roles";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === ROLES.ADMIN) return <AdminDashboardView />;
  if (user?.role === ROLES.TEACHER) return <TeacherDashboardView />;
  if (user?.role === ROLES.STUDENT) return <StudentDashboardView />;

  return <AdminDashboardView />;
}
