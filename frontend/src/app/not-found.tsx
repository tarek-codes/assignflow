"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md p-8 text-center space-y-4 shadow-xl">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/60 rounded-full w-fit mx-auto text-blue-600 dark:text-blue-400">
          <FileQuestion className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The page or assignment record you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link href={ROUTES.DASHBOARD}>
            <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>Return Home</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
