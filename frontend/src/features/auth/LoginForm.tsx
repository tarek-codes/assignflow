"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants/routes";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMaintenanceActive = typeof window !== "undefined" && localStorage.getItem("system_maintenance_mode") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const response = await login(data);

      const isMaint = typeof window !== "undefined" && localStorage.getItem("system_maintenance_mode") === "true";
      if (isMaint && response.role !== "Admin") {
        await logout();
        const maintMsg = "System Maintenance in Progress: Student and Teacher access is temporarily suspended during system maintenance. Only administrators can sign in at this time.";
        setErrorMsg(maintMsg);
        showToast("System Maintenance Mode active. Access restricted.", "error");
        return;
      }

      let targetRoute = ROUTES.DASHBOARD;
      if (typeof window !== "undefined" && response?.userId) {
        const savedView = localStorage.getItem(`settings_${response.userId}_defaultView`);
        if (savedView === "manage") targetRoute = "/admin/manage" as any;
        else if (savedView === "assignments") targetRoute = "/assignments" as any;
        else if (savedView === "classrooms") targetRoute = "/teacher/classrooms" as any;
        else if (savedView === "calendar") targetRoute = "/student/calendar" as any;
        else if (savedView === "grades") targetRoute = "/student/grades" as any;
      }
      router.push(targetRoute);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid credentials. Please try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("brandName")} Portal
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t("authSignIn")}
        </h1>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
          {t("authSignInSubtitle")}
        </p>
      </div>

      {isMaintenanceActive && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200 shadow-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-extrabold text-sm text-amber-950 dark:text-amber-100">System Maintenance Mode Active</p>
            <p className="mt-1 font-medium text-amber-800 dark:text-amber-300">
              The portal is currently undergoing scheduled maintenance. Student and teacher logins are temporarily suspended. Only administrators can log in.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
        <Input
          label={t("authEmail")}
          type="email"
          autoComplete="email"
          placeholder="you@school.edu"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-900"
          {...register("email")}
        />

        <Input
          label={t("authPassword")}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-900"
          {...register("password")}
        />

        <Button
          type="submit"
          size="lg"
          className="h-11.5 w-full rounded-xl shadow-md shadow-blue-600/20 mt-1"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {isSubmitting ? t("authSigningIn") : t("authSignIn")}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("authNoAccount")}{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            {t("authRegisterNow")}
          </Link>
        </p>
      </div>
    </div>
  );
}
