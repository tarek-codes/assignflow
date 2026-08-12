"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md p-8 text-center space-y-4 shadow-xl">
        <div className="p-4 bg-red-50 dark:bg-red-950/60 rounded-full w-fit mx-auto text-red-600 dark:text-red-400">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">403 - Access Denied</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You do not have permission to access this page or resource. If you believe this is an error, please contact your academic administrator.
        </p>
        <div className="pt-2">
          <Link href={ROUTES.DASHBOARD}>
            <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
