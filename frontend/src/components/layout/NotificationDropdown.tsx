"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, Trash2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { ROUTES } from "@/constants/routes";

export interface StudentNotificationItem {
  id: string;
  type: "due_soon" | "graded";
  title: string;
  message: string;
  link: string;
  timeLabel: string;
  urgent?: boolean;
}

export interface NotificationDropdownProps {
  variant?: "default" | "banner";
}

export function NotificationDropdown({ variant = "default" }: NotificationDropdownProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user || user.role !== "Student") return;

    try {
      const storedRead = localStorage.getItem(`student_read_notifs_${user.id}`);
      if (storedRead) setReadIds(JSON.parse(storedRead));

      const storedDel = localStorage.getItem(`student_deleted_notifs_${user.id}`);
      if (storedDel) setDeletedIds(JSON.parse(storedDel));
    } catch {}

    const loadNotifications = async () => {
      try {
        const roleKey = `settings_${user.id}`;

        // Check per-user settings (Default true unless explicitly "false")
        const dueRemindersEnabled = localStorage.getItem(`${roleKey}_due_reminder_12h`) !== "false";
        const gradeAlertsEnabled = localStorage.getItem(`${roleKey}_grade_alert`) !== "false";

        const res = await dashboardService.getStudentDashboard();
        const items: StudentNotificationItem[] = [];

        // 1. Check Due Soon (< 12 hours) if enabled for this user
        if (dueRemindersEnabled && res.upcomingAssignments) {
          const now = Date.now();
          res.upcomingAssignments.forEach((ass) => {
            const dueTime = new Date(ass.deadlineUtc).getTime();
            const diffMs = dueTime - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffMs > 0 && diffHours <= 12 && !ass.hasSubmitted) {
              const hoursLeft = Math.floor(diffHours);
              const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              items.push({
                id: `due_soon_${ass.assignmentId}`,
                type: "due_soon",
                title: "Urgent: Due Soon Alert",
                message: `"${ass.title}" (${ass.subjectName}) is due in ${hoursLeft > 0 ? `${hoursLeft}h ` : ""}${minsLeft}m!`,
                link: ROUTES.ASSIGNMENT_DETAILS(ass.assignmentId),
                timeLabel: `< ${hoursLeft > 0 ? `${hoursLeft}h ` : ""}${minsLeft}m left`,
                urgent: true,
              });
            }
          });
        }

        // 2. Check Graded Submissions if enabled for this user
        if (gradeAlertsEnabled && res.grades) {
          res.grades.forEach((g) => {
            items.push({
              id: `graded_${g.submissionId}`,
              type: "graded",
              title: "Submission Graded",
              message: `Your work for "${g.assignmentTitle}" was evaluated: ${g.marks}/${g.maxMarks} marks.`,
              link: ROUTES.SUBMISSION_DETAILS(g.submissionId),
              timeLabel: "Graded",
              urgent: false,
            });
          });
        }

        setNotifications(items);
      } catch {}
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || user.role !== "Student") return null;

  const activeNotifications = notifications.filter((n) => !deletedIds.includes(n.id));
  const unreadNotifications = activeNotifications.filter((n) => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const markAllAsRead = () => {
    const allIds = activeNotifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem(`student_read_notifs_${user.id}`, JSON.stringify(allIds));
  };

  const toggleRead = (id: string) => {
    let updated: string[];
    if (readIds.includes(id)) {
      updated = readIds.filter((item) => item !== id);
    } else {
      updated = [...readIds, id];
    }
    setReadIds(updated);
    localStorage.setItem(`student_read_notifs_${user.id}`, JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    localStorage.setItem(`student_deleted_notifs_${user.id}`, JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          variant === "banner"
            ? "relative p-2.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all focus:outline-none shadow-sm flex items-center justify-center shrink-0"
            : "relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        }
        title="Student Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={
              variant === "banner"
                ? "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-blue-600 animate-pulse"
                : "absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse"
            }
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${variant === "banner" ? "right-0" : "right-0"}`}>
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {activeNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                No notifications right now.
              </div>
            ) : (
              activeNotifications.map((notif) => {
                const isRead = readIds.includes(notif.id);
                return (
                  <div
                    key={notif.id}
                    className={`group relative flex items-start justify-between gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      !isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <Link
                      href={notif.link}
                      onClick={() => {
                        if (!isRead) toggleRead(notif.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 min-w-0 flex items-start gap-3"
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.type === "due_soon" ? (
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold ${notif.urgent ? "text-amber-700 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{notif.timeLabel}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </Link>

                    {/* INDIVIDUAL ACTION BUTTONS: MARK READ & DELETE */}
                    <div className="flex items-center gap-1 shrink-0 ml-1 self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleRead(notif.id);
                        }}
                        title={isRead ? "Mark as unread" : "Mark as read"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isRead
                            ? "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            : "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 hover:bg-blue-200"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        title="Delete notification"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
