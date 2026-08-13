"use client";

import React from "react";
import { BookOpenCheck, CheckCircle2, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();

  const roleFeatures = [
    { icon: ShieldCheck, title: t("authRoleAdminTitle") || "Admin", description: t("authSidebarAdminDesc") },
    { icon: GraduationCap, title: t("navTeachers") || "Teachers", description: t("authSidebarTeacherDesc") },
    { icon: Users, title: t("navStudents") || "Students", description: t("authSidebarStudentDesc") },
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-10 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px]">
      {/* Top right language toggle */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 flex items-center gap-2">
        <LanguageToggle variant="pill" />
      </div>

      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[36px_36px] mask-[linear-gradient(to_bottom,black,transparent_80%)]" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/25">
              <BookOpenCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="font-sans-brand text-base font-black tracking-tight">AssignFlow</p>
              <p className="text-xs text-slate-400">{t("authAcademicWorkspace")}</p>
            </div>
          </div>

          <div className="relative max-w-lg py-8">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              {t("authCreateManageSubmit")}
              <span className="mt-1.5 block text-blue-400">{t("authAllInOnePlace")}.</span>
            </h2>

            <div className="mt-8 grid gap-2.5">
              {roleFeatures.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                  <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-500">{t("authFooterSecurityNote")}</p>
        </section>

        <section className="relative flex items-center justify-center p-8 sm:p-10 lg:p-12">
          <div className="absolute left-6 top-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">AssignFlow</span>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
