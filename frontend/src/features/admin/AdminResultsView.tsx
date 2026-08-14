"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Crown, Filter, Medal, Search, UserCheck, TrendingUp, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { userService, StudentListItem } from "@/services/userService";
import { submissionService } from "@/services/submissionService";
import { classService } from "@/services/classService";
import { assignmentService } from "@/services/assignmentService";
import { useCachedData } from "@/hooks/useCachedData";
import { ClassListItem } from "@/types/class";
import { SubmissionListItem } from "@/types/submission";
import { AssignmentListItem } from "@/types/assignment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { getCurriculumSubjectsForClass, canonicalizeSubjectName } from "@/utils/classLevelConfig";
import { Pagination } from "@/components/common/Pagination";
import { useLanguage } from "@/context/LanguageContext";

interface StudentResultItem {
  studentId: number;
  studentName: string;
  studentNumber: string;
  classLevel: number;
  group?: string;
  avgPercentage: number;
  totalGraded: number;
  totalMarks: number;
  totalMaxMarks: number;
  positionInClass: number;
}

// Convert teacher name to initials e.g. "Anisur Rahman" -> "A.R."
function getTeacherInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return "N/A";
  const cleanName = fullName.replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.)\s+/i, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N/A";
  if (parts.length === 1) return parts[0][0].toUpperCase() + ".";
  return parts.map((p) => p[0].toUpperCase()).join(".") + ".";
}

// Parse class level and subject name fallback from submission object
function parseSubClassAndSubject(sub: SubmissionListItem) {
  let level = (sub as any).classLevel;
  let subject = (sub as any).subjectName;

  if ((!level || !subject) && sub.classSubject) {
    const matchClass = sub.classSubject.match(/Class\s*(\d+)/i);
    if (matchClass) {
      level = parseInt(matchClass[1], 10);
    }
    const parts = sub.classSubject.split(/[-·—(]/);
    if (parts.length > 1) {
      subject = parts[1].replace(/\)$/, "").trim();
    }
  }

  return {
    classLevel: level || 6,
    subjectName: subject || "General",
  };
}

export function AdminResultsView() {
  const { language, t, translateSubject, translateClass, translateUserName, toBanglaDigits } = useLanguage();
  const isBn = language === "bn";

  const { data: students = [], isLoading: studentsPending } = useCachedData(
    "students:all",
    () => userService.getAllStudents(),
    { enabled: true }
  );
  const { data: submissions = [], isLoading: submissionsPending } = useCachedData(
    "submissions:results:full",
    () => submissionService.getAllSubmissionsFull()
  );
  const { data: classes = [], isLoading: classesPending } = useCachedData(
    "classes:all",
    () => classService.getAllClasses()
  );
  const { data: assignments = [], isLoading: assignmentsPending } = useCachedData(
    "assignments:results:full",
    () => assignmentService.getAllAssignments()
  );
  const isLoading =
    (studentsPending && students.length === 0) ||
    (submissionsPending && submissions.length === 0) ||
    (classesPending && classes.length === 0) ||
    (assignmentsPending && assignments.length === 0);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>("6");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // 7 record pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Map assignments by ID for instant subject & class metadata lookup
  const assignmentMap = useMemo(() => {
    const map: Record<number, AssignmentListItem> = {};
    assignments.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [assignments]);

  // Handle Class change & reset Subject and Group filters
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    setSelectedSubject("All");
    const classNum = Number(newClass);
    if (!isNaN(classNum) && classNum >= 9) {
      setSelectedGroup("Science");
    } else {
      setSelectedGroup("All");
    }
    setCurrentPage(1);
  };

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, searchTerm, selectedGroup]);

  // Also reset group to Science when subject changes and class is 9-12
  const prevSubjectRef = React.useRef(selectedSubject);
  useEffect(() => {
    if (prevSubjectRef.current !== selectedSubject) {
      prevSubjectRef.current = selectedSubject;
      const classNum = Number(selectedClass);
      if (!isNaN(classNum) && classNum >= 9) {
        setSelectedGroup("Science");
      }
    }
  }, [selectedSubject, selectedClass]);

  // Class options for filter dropdown
  const classOptions = useMemo(() => {
    const classSet = new Set<number>();
    classes.forEach((c) => {
      if (c.classLevel) classSet.add(c.classLevel);
    });
    students.forEach((st) => {
      if (st.classLevel) classSet.add(st.classLevel);
    });

    [6, 7, 8, 9, 10, 11, 12].forEach((lvl) => classSet.add(lvl));
    const sortedLevels = Array.from(classSet).sort((a, b) => a - b);

    return sortedLevels.map((lvl) => ({
      value: String(lvl),
      label: isBn
        ? (lvl === 6 ? `${translateClass(lvl)} (ডিফল্ট)` : translateClass(lvl))
        : (lvl === 6 ? `Class ${lvl} (Default)` : `Class ${lvl}`),
    }));
  }, [classes, students, isBn, translateClass]);

  // Subject options for dropdown
  const subjectOptions = useMemo(() => {
    let curriculumSubjects: string[] = [];
    if (selectedClass === "All") {
      curriculumSubjects = Array.from(new Set([6, 7, 8, 9, 10, 11, 12].flatMap((l) => getCurriculumSubjectsForClass(l))));
    } else {
      const cLevel = Number(selectedClass);
      curriculumSubjects = getCurriculumSubjectsForClass(cLevel);
    }

    const targetClasses = classes.filter((c) => {
      if (selectedClass === "All") return true;
      return c.classLevel === Number(selectedClass);
    });

    const subjectsFromClasses = targetClasses.map((c) => c.subjectName).filter(Boolean);
    const subjectsFromAssignments = assignments
      .filter((a) => {
        const cLevel = a.classLevel || (a as any).class?.classLevel || 6;
        if (selectedClass === "All") return true;
        return Number(cLevel) === Number(selectedClass);
      })
      .map((a) => a.subjectName || (a as any).subject?.name)
      .filter(Boolean);

    const allSubjects = Array.from(
      new Set([...curriculumSubjects, ...subjectsFromClasses, ...subjectsFromAssignments].map((s) => canonicalizeSubjectName(s)))
    ).sort();

    const opts = allSubjects.map((sub) => ({
      value: sub,
      label: isBn ? translateSubject(sub) : sub,
    }));

    return [{ value: "All", label: isBn ? "সকল বিষয়" : "All Subjects" }, ...opts];
  }, [classes, assignments, selectedClass, isBn, translateSubject]);

  // Roster maps for instant class level & class ID resolution
  const studentClassMap = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((st) => {
      const level = st.classLevel || 6;
      if (st.id) map[String(st.id)] = level;
      if (st.userId) map[String(st.userId)] = level;
      if (st.studentNumber) map[st.studentNumber] = level;
      if (st.fullName) map[st.fullName] = level;
    });
    return map;
  }, [students]);

  const classIdToLevelMap = useMemo(() => {
    const map: Record<number, number> = {};
    classes.forEach((c) => {
      if (c.id && c.classLevel) {
        map[c.id] = c.classLevel;
      }
    });
    return map;
  }, [classes]);

  // Robust class level resolver
  const resolveClassLevel = (item: any): number => {
    if (item.classLevel && Number(item.classLevel) > 0) return Number(item.classLevel);
    if (item.classId && classIdToLevelMap[item.classId]) return classIdToLevelMap[item.classId];
    if (item.class?.classLevel && Number(item.class.classLevel) > 0) return Number(item.class.classLevel);

    const aliases = [
      String(item.studentId),
      String(item.studentUserId),
      item.studentNumber,
      item.studentName,
    ].filter(Boolean);

    for (const key of aliases) {
      if (studentClassMap[key]) return studentClassMap[key];
    }

    const text = item.classSubject || item.title || "";
    const match = text.match(/Class\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);

    return 6;
  };

  const classGroupPostedMaxMarks = useMemo(() => {
    const maxMap: Record<string, number> = {};
    assignments.forEach((a) => {
      const cLevel = resolveClassLevel(a);
      const subName = a.subjectName || (a as any).subject?.name || "";

      const matchClass = selectedClass === "All" || Number(cLevel) === Number(selectedClass);
      const matchSubject = selectedSubject === "All" || subName.toLowerCase() === selectedSubject.toLowerCase();

      if (matchClass && matchSubject) {
        const m = Number(a.maxMarks || 100);
        maxMap[`${cLevel}_All`] = (maxMap[`${cLevel}_All`] || 0) + m;

        if (cLevel >= 9) {
          ["Science", "Business Studies", "Humanities"].forEach((grp) => {
            const curriculumSubs = getCurriculumSubjectsForClass(cLevel, grp);
            const isMatch = curriculumSubs.some(
              (cs: string) => cs.toLowerCase().trim() === subName.toLowerCase().trim()
            );
            if (isMatch) {
              maxMap[`${cLevel}_${grp}`] = (maxMap[`${cLevel}_${grp}`] || 0) + m;
            }
          });
        }
      }
    });
    return maxMap;
  }, [assignments, selectedClass, selectedSubject, classIdToLevelMap, studentClassMap]);

  const classGroupTotalTaskCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    assignments.forEach((a) => {
      const cLevel = resolveClassLevel(a);
      const subName = a.subjectName || (a as any).subject?.name || "";

      const matchClass = selectedClass === "All" || Number(cLevel) === Number(selectedClass);
      const matchSubject = selectedSubject === "All" || subName.toLowerCase() === selectedSubject.toLowerCase();

      if (matchClass && matchSubject) {
        countMap[`${cLevel}_All`] = (countMap[`${cLevel}_All`] || 0) + 1;

        if (cLevel >= 9) {
          ["Science", "Business Studies", "Humanities"].forEach((grp) => {
            const curriculumSubs = getCurriculumSubjectsForClass(cLevel, grp);
            const isMatch = curriculumSubs.some(
              (cs: string) => cs.toLowerCase().trim() === subName.toLowerCase().trim()
            );
            if (isMatch) {
              countMap[`${cLevel}_${grp}`] = (countMap[`${cLevel}_${grp}`] || 0) + 1;
            }
          });
        }
      }
    });
    return countMap;
  }, [assignments, selectedClass, selectedSubject, classIdToLevelMap, studentClassMap]);

  const studentResults = useMemo(() => {
    const subAggMap: Record<string, { totalMarks: number; totalMaxMarks: number; totalGraded: number }> = {};

    submissions.forEach((s) => {
      const isScored =
        s.status === "Graded" ||
        s.status === "Missing" ||
        (s.marks !== undefined && s.marks !== null);
      if (!isScored) return;

      const targetAssignment = assignmentMap[s.assignmentId];
      const subClassLvl = targetAssignment?.classLevel || resolveClassLevel(s);
      const subSubj =
        targetAssignment?.subjectName || (s as any).subjectName || parseSubClassAndSubject(s).subjectName;

      const matchClass = selectedClass === "All" || Number(subClassLvl) === Number(selectedClass);
      const matchSubject =
        selectedSubject === "All" || subSubj.toLowerCase() === selectedSubject.toLowerCase();

      if (!matchClass || !matchSubject) return;

      const keys = [
        s.studentNumber,
        String(s.studentId),
        String(s.studentUserId),
        s.studentName,
      ].filter(Boolean);

      const primaryKey = keys[0] || `sub-${s.id}`;

      if (!subAggMap[primaryKey]) {
        subAggMap[primaryKey] = { totalMarks: 0, totalMaxMarks: 0, totalGraded: 0 };
      }

      const maxM = Number(s.maxMarks || targetAssignment?.maxMarks || 100);
      subAggMap[primaryKey].totalMarks += Number(s.marks);
      subAggMap[primaryKey].totalMaxMarks += maxM;
      subAggMap[primaryKey].totalGraded += 1;

      keys.forEach((k) => {
        subAggMap[k] = subAggMap[primaryKey];
      });
    });

    let roster: any[] = [];

    const getGroupForStudent = (stId: number, rawGrp?: string) => {
      if (rawGrp && rawGrp.toLowerCase() !== "none" && rawGrp.trim() !== "") {
        return rawGrp;
      }
      return "Science";
    };

    if (students && students.length > 0) {
      roster = students.map((st) => {
        const sId = st.id || st.userId || 1;
        return {
          studentId: sId,
          studentName: st.fullName || `${st.firstName || ""} ${st.lastName || ""}`.trim() || "Student",
          studentNumber: st.studentNumber || `BD-2026-${String(sId).padStart(3, "0")}`,
          classLevel: st.classLevel || 6,
          group: getGroupForStudent(sId, st.group),
        };
      });
    } else {
      const unique: Record<string, any> = {};
      submissions.forEach((s) => {
        const k = s.studentNumber || s.studentName || `st-${s.studentId}`;
        if (!unique[k]) {
          const sId = s.studentId || s.studentUserId || 1;
          unique[k] = {
            studentId: sId,
            studentName: s.studentName || "Student",
            studentNumber: s.studentNumber || `BD-2026-${String(sId).padStart(3, "0")}`,
            classLevel: resolveClassLevel(s),
            group: getGroupForStudent(sId, (s as any).group),
          };
        }
      });
      roster = Object.values(unique);
    }

    let filteredRoster = roster.filter((st) => {
      if (selectedClass === "All") return true;
      return Number(st.classLevel) === Number(selectedClass);
    });

    if (filteredRoster.length === 0 && selectedClass !== "All") {
      filteredRoster = roster;
    }

    const uniformClassMaxMap: Record<string, number> = {};

    filteredRoster.forEach((st) => {
      const stGroup = st.group || "Science";
      const groupKey = st.classLevel >= 9 ? `${st.classLevel}_${stGroup}` : `${st.classLevel}_All`;

      const candidates = [st.studentNumber, String(st.studentId), String(st.userId), st.studentName].filter(Boolean);
      let studentEvaluatedMax = 0;
      for (const k of candidates) {
        if (subAggMap[k]) {
          studentEvaluatedMax = subAggMap[k].totalMaxMarks;
          break;
        }
      }

      const postedMax = classGroupPostedMaxMarks[groupKey] || classGroupPostedMaxMarks[`${st.classLevel}_All`] || 0;
      const effectiveMax = Math.max(studentEvaluatedMax, postedMax);

      uniformClassMaxMap[groupKey] = Math.max(uniformClassMaxMap[groupKey] || 0, effectiveMax);
    });

    const resultList: StudentResultItem[] = filteredRoster.map((st) => {
      const candidates = [
        st.studentNumber,
        String(st.studentId),
        String(st.userId),
        st.studentName,
      ].filter(Boolean);

      let subData = { totalMarks: 0, totalMaxMarks: 0, totalGraded: 0 };
      for (const k of candidates) {
        if (subAggMap[k]) {
          subData = subAggMap[k];
          break;
        }
      }

      const totalScored = subData.totalMarks;
      const stGroup = st.group || "Science";
      const groupKey = st.classLevel >= 9 ? `${st.classLevel}_${stGroup}` : `${st.classLevel}_All`;

      const classTasks = classGroupTotalTaskCount[groupKey] || classGroupTotalTaskCount[`${st.classLevel}_All`] || 0;
      const totalTasks = Math.max(subData.totalGraded, classTasks > 0 ? classTasks : 0);

      const totalMax = subData.totalMaxMarks > 0 ? subData.totalMaxMarks : (uniformClassMaxMap[groupKey] > 0 ? uniformClassMaxMap[groupKey] : 100);
      const rawPct = totalMax > 0 ? (totalScored / totalMax) * 100 : 0;
      const pctMark = Math.min(100, Math.max(0, rawPct));

      return {
        studentId: st.studentId,
        studentName: st.studentName,
        studentNumber: st.studentNumber,
        classLevel: st.classLevel,
        group: st.group,
        avgPercentage: Math.round(pctMark * 100) / 100,
        totalGraded: totalTasks,
        totalMarks: Math.round(totalScored * 100) / 100,
        totalMaxMarks: Math.round(totalMax * 100) / 100,
        positionInClass: 0,
      };
    });

    const groupedRanksMap: Record<string, StudentResultItem[]> = {};

    resultList.forEach((item) => {
      const stGroup = item.group || "Science";
      const rankGroupKey = item.classLevel >= 9 ? `${item.classLevel}_${stGroup.toLowerCase().trim()}` : `${item.classLevel}_All`;
      if (!groupedRanksMap[rankGroupKey]) {
        groupedRanksMap[rankGroupKey] = [];
      }
      groupedRanksMap[rankGroupKey].push(item);
    });

    Object.values(groupedRanksMap).forEach((groupItems) => {
      groupItems.sort((a, b) => {
        if (b.avgPercentage !== a.avgPercentage) return b.avgPercentage - a.avgPercentage;
        if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
        return a.studentName.localeCompare(b.studentName);
      });

      groupItems.forEach((item, index) => {
        item.positionInClass = index + 1;
      });
    });

    resultList.sort((a, b) => {
      if (b.avgPercentage !== a.avgPercentage) return b.avgPercentage - a.avgPercentage;
      if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
      return a.studentName.localeCompare(b.studentName);
    });

    return resultList;
  }, [students, submissions, classes, assignments, selectedClass, selectedSubject, classGroupPostedMaxMarks, classGroupTotalTaskCount, assignmentMap, classIdToLevelMap, studentClassMap]);

  const showGroupFilter = useMemo(() => {
    const lvl = Number(selectedClass);
    return !isNaN(lvl) && lvl >= 9;
  }, [selectedClass]);

  const filteredResults = useMemo(() => {
    return studentResults
      .filter((st) => {
        const matchesSearch =
          st.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          st.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGroup =
          !showGroupFilter ||
          selectedGroup === "All" ||
          (st.group || "").toLowerCase().trim() === selectedGroup.toLowerCase().trim();

        return matchesSearch && matchesGroup;
      })
      .sort((a, b) => {
        if (b.avgPercentage !== a.avgPercentage) return b.avgPercentage - a.avgPercentage;
        if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
        return a.studentName.localeCompare(b.studentName);
      });
  }, [studentResults, searchTerm, selectedGroup, showGroupFilter]);

  const totalPages = Math.ceil(filteredResults.length / pageSize);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage]);

  const assignedTeacherDisplay = useMemo(() => {
    const targetClasses = classes.filter((c) => {
      const matchClass = selectedClass === "All" || c.classLevel === Number(selectedClass);
      const matchSubject =
        selectedSubject === "All" || c.subjectName.toLowerCase() === selectedSubject.toLowerCase();
      return matchClass && matchSubject;
    });

    const teacherNames = Array.from(
      new Set(targetClasses.map((c) => c.teacherName).filter((name): name is string => Boolean(name && name.trim())))
    );

    if (teacherNames.length === 0) {
      const raw = selectedSubject !== "All" ? "Anisur Rahman" : "Anisur, Sarah (+2 more)";
      return isBn ? translateUserName(raw) : raw;
    }

    if (selectedSubject !== "All") {
      return isBn ? teacherNames.map((n) => translateUserName(n)).join(", ") : teacherNames.join(", ");
    }

    const firstNames = teacherNames.map((name) => name.trim().split(" ")[0]);
    if (firstNames.length <= 2) {
      return isBn ? firstNames.map((n) => translateUserName(n)).join(", ") : firstNames.join(", ");
    }

    const top2 = isBn ? firstNames.slice(0, 2).map((n) => translateUserName(n)).join(", ") : firstNames.slice(0, 2).join(", ");
    const remaining = firstNames.length - 2;
    return isBn ? `${top2} (+${toBanglaDigits(remaining)} জন)` : `${top2} (+${remaining} more)`;
  }, [classes, selectedClass, selectedSubject, isBn, translateUserName, toBanglaDigits]);

  const totalAssignmentsCount = useMemo(() => {
    return assignments.filter((a) => {
      const matchClass = selectedClass === "All" || Number(a.classLevel) === Number(selectedClass);
      const matchSubject =
        selectedSubject === "All" || a.subjectName.toLowerCase() === selectedSubject.toLowerCase();
      return matchClass && matchSubject;
    }).length;
  }, [assignments, selectedClass, selectedSubject]);

  const stats = useMemo(() => {
    if (filteredResults.length === 0) {
      return {
        classAvg: 0,
        topStudent: null as StudentResultItem | null,
        totalEvaluated: 0,
        passRate: 0,
      };
    }

    const totalPct = filteredResults.reduce((acc, st) => acc + st.avgPercentage, 0);
    const totalEval = filteredResults.reduce((acc, st) => acc + st.totalGraded, 0);
    const passingStudents = filteredResults.filter((st) => st.avgPercentage >= 60).length;

    const rank1Student = [...filteredResults].sort((a, b) => {
      if (a.positionInClass !== b.positionInClass) return a.positionInClass - b.positionInClass;
      return b.totalMarks - a.totalMarks;
    })[0];

    return {
      classAvg: Math.round((totalPct / filteredResults.length) * 100) / 100,
      topStudent: rank1Student || null,
      totalEvaluated: totalEval,
      passRate: Math.round((passingStudents / filteredResults.length) * 100),
    };
  }, [filteredResults]);

  if (isLoading) return <LoadingSpinner label={isBn ? "শ্রেণীর ফলাফল ও অবস্থান লোড করা হচ্ছে..." : "Loading student class results & standings..."} />;

  return (
    <div className="space-y-7">
      {/* ─── TITLE HEADER ─── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? "শ্রেণীর ফলাফল ও অবস্থান" : "Class Results & Standings"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBn
              ? "মোট অর্জিত নম্বর, শতাংশ স্কোর এবং পারফরম্যান্স গ্রেড অনুযায়ী শিক্ষার্থীদের অবস্থান পর্যালোচনা করুন।"
              : "Review student class rankings by total cumulative marks, percentage scores, and realistic performance grades."}
          </p>
        </div>
      </div>

      {/* ─── 4 STATS CARDS ─── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Class Average Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isBn ? "শ্রেণীর গড় স্কোর" : "Class Average Score"}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl">
                {toBanglaDigits(stats.classAvg.toFixed(2))}%
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
            {isBn
              ? (selectedClass === "All" ? "সকল শ্রেণীর সার্বিক গড় নম্বর" : `${translateClass(selectedClass)} এর গড় নম্বর`)
              : (selectedClass === "All" ? "Overall average score across all classes" : `Class ${selectedClass} average score`)}
          </p>
        </div>

        {/* Card 2: Top Cumulative Result (Rank #1) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isBn
                  ? (showGroupFilter && selectedGroup !== "All" ? `${selectedGroup === "Science" ? "বিজ্ঞান" : selectedGroup === "Business Studies" ? "ব্যবসায় শিক্ষা" : "মানবিক"} বিভাগ ১ম অবস্থান` : "শ্রেণীতে ১ম অবস্থান")
                  : (showGroupFilter && selectedGroup !== "All" ? `${selectedGroup} Rank #1` : "Class Rank #1")}
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-950 dark:text-white truncate">
                {stats.topStudent ? translateUserName(stats.topStudent.studentName) : (isBn ? "প্রযোজ্য নয়" : "N/A")}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {stats.topStudent
              ? (isBn
                  ? `${toBanglaDigits(stats.topStudent.totalMarks.toFixed(2))} নম্বর (${toBanglaDigits(stats.topStudent.avgPercentage.toFixed(2))}%)`
                  : `${stats.topStudent.totalMarks.toFixed(2)} Marks (${stats.topStudent.avgPercentage.toFixed(2)}%)`)
              : (isBn ? "কোন মূল্যায়নকৃত শিক্ষার্থী নেই" : "No graded students")}
          </p>
        </div>

        {/* Card 3: Assigned Teacher */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isBn ? "দায়িত্বপ্রাপ্ত শিক্ষক" : "Assigned Teacher"}
              </p>
              <p className={`mt-2 font-bold tracking-tight text-slate-950 dark:text-white truncate ${selectedSubject !== "All" ? "text-lg" : "text-base font-extrabold"}`}>
                {assignedTeacherDisplay}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
            {isBn
              ? (selectedSubject === "All"
                  ? (selectedClass === "All" ? "সকল বিষয়ের বিষয়ভিত্তিক শিক্ষকগণ" : `${translateClass(selectedClass)} এর শিক্ষকগণ`)
                  : `${translateSubject(selectedSubject)} ইনস্ট্রাক্টর`)
              : (selectedSubject === "All"
                  ? (selectedClass === "All" ? "All Class Teachers" : `Class ${selectedClass} Teachers`)
                  : `${selectedSubject} Instructor`)}
          </p>
        </div>

        {/* Card 4: Total Assignments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isBn ? "মোট অ্যাসাইনমেন্ট" : "Total Assignments"}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl">
                {toBanglaDigits(totalAssignmentsCount)}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
            {isBn
              ? (selectedClass === "All" && selectedSubject === "All"
                  ? "মোট সক্রিয় শিক্ষাক্রম অ্যাসাইনমেন্ট"
                  : `${selectedClass === "All" ? "সকল শ্রেণী" : translateClass(selectedClass)} এর অ্যাসাইনমেন্ট${selectedSubject !== "All" ? ` (${translateSubject(selectedSubject)})` : ""}`)
              : (selectedClass === "All" && selectedSubject === "All"
                  ? "Total active coursework assignments"
                  : `Assignments for ${selectedClass === "All" ? "All Classes" : `Class ${selectedClass}`}${selectedSubject !== "All" ? ` (${selectedSubject})` : ""}`)}
          </p>
        </div>
      </div>

      {/* ─── FILTERS & SEARCH ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={isBn ? "শিক্ষার্থীর নাম বা আইডি দিয়ে খুঁজুন..." : "Search by student name or ID..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Filter className="h-4 w-4 text-blue-600 shrink-0" /> {isBn ? "শ্রেণী:" : "Class:"}
            <Select
              options={classOptions}
              value={selectedClass}
              onChange={handleClassChange}
              className="w-36 bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {isBn ? "বিষয়:" : "Subject:"}
            <Select
              options={subjectOptions}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-40 bg-violet-50/60 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700 font-semibold"
            />
          </div>

          {showGroupFilter && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-violet-600 dark:text-violet-400 font-bold">{isBn ? "বিভাগ:" : "Group:"}</span>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 px-2.5 py-1.5 text-violet-900 dark:text-violet-200 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer shadow-sm"
              >
                <option value="Science">{isBn ? "বিজ্ঞান" : "Science"}</option>
                <option value="Business Studies">{isBn ? "ব্যবসায় শিক্ষা" : "Business Studies"}</option>
                <option value="Humanities">{isBn ? "মানবিক" : "Humanities"}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ─── RESULTS TABLE ─── */}
      {filteredResults.length === 0 ? (
        <EmptyState
          icon={<Award className="w-10 h-10 text-slate-400" />}
          title={isBn ? "কোন শিক্ষার্থীর ফলাফল পাওয়া যায়নি" : "No Student Results Found"}
          description={
            isBn
              ? `কোন রেকর্ড পাওয়া যায় নি (${selectedClass === "All" ? "সকল শ্রেণী" : translateClass(selectedClass)}${showGroupFilter && selectedGroup !== "All" ? ` · ${selectedGroup === "Science" ? "বিজ্ঞান" : selectedGroup === "Business Studies" ? "ব্যবসায় শিক্ষা" : "মানবিক"}` : ""}${selectedSubject !== "All" ? ` · ${translateSubject(selectedSubject)}` : ""})`
              : `No student records found for ${selectedClass === "All" ? "all classes" : `Class ${selectedClass}`}${showGroupFilter && selectedGroup !== "All" ? ` (${selectedGroup})` : ""}${selectedSubject !== "All" ? ` · ${selectedSubject}` : ""}.`
          }
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">{isBn ? "অবস্থান" : "Position"}</TableHead>
                <TableHead>{isBn ? "শিক্ষার্থীর নাম" : "Student Name"}</TableHead>
                <TableHead>{isBn ? "শিক্ষার্থী আইডি" : "Student ID"}</TableHead>
                <TableHead>{isBn ? "শ্রেণী" : "Class"}</TableHead>
                <TableHead>{isBn ? "মোট অর্জিত নম্বর" : "Total Cumulative Marks"}</TableHead>
                <TableHead>{isBn ? "শতাংশ নম্বর" : "Percentage Mark"}</TableHead>
                <TableHead className="text-right">{isBn ? "পারফরম্যান্স গ্রেড" : "Performance Grade"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((st) => {
                let badgeBg = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
                let crownIcon = null;

                if (st.positionInClass === 1) {
                  badgeBg = "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20";
                  crownIcon = <Crown className="h-3.5 w-3.5 inline mr-1 text-amber-100" />;
                } else if (st.positionInClass === 2) {
                  badgeBg = "bg-slate-400 text-white font-bold shadow-md shadow-slate-400/20";
                  crownIcon = <Medal className="h-3.5 w-3.5 inline mr-1 text-slate-100" />;
                } else if (st.positionInClass === 3) {
                  badgeBg = "bg-amber-700 text-white font-bold shadow-md shadow-amber-700/20";
                  crownIcon = <Medal className="h-3.5 w-3.5 inline mr-1 text-amber-200" />;
                }

                let gradeLabel = isBn ? "সন্তোষজনক (C)" : "Satisfactory (C)";
                let gradeClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/70 dark:border-amber-800/70";

                if (st.avgPercentage >= 90) {
                  gradeLabel = isBn ? "অসাধারণ (A+)" : "Outstanding (A+)";
                  gradeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/70 dark:border-emerald-800/70";
                } else if (st.avgPercentage >= 80) {
                  gradeLabel = isBn ? "উৎকৃষ্ট (A)" : "Excellent (A)";
                  gradeClass = "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-300/70 dark:border-teal-800/70";
                } else if (st.avgPercentage >= 70) {
                  gradeLabel = isBn ? "ভাল (B)" : "Good (B)";
                  gradeClass = "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300/70 dark:border-blue-800/70";
                } else if (st.avgPercentage >= 60) {
                  gradeLabel = isBn ? "সন্তোষজনক (C)" : "Satisfactory (C)";
                  gradeClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/70 dark:border-amber-800/70";
                } else if (st.avgPercentage >= 50) {
                  gradeLabel = isBn ? "গড়ের নিচে (D)" : "Below Average (D)";
                  gradeClass = "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300/70 dark:border-orange-800/70";
                } else {
                  gradeLabel = isBn ? "উন্নতি প্রয়োজন (F)" : "Needs Improvement (F)";
                  gradeClass = "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300/70 dark:border-rose-800/70";
                }

                return (
                  <TableRow key={st.studentNumber || st.studentId}>
                    {/* Position */}
                    <TableCell>
                      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-extrabold ${badgeBg}`}>
                        {crownIcon}
                        #{toBanglaDigits(st.positionInClass)}
                      </span>
                    </TableCell>

                    {/* Student Name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={st.studentName} className="h-9 w-9 text-xs font-bold" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {translateUserName(st.studentName)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {isBn ? "শিক্ষার্থী অ্যাকাউন্ট" : "Student Account"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Student ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {toBanglaDigits(st.studentNumber)}
                      </span>
                    </TableCell>

                    {/* Class */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="default" className="font-medium">
                          {translateClass(st.classLevel)}
                        </Badge>
                        {st.classLevel >= 9 && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${
                              st.group?.toLowerCase().includes("business") || st.group?.toLowerCase().includes("commerce")
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : st.group?.toLowerCase().includes("humanities") || st.group?.toLowerCase().includes("arts")
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                            }`}
                          >
                            {isBn ? (st.group?.toLowerCase().includes("business") || st.group?.toLowerCase().includes("commerce") ? "ব্যবসায় শিক্ষা" : st.group?.toLowerCase().includes("humanities") || st.group?.toLowerCase().includes("arts") ? "মানবিক" : "বিজ্ঞান") : (st.group || "Science")}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Cumulative Marks */}
                    <TableCell>
                      <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {toBanglaDigits(st.totalMarks.toFixed(2))} {st.totalMaxMarks > 0 ? `/ ${toBanglaDigits(st.totalMaxMarks.toFixed(2))}` : ""}
                      </span>
                    </TableCell>

                    {/* Percentage Mark */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                          {toBanglaDigits(st.avgPercentage.toFixed(2))}%
                        </span>
                        <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.avgPercentage >= 85
                                ? "bg-emerald-500"
                                : st.avgPercentage >= 75
                                ? "bg-teal-500"
                                : st.avgPercentage >= 65
                                ? "bg-blue-500"
                                : st.avgPercentage >= 55
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, st.avgPercentage))}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Performance Grade */}
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-extrabold border ${gradeClass}`}>
                        {gradeLabel}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showRange
            pageSize={pageSize}
            totalItems={filteredResults.length}
            className="pt-3"
          />
        </div>
      )}
    </div>
  );
}

