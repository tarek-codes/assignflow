"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Inbox,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { assignmentService } from "@/services/assignmentService";
import { submissionService } from "@/services/submissionService";
import { classService } from "@/services/classService";
import { userService, UserListItem, TeacherListItem, StudentListItem } from "@/services/userService";
import { useCachedData } from "@/hooks/useCachedData";
import { AssignmentListItem } from "@/types/assignment";
import { SubmissionListItem } from "@/types/submission";
import { PagedResult } from "@/types/api";
import {
  AssignmentsBarChart,
  SubmissionPieChart,
} from "./DashboardCharts";
import { RecentActivityCard } from "./RecentActivityCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatFullDateTime } from "@/utils/formatters";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FullscreenToggle } from "@/components/ui/FullscreenToggle";
import { getCurriculumSubjectsForClass } from "@/utils/classLevelConfig";
import { Pagination } from "@/components/common/Pagination";

type ActiveModalType = "users" | "teachers" | "students" | "assignments" | "submissions" | null;

export function AdminDashboardView() {
  const { user } = useAuth();
  const { t, language, translateSubject, translateClass, translateUserName, toBanglaDigits } = useLanguage();
  const isBn = language === "bn";
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [barClassFilter, setBarClassFilter] = useState("all");
  const [barSubjectFilter, setBarSubjectFilter] = useState("all");
  const [pieClassFilter, setPieClassFilter] = useState("all");
  const [pieSubjectFilter, setPieSubjectFilter] = useState("all");

  const needsAssignmentDetails =
    barClassFilter !== "all" || barSubjectFilter !== "all" || activeModal === "assignments";
  const needsSubmissionDetails =
    pieClassFilter !== "all" || pieSubjectFilter !== "all" || activeModal === "submissions";

  const { data, isLoading, error, refetch: refetchDashboard } = useCachedData("dashboard:admin", () => dashboardService.getAdminDashboard());
  const { data: summaryData } = useCachedData(
    "admin:summary_details",
    async () => {
      const [assignments, submissions] = await Promise.all([
        assignmentService.getAllAssignments(),
        submissionService.getAllSubmissionsFull(),
      ]);
      return { assignments, submissions };
    }
  );

  const rawAssignments = summaryData?.assignments || [];
  const rawSubmissions = summaryData?.submissions || [];
  const { data: allUsers = [], isLoading: usersPending } = useCachedData<UserListItem[]>(
    "users:all",
    () => userService.getAllUsers()
  );
  const { data: allTeachers = [], isLoading: teachersPending } = useCachedData<TeacherListItem[]>(
    "teachers:all",
    () => userService.getAllTeachers()
  );
  const { data: allStudents = [], isLoading: studentsPending } = useCachedData<StudentListItem[]>(
    "students:all",
    () => userService.getAllStudents()
  );

  // Proactive background prefetching for tabs (Classes, Assignments, Submissions) right after dashboard loads
  useEffect(() => {
    if (!isLoading && data && user) {
      const teacherCacheKey = `assignments:full:list:${user.id}:${user.role}`;
      const submissionCacheKey = `submissions:full:list:${user.id}:${user.role}`;

      // Prefetch Assignments, Submissions, and Classes in low priority background queue
      const timer = setTimeout(() => {
        assignmentService.getAllAssignments().catch(() => {});
        submissionService.getAllSubmissionsFull().catch(() => {});
        classService.getAllClasses().catch(() => {});
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, data, user]);

  const [modalPage, setModalPage] = useState(1);

  // Search, Filter & Sorting state for modals
  const [modalSearch, setModalSearch] = useState("");
  const [modalFilter, setModalFilter] = useState("all");
  const [modalGenderFilter, setModalGenderFilter] = useState("all");
  const [modalSubjectFilter, setModalSubjectFilter] = useState("all");
  const [modalSortBy, setModalSortBy] = useState("default");
  const [modalSortOrder, setModalSortOrder] = useState<"asc" | "desc">("asc");

  const usersData = useMemo<PagedResult<UserListItem> | null>(() => {
    if (!allUsers.length) return null;
    return {
      items: allUsers,
      pageNumber: 1,
      pageSize: allUsers.length,
      totalCount: allUsers.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }, [allUsers]);

  const teachersData = useMemo<PagedResult<TeacherListItem> | null>(() => {
    if (!allTeachers.length) return null;
    return {
      items: allTeachers,
      pageNumber: 1,
      pageSize: allTeachers.length,
      totalCount: allTeachers.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }, [allTeachers]);

  const studentsData = useMemo<PagedResult<StudentListItem> | null>(() => {
    if (!allStudents.length) return null;
    return {
      items: allStudents,
      pageNumber: 1,
      pageSize: allStudents.length,
      totalCount: allStudents.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }, [allStudents]);

  const assignmentsData = useMemo<PagedResult<AssignmentListItem> | null>(() => {
    if (!rawAssignments.length) return null;
    return {
      items: rawAssignments,
      pageNumber: 1,
      pageSize: rawAssignments.length,
      totalCount: rawAssignments.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }, [rawAssignments]);

  const submissionsData = useMemo<PagedResult<SubmissionListItem> | null>(() => {
    if (!rawSubmissions.length) return null;
    return {
      items: rawSubmissions,
      pageNumber: 1,
      pageSize: rawSubmissions.length,
      totalCount: rawSubmissions.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }, [rawSubmissions]);

  const modalLoading =
    (activeModal === "users" && usersPending) ||
    (activeModal === "teachers" && teachersPending) ||
    (activeModal === "students" && studentsPending);

  // Helper for flexible subject matching (e.g. "Bangla" <-> "Bengali Literature", "Math" <-> "General Mathematics")
  const isSameSubject = (subA: string, subB: string): boolean => {
    if (!subA || !subB) return false;
    if (subB === "all" || subA === "all") return true;
    const a = subA.toLowerCase().trim();
    const b = subB.toLowerCase().trim();
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;

    if ((a.includes("bangla") || a.includes("bengali")) && (b.includes("bangla") || b.includes("bengali"))) return true;
    if (a.includes("english") && b.includes("english")) return true;
    if (a.includes("math") && b.includes("math")) return true;
    if ((a.includes("ict") || a.includes("digital") || a.includes("information")) && (b.includes("ict") || b.includes("digital") || b.includes("information"))) return true;
    if (a.includes("physics") && b.includes("physics")) return true;
    if (a.includes("chemistry") && b.includes("chemistry")) return true;
    if (a.includes("biology") && b.includes("biology")) return true;

    return false;
  };

  // Available subjects for Bar Chart card
  const barAvailableSubjects = useMemo(() => {
    if (barClassFilter !== "all") {
      const classLevel = Number(barClassFilter);
      const fromAssignments = rawAssignments
        .filter((a) => Number(a.classLevel || 6) === classLevel)
        .map((a) => a.subjectName)
        .filter(Boolean);
      const curriculum = getCurriculumSubjectsForClass(classLevel);
      const set = new Set([...fromAssignments, ...curriculum]);
      return Array.from(set).sort();
    }

    const set = new Set<string>();
    rawAssignments.forEach((a) => {
      if (a.subjectName) set.add(a.subjectName);
    });
    return Array.from(set).sort();
  }, [barClassFilter, rawAssignments]);

  // Available subjects for Pie Chart card
  const pieAvailableSubjects = useMemo(() => {
    const extractSub = (s: any) =>
      s.subjectName ||
      (s.classSubject?.includes(" - ") ? s.classSubject.split(" - ")[1]?.trim() : "") ||
      (s.assignmentTitle?.includes(":") ? s.assignmentTitle.split(":")[0]?.trim() : "");

    const extractClass = (s: any) =>
      s.classLevel || (s.classSubject ? parseInt(s.classSubject.match(/\d+/)?.[0] || "6", 10) : 6);

    if (pieClassFilter !== "all") {
      const classLevel = Number(pieClassFilter);
      const fromSubmissions = rawSubmissions
        .filter((s) => Number(extractClass(s)) === classLevel)
        .map((s) => extractSub(s))
        .filter(Boolean);
      const curriculum = getCurriculumSubjectsForClass(classLevel);
      const set = new Set([...fromSubmissions, ...curriculum]);
      return Array.from(set).sort();
    }

    const set = new Set<string>();
    rawSubmissions.forEach((s) => {
      const sub = extractSub(s);
      if (sub) set.add(sub);
    });
    return Array.from(set).sort();
  }, [pieClassFilter, rawSubmissions]);

  // Dynamic monthly assignments data for Bar Chart
  const filteredMonthlyAssignments = useMemo(() => {
    if (barClassFilter === "all" && barSubjectFilter === "all") {
      return data?.statistics?.assignmentsCreatedPerMonth || {
        "Jan 2026": 4, "Feb 2026": 8, "Mar 2026": 28,
        "Apr 2026": 32, "May 2026": 18, "Jun 2026": 20,
      };
    }

    const monthlyCounts: Record<string, number> = {};

    rawAssignments.forEach((a) => {
      const cLevel = a.classLevel || 6;
      const subName = a.subjectName || "";

      const matchClass = barClassFilter === "all" || Number(cLevel) === Number(barClassFilter);
      const matchSubject = isSameSubject(subName, barSubjectFilter);

      if (matchClass && matchSubject) {
        const date = new Date(a.createdAtUtc || a.deadlineUtc);
        const monthKey = date.toLocaleString("en-US", { month: "short" }) + " " + date.getFullYear();
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      }
    });

    return monthlyCounts;
  }, [barClassFilter, barSubjectFilter, rawAssignments, data?.statistics?.assignmentsCreatedPerMonth]);

  // Dynamic submission status distribution for Pie Chart
  const filteredSubmissionsByStatus = useMemo(() => {
    if (pieClassFilter === "all" && pieSubjectFilter === "all") {
      return data?.statistics?.submissionsByStatus || {};
    }

    const statusCounts: Record<string, number> = {
      Submitted: 0,
      Late: 0,
      NotSubmitted: 0,
      Graded: 0,
    };

    rawSubmissions.forEach((s) => {
      const cLevel =
        (s as any).classLevel || ((s as any).classSubject ? parseInt((s as any).classSubject.match(/\d+/)?.[0] || "6", 10) : 6);
      const subName =
        (s as any).subjectName ||
        ((s as any).classSubject?.includes(" - ") ? (s as any).classSubject.split(" - ")[1]?.trim() : "") ||
        ((s as any).assignmentTitle?.includes(":") ? (s as any).assignmentTitle.split(":")[0]?.trim() : "");

      const matchClass = pieClassFilter === "all" || Number(cLevel) === Number(pieClassFilter);
      const matchSubject = isSameSubject(subName, pieSubjectFilter);

      if (matchClass && matchSubject) {
        const statusStr = String(s.status || "Submitted");
        if (statusStr === "Graded") statusCounts["Graded"] += 1;
        else if (statusStr === "Late") statusCounts["Late"] += 1;
        else if (statusStr === "Missing" || statusStr === "NotSubmitted") statusCounts["NotSubmitted"] += 1;
        else statusCounts["Submitted"] += 1;
      }
    });

    return statusCounts;
  }, [pieClassFilter, pieSubjectFilter, rawSubmissions, data?.statistics?.submissionsByStatus]);

  const PAGE_SIZE = 10;

  const openModal = (type: ActiveModalType) => {
    setActiveModal(type);
    setModalPage(1);
    setModalSearch("");
    setModalFilter("all");
    setModalSortBy("default");
    setModalSortOrder("asc");
  };

  // Reset to page 1 whenever search, filter, or sorting changes
  useEffect(() => {
    setModalPage(1);
  }, [modalSearch, modalFilter, modalSortBy, modalSortOrder]);

  const handlePageChange = (p: number) => {
    setModalPage(p);
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    if (!usersData?.items) return [];
    let items = [...usersData.items].filter((u) => {
      const q = modalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const roleLower = (u.role || "").toLowerCase();
      const matchesFilter =
        modalFilter === "all" ||
        (modalFilter === "admin" && roleLower === "admin") ||
        (modalFilter === "teacher" && roleLower === "teacher") ||
        (modalFilter === "student" && roleLower === "student") ||
        (modalFilter === "active" && u.isActive) ||
        (modalFilter === "inactive" && !u.isActive);

      return matchesSearch && matchesFilter;
    });

    if (modalSortBy === "name") {
      items.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    } else if (modalSortBy === "email") {
      items.sort((a, b) => a.email.localeCompare(b.email));
    } else if (modalSortBy === "role") {
      items.sort((a, b) => a.role.localeCompare(b.role));
    }

    if (modalSortOrder === "desc") items.reverse();
    return items;
  }, [usersData?.items, modalSearch, modalFilter, modalSortBy, modalSortOrder]);

  // Filtered & Sorted Teachers
  const filteredTeachers = useMemo(() => {
    if (!teachersData?.items) return [];
    let items = [...teachersData.items].filter((t) => {
      const q = modalSearch.toLowerCase().trim();
      const name = t.fullName || `${t.firstName || ""} ${t.lastName || ""}`.trim();
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q));

      const matchesGender =
        modalGenderFilter === "all" ||
        (modalGenderFilter === "male" && (t.gender || "Male").toLowerCase() === "male") ||
        (modalGenderFilter === "female" && (t.gender || "").toLowerCase() === "female");

      const matchesSubject =
        modalSubjectFilter === "all" ||
        (t.taughtSubjects && t.taughtSubjects.some((sub) => sub.toLowerCase().includes(modalSubjectFilter.toLowerCase()))) ||
        (t.designation && t.designation.toLowerCase().includes(modalSubjectFilter.toLowerCase()));

      return matchesSearch && matchesGender && matchesSubject;
    });

    if (modalSortBy === "name") {
      items.sort((a, b) => (a.fullName || `${a.firstName} ${a.lastName}`).localeCompare(b.fullName || `${b.firstName} ${b.lastName}`));
    } else if (modalSortBy === "email") {
      items.sort((a, b) => a.email.localeCompare(b.email));
    } else if (modalSortBy === "designation") {
      items.sort((a, b) => (a.designation || "").localeCompare(b.designation || ""));
    }

    if (modalSortOrder === "desc") items.reverse();
    return items;
  }, [teachersData?.items, modalSearch, modalGenderFilter, modalSubjectFilter, modalSortBy, modalSortOrder]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    if (!studentsData?.items) return [];
    let items = [...studentsData.items].filter((s) => {
      const q = modalSearch.toLowerCase().trim();
      const name = s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim();
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.studentNumber && s.studentNumber.toLowerCase().includes(q));

      const matchesFilter =
        modalFilter === "all" ||
        (modalFilter === "male" && (s.gender || "Male").toLowerCase() === "male") ||
        (modalFilter === "female" && (s.gender || "").toLowerCase() === "female") ||
        (modalFilter.startsWith("class_") && s.classLevel === parseInt(modalFilter.replace("class_", "")));

      return matchesSearch && matchesFilter;
    });

    if (modalSortBy === "name") {
      items.sort((a, b) => (a.fullName || `${a.firstName} ${a.lastName}`).localeCompare(b.fullName || `${b.firstName} ${b.lastName}`));
    } else if (modalSortBy === "email") {
      items.sort((a, b) => a.email.localeCompare(b.email));
    } else if (modalSortBy === "class") {
      items.sort((a, b) => (a.classLevel || 0) - (b.classLevel || 0));
    } else if (modalSortBy === "studentNumber") {
      items.sort((a, b) => (a.studentNumber || "").localeCompare(b.studentNumber || ""));
    }

    if (modalSortOrder === "desc") items.reverse();
    return items;
  }, [studentsData?.items, modalSearch, modalFilter, modalSortBy, modalSortOrder]);

  // Filtered & Sorted Assignments
  const filteredAssignments = useMemo(() => {
    if (!assignmentsData?.items) return [];
    let items = [...assignmentsData.items].filter((a) => {
      const q = modalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.subjectName && a.subjectName.toLowerCase().includes(q)) ||
        (a.teacherName && a.teacherName.toLowerCase().includes(q));

      const statusLower = (a.status || "").toLowerCase();
      const matchesFilter =
        modalFilter === "all" ||
        (modalFilter === "published" && statusLower === "published") ||
        (modalFilter === "draft" && statusLower === "draft") ||
        (modalFilter.startsWith("class_") && a.classLevel === parseInt(modalFilter.replace("class_", "")));

      return matchesSearch && matchesFilter;
    });

    if (modalSortBy === "title") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (modalSortBy === "date") {
      items.sort((a, b) => new Date(b.createdAtUtc || 0).getTime() - new Date(a.createdAtUtc || 0).getTime());
    } else if (modalSortBy === "class") {
      items.sort((a, b) => a.classLevel - b.classLevel);
    } else if (modalSortBy === "marks") {
      items.sort((a, b) => b.maxMarks - a.maxMarks);
    }

    if (modalSortOrder === "desc") items.reverse();
    return items;
  }, [assignmentsData?.items, modalSearch, modalFilter, modalSortBy, modalSortOrder]);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    if (!submissionsData?.items) return [];
    let items = [...submissionsData.items].filter((sub) => {
      const q = modalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (sub.assignmentTitle && sub.assignmentTitle.toLowerCase().includes(q)) ||
        (sub.studentName && sub.studentName.toLowerCase().includes(q)) ||
        (sub.studentNumber && sub.studentNumber.toLowerCase().includes(q)) ||
        (sub.classSubject && sub.classSubject.toLowerCase().includes(q));

      const statusLower = (sub.status || "").toLowerCase();
      const matchesFilter =
        modalFilter === "all" ||
        (modalFilter === "graded" && statusLower === "graded") ||
        (modalFilter === "submitted" && (statusLower === "submitted" || statusLower === "underreview")) ||
        (modalFilter === "late" && statusLower === "late") ||
        ((modalFilter === "missing" || modalFilter === "notsubmitted") && (statusLower === "missing" || statusLower === "notsubmitted"));

      return matchesSearch && matchesFilter;
    });

    if (modalSortBy === "title") {
      items.sort((a, b) => a.assignmentTitle.localeCompare(b.assignmentTitle));
    } else if (modalSortBy === "date") {
      items.sort((a, b) => new Date(b.submittedAtUtc || 0).getTime() - new Date(a.submittedAtUtc || 0).getTime());
    } else if (modalSortBy === "student") {
      items.sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
    } else if (modalSortBy === "grade") {
      items.sort((a, b) => (b.marks || 0) - (a.marks || 0));
    }

    if (modalSortOrder === "desc") items.reverse();
    return items;
  }, [submissionsData?.items, modalSearch, modalFilter, modalSortBy, modalSortOrder]);

  // Get active filtered list
  const activeFilteredList = useMemo(() => {
    if (activeModal === "users") return filteredUsers;
    if (activeModal === "teachers") return filteredTeachers;
    if (activeModal === "students") return filteredStudents;
    if (activeModal === "assignments") return filteredAssignments;
    if (activeModal === "submissions") return filteredSubmissions;
    return [];
  }, [activeModal, filteredUsers, filteredTeachers, filteredStudents, filteredAssignments, filteredSubmissions]);

  // Calculate dynamic pagination based strictly on filtered items
  const totalPages = Math.max(1, Math.ceil(activeFilteredList.length / PAGE_SIZE));
  const currentPage = Math.min(modalPage, totalPages);

  // Slice paginated items for current page (exactly 10 records per page)
  const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredUsers, currentPage]);
  const paginatedTeachers = useMemo(() => filteredTeachers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredTeachers, currentPage]);
  const paginatedStudents = useMemo(() => filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredStudents, currentPage]);
  const paginatedAssignments = useMemo(() => filteredAssignments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredAssignments, currentPage]);
  const paginatedSubmissions = useMemo(() => filteredSubmissions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredSubmissions, currentPage]);

  const modalTitle: Record<string, string> = {
    users: isBn ? "মোট নিবন্ধিত ব্যবহারকারী" : "Total Registered Users",
    teachers: isBn ? "বরাদ্দকৃত শিক্ষক ডিরেক্টরি" : "Assigned Teachers Directory",
    students: isBn ? "নিবন্ধিত শিক্ষার্থী ডিরেক্টরি" : "Enrolled Students Directory",
    assignments: isBn ? "সকল অ্যাসাইনমেন্টের রিপোজিটরি" : "All Assignments Repository",
    submissions: isBn ? "সিস্টেম সাবমিশন ওভারভিউ" : "System-Wide Submissions Overview",
  };

  if (isLoading) return <LoadingSpinner fullScreen label={isBn ? "অ্যাডমিন অ্যানালিটিক্স লোড হচ্ছে..." : "Loading admin analytics..."} />;
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{error?.message || (isBn ? "অ্যাডমিন ড্যাশবোর্ড লোড করতে ব্যর্থ হয়েছে।" : "Failed to load admin dashboard.")}</p>
      <button
        onClick={() => refetchDashboard()}
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        {isBn ? "আবার চেষ্টা করুন" : "Try Again"}
      </button>
    </div>
  );


  const monthlyAssignments = data.statistics.assignmentsCreatedPerMonth || {
    "Jan 2026": 4, "Feb 2026": 8, "Mar 2026": 28,
    "Apr 2026": 32, "May 2026": 18, "Jun 2026": 20,
    "Jul 2026": 25, "Aug 2026": 30,
  };

  const stats = [
    { label: t("lblTotalUsers"), value: toBanglaDigits(data.totalUsers), key: "users" as const, icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300", textColor: "text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300", actionMsg: isBn ? "ব্যবহারকারী দেখুন" : "View Users" },
    { label: t("navTeachers"), value: toBanglaDigits(data.totalTeachers), key: "teachers" as const, icon: GraduationCap, color: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300", textColor: "text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300", actionMsg: isBn ? "শিক্ষকগণ দেখুন" : "View Teachers" },
    { label: t("navStudents"), value: toBanglaDigits(data.totalStudents), key: "students" as const, icon: BookOpen, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-300", textColor: "text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300", actionMsg: isBn ? "শিক্ষার্থীবৃন্দ দেখুন" : "View Students" },
    { label: t("lblTotalAssignments"), value: toBanglaDigits(data.totalAssignments), key: "assignments" as const, icon: ClipboardList, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300", textColor: "text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300", actionMsg: isBn ? "অ্যাসাইনমেন্টসমূহ দেখুন" : "View Assignments" },
    { label: t("lblTotalSubmissions"), value: toBanglaDigits(data.totalSubmissions), key: "submissions" as const, icon: Inbox, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300", textColor: "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300", actionMsg: isBn ? "সাবমিশনসমূহ দেখুন" : "View Submissions" },
  ];

  const firstName = user?.fullName?.split(" ")[0] || "Admin";

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const formattedDateTime = formatFullDateTime(new Date(), language);

  return (
    <div className="pt-3 sm:pt-4 space-y-4">
      {/* ─── HEADER ─── */}
      <section className="relative overflow-hidden rounded-2xl bg-blue-600 px-6 py-5 text-white shadow-lg shadow-blue-600/10 sm:px-7 sm:py-6">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {language === "bn" ? `হ্যালো, ${translateUserName(firstName)}` : `${greeting}, ${firstName}`}
            </h1>
            <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-100">
              <Calendar className="h-4 w-4 text-blue-200 shrink-0" />
              <span>{formattedDateTime}</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm font-medium text-blue-100/90 max-w-xl">
              {t("adminBannerDesc")}
            </p>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/60 border border-white/25 dark:border-slate-800 px-4.5 py-2.5 backdrop-blur-xl self-center shadow-lg shadow-black/5 shrink-0 transition-all hover:bg-white/15">
            <div className="flex items-center justify-center ring-2 ring-white/50 dark:ring-blue-400/50 rounded-full shadow-sm">
              <Avatar name={user?.fullName || "Admin"} src={user?.avatarUrl} isCurrentUser size="sm" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="text-sm font-extrabold text-white tracking-tight leading-none">
                {language === "bn" ? translateUserName(user?.fullName || "System Admin") : (user?.fullName || "System Admin")}
              </span>
              {user?.fullName && user.fullName.toLowerCase() !== "system admin" && (
                <span className="text-[11px] font-semibold text-blue-100 dark:text-blue-300 capitalize mt-1">
                  {String(user?.role || "").includes("Admin") ? t("roleSystemAdmin") : (user?.role || t("roleAdmin"))}
                </span>
              )}
            </div>
            <div className="h-7 w-px bg-white/20 dark:bg-slate-700/80 mx-0.5 self-center" />
            <div className="flex items-center justify-center gap-2">
              <ThemeToggle variant="banner" />
              <FullscreenToggle />
            </div>
          </div>

        </div>
      </section>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.key}
              onClick={() => openModal(stat.key)}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-4.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none dark:border-slate-800 dark:bg-slate-900 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`flex h-9.5 w-9.5 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`inline-flex items-center gap-1 text-[11px] font-extrabold ${stat.textColor} bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 px-2 py-1 rounded-lg transition-all shadow-2xs group-hover:border-current`}>
                  <span>{stat.actionMsg}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </button>
          );
        })}
      </div>

      {/* ─── DASHBOARD GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <AssignmentsBarChart
            data={filteredMonthlyAssignments}
            classFilter={barClassFilter}
            onClassChange={(cls) => {
              setBarClassFilter(cls);
              setBarSubjectFilter("all");
            }}
            subjectFilter={barSubjectFilter}
            onSubjectChange={(subj) => setBarSubjectFilter(subj)}
            availableSubjects={barAvailableSubjects}
          />
        </div>
        <div className="lg:col-span-5">
          <SubmissionPieChart
            data={filteredSubmissionsByStatus}
            classFilter={pieClassFilter}
            onClassChange={(cls) => {
              setPieClassFilter(cls);
              setPieSubjectFilter("all");
            }}
            subjectFilter={pieSubjectFilter}
            onSubjectChange={(subj) => setPieSubjectFilter(subj)}
            availableSubjects={pieAvailableSubjects}
          />
        </div>
        <div className="lg:col-span-12">
          <RecentActivityCard activities={data.latestActivities} />
        </div>
      </div>

      {/* ─── DETAIL MODAL ─── */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal ? modalTitle[activeModal] : ""}
        maxWidth="7xl"
        headerControls={
          <div className="flex items-center gap-2.5 w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder={
                  isBn
                    ? `নাম, শিরোনাম বা ইমেইল দিয়ে খুঁজুন...`
                    : `Search ${activeModal || "items"} by name, title, email...`
                }
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
              />
            </div>

            {/* Filter Dropdowns */}
            {activeModal === "teachers" ? (
              <>
                {/* Teacher Gender Filter */}
                <div className="flex items-center gap-1.5 shrink-0 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-xl px-2.5 py-1">
                  <Filter className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <select
                    value={modalGenderFilter}
                    onChange={(e) => setModalGenderFilter(e.target.value)}
                    className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
                  >
                    <option value="all">{isBn ? "লিঙ্গ: সকল" : "Gender: All"}</option>
                    <option value="male">{isBn ? "পুরুষ (♂)" : "Male (♂)"}</option>
                    <option value="female">{isBn ? "মহিলা (♀)" : "Female (♀)"}</option>
                  </select>
                </div>

                {/* Teacher Subject Filter (All Curriculum Subjects) */}
                <div className="flex items-center gap-1.5 shrink-0 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-700 rounded-xl px-2.5 py-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <select
                    value={modalSubjectFilter}
                    onChange={(e) => setModalSubjectFilter(e.target.value)}
                    className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
                  >
                    <option value="all">{isBn ? "বিষয়: সকল" : "Subject: All"}</option>
                    <option value="Bangla">{translateSubject("Bangla")}</option>
                    <option value="English">{translateSubject("English")}</option>
                    <option value="Mathematics">{translateSubject("Mathematics")}</option>
                    <option value="Higher Mathematics">{translateSubject("Higher Mathematics")}</option>
                    <option value="Physics">{translateSubject("Physics")}</option>
                    <option value="Chemistry">{translateSubject("Chemistry")}</option>
                    <option value="Biology">{translateSubject("Biology")}</option>
                    <option value="ICT">{translateSubject("ICT")}</option>
                    <option value="Bangladesh & Global Studies">{translateSubject("Bangladesh & Global Studies")}</option>
                    <option value="Science">{translateSubject("Science")}</option>
                    <option value="Religion">{translateSubject("Religion")}</option>
                    <option value="Accounting">{translateSubject("Accounting")}</option>
                    <option value="Finance & Banking">{translateSubject("Finance & Banking")}</option>
                    <option value="Business Entrepreneurship">{translateSubject("Business Entrepreneurship")}</option>
                    <option value="Economics">{translateSubject("Economics")}</option>
                    <option value="Civics">{translateSubject("Civics")}</option>
                    <option value="Geography">{translateSubject("Geography")}</option>
                    <option value="History">{translateSubject("History")}</option>
                    <option value="General Studies">{isBn ? "সাধারণ শিক্ষা / অন্যান্য" : "General Studies / Other"}</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <select
                  value={modalFilter}
                  onChange={(e) => setModalFilter(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
                >
                  <option value="all">{isBn ? "ফিল্টার: সকল" : "Filter: All"}</option>

                  {/* USERS FILTERS */}
                  {activeModal === "users" && (
                    <optgroup label={isBn ? "ব্যবহারকারীর ভূমিকা ও স্থিতি" : "User Roles & Status"}>
                      <option value="admin">{isBn ? "অ্যাডমিন ভূমিকা" : "Admin Role"}</option>
                      <option value="teacher">{isBn ? "শিক্ষক ভূমিকা" : "Teacher Role"}</option>
                      <option value="student">{isBn ? "শিক্ষার্থী ভূমিকা" : "Student Role"}</option>
                      <option value="active">{isBn ? "শুধুমাত্র সক্রিয়" : "Active Only"}</option>
                      <option value="inactive">{isBn ? "শুধুমাত্র নিষ্ক্রিয়" : "Inactive Only"}</option>
                    </optgroup>
                  )}

                  {/* STUDENTS FILTERS */}
                  {activeModal === "students" && (
                    <>
                      <optgroup label={isBn ? "লিঙ্গ" : "Gender"}>
                        <option value="male">{isBn ? "পুরুষ (♂)" : "Male (♂)"}</option>
                        <option value="female">{isBn ? "মহিলা (♀)" : "Female (♀)"}</option>
                      </optgroup>
                      <optgroup label={isBn ? "শ্রেণী পর্যায়" : "Class Level"}>
                        <option value="class_6">{translateClass(6)}</option>
                        <option value="class_7">{translateClass(7)}</option>
                        <option value="class_8">{translateClass(8)}</option>
                        <option value="class_9">{translateClass(9)}</option>
                        <option value="class_10">{translateClass(10)}</option>
                        <option value="class_11">{translateClass(11)}</option>
                        <option value="class_12">{translateClass(12)}</option>
                      </optgroup>
                    </>
                  )}

                  {/* ASSIGNMENTS FILTERS */}
                  {activeModal === "assignments" && (
                    <>
                      <optgroup label={isBn ? "প্রকাশনা অবস্থা" : "Publishing Status"}>
                        <option value="published">{isBn ? "শুধুমাত্র প্রকাশিত" : "Published Only"}</option>
                        <option value="draft">{isBn ? "শুধুমাত্র খসড়া" : "Draft Only"}</option>
                      </optgroup>
                      <optgroup label={isBn ? "শ্রেণী পর্যায়" : "Class Level"}>
                        <option value="class_6">{translateClass(6)}</option>
                        <option value="class_7">{translateClass(7)}</option>
                        <option value="class_8">{translateClass(8)}</option>
                        <option value="class_9">{translateClass(9)}</option>
                        <option value="class_10">{translateClass(10)}</option>
                        <option value="class_11">{translateClass(11)}</option>
                        <option value="class_12">{translateClass(12)}</option>
                      </optgroup>
                    </>
                  )}

                  {/* SUBMISSIONS FILTERS */}
                  {activeModal === "submissions" && (
                    <optgroup label={isBn ? "সাবমিশন অবস্থা" : "Submission Status"}>
                      <option value="graded">{isBn ? "মূল্যায়িত" : "Graded"}</option>
                      <option value="submitted">{isBn ? "পর্যালোচনার অপেক্ষায়" : "Pending Review"}</option>
                      <option value="late">{isBn ? "বিলম্বিত সাবমিশন" : "Late Submissions"}</option>
                      <option value="missing">{isBn ? "অনুপস্থিত / সময়োত্তীর্ণ" : "Missing / Overdue"}</option>
                    </optgroup>
                  )}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0 bg-violet-50/60 dark:bg-violet-950/30 border border-violet-300 dark:border-violet-700 rounded-xl px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <select
                value={modalSortBy}
                onChange={(e) => setModalSortBy(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
              >
                <option value="default">{isBn ? "সাজান: ডিফল্ট" : "Sort: Default"}</option>
                {activeModal === "users" && (
                  <>
                    <option value="name">{isBn ? "নাম (অ-ক্ষর)" : "Name (A-Z)"}</option>
                    <option value="email">{t("thEmail")}</option>
                    <option value="role">{t("thRole")}</option>
                  </>
                )}
                {activeModal === "teachers" && (
                  <>
                    <option value="name">{isBn ? "নাম (অ-ক্ষর)" : "Name (A-Z)"}</option>
                    <option value="email">{t("thEmail")}</option>
                    <option value="designation">{t("thDesignation")}</option>
                  </>
                )}
                {activeModal === "students" && (
                  <>
                    <option value="name">{isBn ? "নাম (অ-ক্ষর)" : "Name (A-Z)"}</option>
                    <option value="email">{t("thEmail")}</option>
                    <option value="class">{t("thClassLevel")}</option>
                    <option value="studentNumber">{t("thStudentId")}</option>
                  </>
                )}
                {activeModal === "assignments" && (
                  <>
                    <option value="title">{isBn ? "শিরোনাম (অ-ক্ষর)" : "Title (A-Z)"}</option>
                    <option value="date">{isBn ? "তৈরির তারিখ" : "Date Created"}</option>
                    <option value="class">{t("thClassLevel")}</option>
                    <option value="marks">{t("thMaxMarks")}</option>
                  </>
                )}
                {activeModal === "submissions" && (
                  <>
                    <option value="title">{t("thAssignmentTitle")}</option>
                    <option value="date">{isBn ? "জমার তারিখ" : "Submission Date"}</option>
                    <option value="student">{t("thStudent")}</option>
                    <option value="grade">{isBn ? "গ্রেড / নম্বর" : "Grade / Score"}</option>
                  </>
                )}
              </select>

              <button
                onClick={() => setModalSortOrder(modalSortOrder === "asc" ? "desc" : "asc")}
                title={`Sort ${modalSortOrder === "asc" ? "Descending" : "Ascending"}`}
                className="ml-1 p-0.5 rounded text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {modalSortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        }
      >
        {modalLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner label={isBn ? "তথ্য লোড হচ্ছে..." : `Loading ${activeModal || "data"} details…`} />
          </div>
        ) : (
          <div className="space-y-4">

            {activeModal === "users" && usersData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("thName")}</TableHead>
                    <TableHead>{t("thEmail")}</TableHead>
                    <TableHead>{t("thRole")}</TableHead>
                    <TableHead>{t("thStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-slate-400 py-6">
                        {isBn ? "আপনার অনুসন্ধান এবং ফিল্টারের সাথে মিল থাকা কোনো ব্যবহারকারী পাওয়া যায়নি।" : "No users match your search and filter criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((u) => {
                      const rawName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                      const name = translateUserName(rawName);
                      const roleLabel = u.role === "Admin" ? (isBn ? "অ্যাডমিন" : "Admin") : u.role === "Teacher" ? (isBn ? "শিক্ষক" : "Teacher") : (isBn ? "শিক্ষার্থী" : "Student");
                      const statusLabel = u.isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Inactive");
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === "Admin" ? "primary" : u.role === "Teacher" ? "info" : "default"} size="sm">{roleLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.isActive ? "success" : "default"} size="sm">
                              {statusLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {activeModal === "teachers" && teachersData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("thName")}</TableHead>
                    <TableHead>{isBn ? "লিঙ্গ" : "Gender"}</TableHead>
                    <TableHead>{t("thEmail")}</TableHead>
                    <TableHead>{t("thDesignation")}</TableHead>
                    <TableHead>{t("lblSubject")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-slate-400 py-6">
                        {isBn ? "আপনার অনুসন্ধান এবং ফিল্টারের সাথে মিল থাকা কোনো শিক্ষক পাওয়া যায়নি।" : "No teachers match your search and filter criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTeachers.map((tItem) => {
                      const rawName = tItem.fullName || `${tItem.firstName || ""} ${tItem.lastName || ""}`.trim() || "Teacher";
                      const name = translateUserName(rawName);
                      const isFemale = (tItem.gender || "").toLowerCase() === "female";
                      const genderLabel = isFemale ? (isBn ? "মহিলা" : "Female") : (isBn ? "পুরুষ" : "Male");
                      const designationLabel = isBn
                        ? (tItem.designation === "Senior Teacher" ? "সিনিয়র শিক্ষক" : tItem.designation === "Assistant Teacher" ? "সহকারী শিক্ষক" : "শিক্ষক")
                        : (tItem.designation || "Teacher");
                      return (
                        <TableRow key={tItem.id}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                isFemale
                                  ? "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              <span>{isFemale ? "♀" : "♂"}</span>
                              <span>{genderLabel}</span>
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">{tItem.email}</TableCell>
                          <TableCell>{designationLabel}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(tItem.taughtSubjects && tItem.taughtSubjects.length > 0 ? tItem.taughtSubjects : ["General Studies"]).map((sub, i) => (
                                <Badge key={i} variant="default" size="sm">{translateSubject(sub)}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {activeModal === "students" && studentsData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("thStudentId")}</TableHead>
                    <TableHead>{t("thStudent")}</TableHead>
                    <TableHead>{isBn ? "লিঙ্গ" : "Gender"}</TableHead>
                    <TableHead>{t("thClassLevel")}</TableHead>
                    <TableHead>{t("thEmail")}</TableHead>
                    <TableHead>{isBn ? "ফোন নম্বর" : "Phone Number"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-slate-400 py-6">
                        {isBn ? "আপনার অনুসন্ধান এবং ফিল্টারের সাথে মিল থাকা কোনো শিক্ষার্থী পাওয়া যায়নি।" : "No students match your search and filter criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((s) => {
                      const rawName = s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student";
                      const name = translateUserName(rawName);
                      const isFemale = (s.gender || "").toLowerCase() === "female";
                      const genderLabel = isFemale ? (isBn ? "মহিলা" : "Female") : (isBn ? "পুরুষ" : "Male");
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs text-slate-500">{toBanglaDigits(s.studentNumber)}</TableCell>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                isFemale
                                  ? "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              <span>{isFemale ? "♀" : "♂"}</span>
                              <span>{genderLabel}</span>
                            </span>
                          </TableCell>
                          <TableCell>{translateClass(s.classLevel || 9)}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">{s.email}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400 font-mono text-xs">{s.phone ? toBanglaDigits(s.phone) : "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {activeModal === "assignments" && assignmentsData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("thAssignmentTitle")}</TableHead>
                    <TableHead>{isBn ? "শ্রেণী · বিষয়" : "Class · Subject"}</TableHead>
                    <TableHead>{isBn ? "তৈরি করেছেন" : "Created By"}</TableHead>
                    <TableHead>{isBn ? "তৈরির তারিখ" : "Created"}</TableHead>
                    <TableHead>{t("thDeadline")}</TableHead>
                    <TableHead>{t("thStatus")}</TableHead>
                    <TableHead>{t("thMaxMarks")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-xs text-slate-400 py-6">
                        {isBn ? "আপনার অনুসন্ধান এবং ফিল্টারের সাথে মিল থাকা কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি।" : "No assignments match your search and filter criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssignments.map((a) => {
                      const teacherName = translateUserName(a.teacherName || "Teacher");
                      const statusLabel = a.status === "Published" ? (isBn ? "প্রকাশিত" : "Published") : a.status === "Draft" ? (isBn ? "খসড়া" : "Draft") : a.status;
                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Link
                              href={ROUTES.ASSIGNMENT_DETAILS(a.id)}
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors group"
                            >
                              <span>{a.title}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </TableCell>
                          <TableCell>{translateClass(a.classLevel)} · {translateSubject(a.subjectName)}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">{teacherName}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(a.createdAtUtc, language)}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(a.deadlineUtc, language)}</TableCell>
                          <TableCell>
                            <Badge
                              size="sm"
                              variant={a.status === "Published" ? "success" : a.status === "Draft" ? "warning" : "default"}
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums font-medium">{toBanglaDigits(a.maxMarks)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {activeModal === "submissions" && submissionsData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBn ? "শ্রেণী · বিষয়" : "Class · Subject"}</TableHead>
                    <TableHead>{t("thAssignmentTitle")}</TableHead>
                    <TableHead>{t("thStudent")}</TableHead>
                    <TableHead>{isBn ? "জমা দেওয়া হয়েছে" : "Submitted"}</TableHead>
                    <TableHead>{isBn ? "গ্রেড" : "Grade"}</TableHead>
                    <TableHead>{t("thStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-slate-400 py-6">
                        {isBn ? "আপনার অনুসন্ধান এবং ফিল্টারের সাথে মিল থাকা কোনো সাবমিশন পাওয়া যায়নি।" : "No submissions match your search and filter criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSubmissions.map((sub) => {
                      const studentName = translateUserName(sub.studentName);
                      const studentNum = toBanglaDigits(sub.studentNumber);
                      const statusLabel = sub.status === "Graded" ? (isBn ? "মূল্যায়িত" : "Graded") : sub.status === "Late" ? (isBn ? "বিলম্বিত" : "Late") : (isBn ? "জমা দেওয়া হয়েছে" : "Submitted");
                      const gradeText = sub.status === "Graded" && sub.marks !== undefined
                        ? `${toBanglaDigits(sub.marks)}/${toBanglaDigits(sub.maxMarks)}`
                        : `—/${toBanglaDigits(sub.maxMarks)}`;

                      const classSubjectText = sub.classLevel && sub.subjectName
                        ? `${translateClass(sub.classLevel)} · ${translateSubject(sub.subjectName)}`
                        : sub.classSubject
                        ? sub.classSubject
                        : `${translateClass(9)} · ${translateSubject("Physics")}`;

                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="text-slate-500 dark:text-slate-400">{classSubjectText}</TableCell>
                          <TableCell>
                            <Link
                              href={sub.assignmentId ? ROUTES.ASSIGNMENT_DETAILS(sub.assignmentId) : ROUTES.SUBMISSION_DETAILS(sub.id)}
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors group"
                            >
                              <span>{sub.assignmentTitle}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </TableCell>
                          <TableCell>{studentName} <span className="text-xs text-slate-400">({studentNum})</span></TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(sub.submittedAtUtc, language)}</TableCell>
                          <TableCell className="tabular-nums font-medium">{gradeText}</TableCell>
                          <TableCell>
                            <Badge
                              size="sm"
                              variant={
                                sub.status === "Graded" ? "success" :
                                sub.status === "Late" ? "warning" : "info"
                              }
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isBn ? `${toBanglaDigits(activeFilteredList.length)} টি আইটেম` : `${activeFilteredList.length} total items`}
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={PAGE_SIZE}
                totalItems={activeFilteredList.length}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


