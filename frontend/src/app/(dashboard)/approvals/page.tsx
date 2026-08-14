"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ROLES } from "@/constants/roles";
import { RoleGuard } from "@/components/common/RoleGuard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { UserCheck, Trash2, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/services/apiClient";
import { Pagination } from "@/components/common/Pagination";
import { useLanguage } from "@/context/LanguageContext";

export default function ApprovalsPage() {
  const { showToast } = useToast();
  const { language, t, translateSubject, translateClass, translateUserName, toBanglaDigits } = useLanguage();
  const isBn = language === "bn";
  const [registrationRequests, setRegistrationRequests] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<"Teacher" | "Student">("Teacher");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("registration_requests") || "[]");
      if (saved.length === 0) {
        const sampleRequests = [
          {
            id: "req_seed_1",
            fullName: "Dr. Robert Vance",
            email: "robert.vance@school.edu",
            role: "Teacher",
            subjectSpecialization: "Higher Mathematics",
            notes: "Joining as Senior Math Lecturer for Class 11-12",
            requestedAtUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "Pending",
          },
          {
            id: "req_seed_2",
            fullName: "Emily Watson",
            email: "emily.watson@student.edu",
            role: "Student",
            classLevel: 10,
            notes: "Transfer student requesting access to Physics classroom",
            requestedAtUtc: new Date(Date.now() - 3600000 * 5).toISOString(),
            status: "Pending",
          },
        ];
        localStorage.setItem("registration_requests", JSON.stringify(sampleRequests));
        setRegistrationRequests(sampleRequests);
      } else {
        setRegistrationRequests(saved);
      }
    }
  }, []);

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRequests = useMemo(
    () => registrationRequests.filter((r) => r.role === activeRoleTab),
    [registrationRequests, activeRoleTab]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeRoleTab]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRequests = filteredRequests.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const persistRequests = (updated: any[]) => {
    setRegistrationRequests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("registration_requests", JSON.stringify(updated));
    }
  };

  const handleApproveRequest = async (req: any) => {
    setApprovingId(req.id);
    try {
      const nameParts = (req.fullName || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || (req.role === "Teacher" ? "Teacher" : "Student");
      const initialPassword = req.password || "Password123!";
      const phone = req.phone || req.phoneNumber || "+880 1700-000000";

      if (req.role === "Teacher") {
        // Build the canonical taught-subject list from the registration request.
        // Register page stores taughtSubjects (array) and subjectSpecialization (csv string).
        const taughtSubjects: string[] = Array.isArray(req.taughtSubjects) && req.taughtSubjects.length > 0
          ? req.taughtSubjects
          : req.subjectSpecialization
            ? req.subjectSpecialization.split(",").map((s: string) => s.trim()).filter(Boolean)
            : ["General Studies"];

        await apiClient.post("/teachers", {
          firstName,
          lastName,
          email: req.email,
          phone,
          gender: req.gender || "Male",
          password: initialPassword,
          designation: "Lecturer",
          taughtSubjects,
          subjectIds: [],
        });
      } else {
        await apiClient.post("/students", {
          firstName,
          lastName,
          email: req.email,
          phone,
          gender: req.gender || "Male",
          password: initialPassword,
          studentNumber: "BD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 8999),
          classLevel: req.classLevel || 9,
        });
      }

      const updated = registrationRequests.map((r) =>
        r.id === req.id ? { ...r, status: "Approved" } : r
      );
      persistRequests(updated);

      // Notify other views (e.g. Manage Classes) that the teacher roster changed
      // so they can reload fresh data instead of showing a stale cached list.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("teacher-roster-changed"));
      }

      showToast(`${req.role} account approved & created successfully.`, "success");
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.errors?.[0];
      showToast(backendMsg || `Could not approve ${req.role}. Please try again.`, "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteRequest = (id: string) => {
    persistRequests(registrationRequests.filter((r) => r.id !== id));
    showToast("Record deleted.", "info");
  };

  const teacherPendingCount = useMemo(
    () => registrationRequests.filter((r) => r.role === "Teacher" && r.status === "Pending").length,
    [registrationRequests]
  );

  const studentPendingCount = useMemo(
    () => registrationRequests.filter((r) => r.role === "Student" && r.status === "Pending").length,
    [registrationRequests]
  );

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <div className="space-y-6 pt-[1.75cm]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {isBn ? "অ্যাকাউন্ট অনুমোদন" : "Account Approvals"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? "ব্যবহারকারীর রেজিস্ট্রেশন আবেদনসমূহ পর্যালোচনা করুন এবং প্লাটফর্ম অ্যাক্সেস অনুমোদন করুন"
                : "Review user registration applications and authorize platform access credentials"}
            </p>
          </div>

          {/* TEACHER vs STUDENT TAB SWITCHER */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setActiveRoleTab("Teacher")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRoleTab === "Teacher"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>{isBn ? "শিক্ষক আবেদন" : "Teacher Applications"}</span>
              {teacherPendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">
                  {toBanglaDigits(teacherPendingCount)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveRoleTab("Student")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRoleTab === "Student"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>{isBn ? "শিক্ষার্থী আবেদন" : "Student Applications"}</span>
              {studentPendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                  {toBanglaDigits(studentPendingCount)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn
                  ? (activeRoleTab === "Teacher" ? "শিক্ষক রেজিস্ট্রেশন কিউ" : "শিক্ষার্থী রেজিস্ট্রেশন কিউ")
                  : (activeRoleTab === "Teacher" ? "Teacher Registration Queue" : "Student Registration Queue")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? (activeRoleTab === "Teacher"
                      ? "বিষয় যাচাইকরণের জন্য অপেক্ষমান শিক্ষক অ্যাকাউন্ট আবেদনসমূহ"
                      : "শ্রেণী নির্ধারণের জন্য অপেক্ষমান শিক্ষার্থী অ্যাকাউন্ট আবেদনসমূহ")
                  : (activeRoleTab === "Teacher"
                      ? "Pending educator account creation requests requiring subject verification"
                      : "Pending student account creation requests requiring class placement")}
              </p>
            </div>
            <Badge variant={activeRoleTab === "Teacher" ? "info" : "success"} size="sm">
              {isBn
                ? `${toBanglaDigits(activeRoleTab === "Teacher" ? teacherPendingCount : studentPendingCount)} টি পর্যালোচনা অপেক্ষমান`
                : `${activeRoleTab === "Teacher" ? teacherPendingCount : studentPendingCount} Pending Review`}
            </Badge>
          </div>

          {filteredRequests.length === 0 ? (
            <EmptyState
              title={`No ${activeRoleTab.toLowerCase()} registration requests`}
              description={`There are currently no ${activeRoleTab.toLowerCase()} account creation requests queued for review.`}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBn ? "আবেদনকারী" : "Applicant"}</TableHead>
                    <TableHead>{isBn ? "বিষয় / শ্রেণী" : "Subjects"}</TableHead>
                    <TableHead>{isBn ? "নোট" : "Notes"}</TableHead>
                    <TableHead>{isBn ? "স্ট্যাটাস" : "Status"}</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {translateUserName(req.fullName)}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{req.email}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {req.role === "Student"
                          ? translateClass(req.classLevel || 9)
                          : translateSubject(req.subjectSpecialization || "General Studies")}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                        {req.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          size="sm"
                          variant={
                            req.status === "Approved"
                              ? "success"
                              : req.status === "Declined"
                              ? "error"
                              : "warning"
                        }>
                          {isBn
                            ? (req.status === "Approved" ? "অনুমোদিত" : req.status === "Declined" ? "বাতিল" : "অপেক্ষমান")
                            : req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="primary"
                              isLoading={approvingId === req.id}
                              onClick={() => handleApproveRequest(req)}
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                              {isBn ? "অনুমোদন করুন" : "Approve"}
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title={isBn ? "মুছে ফেলুন" : "Delete record"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredRequests.length}
            className="pt-3 border-t border-slate-100 dark:border-slate-800"
          />
        </div>
      </div>
    </RoleGuard>
  );
}
