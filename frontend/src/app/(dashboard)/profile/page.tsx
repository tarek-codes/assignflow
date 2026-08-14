"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Mail,
  Shield,
  User as UserIcon,
  BookOpen,
  Hash,
  CheckCircle2,
  Building2,
  KeyRound,
  GraduationCap,
  Lock,
  Camera,
  ShieldCheck,
  Award,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { AvatarCropModal } from "@/components/profile/AvatarCropModal";
import { Avatar } from "@/components/ui/Avatar";

export default function ProfilePage() {
  const { user, updateAvatar, removeAvatar } = useAuth();
  const { showToast } = useToast();
  const { language, t, translateUserName, translateSubject, translateClass, toBanglaDigits } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [studentDetails, setStudentDetails] = useState<{ studentNumber?: string; classLevel?: number; group?: string } | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<{ designation: string; subjects: string[] } | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, etc.)", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size should be less than 10MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setCropImageSrc(reader.result as string);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user?.role === "Student") {
      dashboardService
        .getStudentDashboard()
        .then((res) => {
          setStudentDetails({
            studentNumber: res.studentNumber,
            classLevel: res.classLevel || 9,
            group: res.group || "Science",
          });
        })
        .catch(() => setStudentDetails({ studentNumber: "BD-2026-001", classLevel: 9, group: "Science" }));
    } else if (user?.role === "Teacher") {
      dashboardService
        .getTeacherDashboard()
        .catch(() => null)
        .then((dashData) => {
          let des = "Senior Lecturer";
          let subList: string[] = [];

          if (dashData?.recentAssignments) {
            const extracted = Array.from(new Set(dashData.recentAssignments.map((a) => a.subjectName.trim()))).filter(Boolean);
            if (extracted.length > 0) subList = extracted;
          }

          if (subList.length === 0) {
            subList = ["Mathematics", "Physics", "Chemistry", "English"];
          }

          setTeacherDetails({
            designation: des,
            subjects: subList,
          });
        });
    }
  }, [user]);

  if (!user) return null;

  const isAdmin = user.role === "Admin";
  const isTeacher = user.role === "Teacher";
  const isStudent = user.role === "Student";
  const isBn = language === "bn";

  const showGroup = isStudent && (studentDetails?.classLevel ?? 9) >= 9 && studentDetails?.group && studentDetails.group !== "None";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(isBn ? "অনুগ্রহ করে পাসওয়ার্ডের সকল ঘর পূরণ করুন" : "Please fill in all password fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(isBn ? "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না" : "New password and confirm password do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast(isBn ? "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters long", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast(isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!" : "Password changed successfully!", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to change password";
      showToast(msg, "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl mx-auto my-auto space-y-6">
        {/* ─── PAGE TITLE ─── */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isBn ? "ব্যবহারকারী প্রোফাইল ও নিরাপত্তা" : "User Profile & Security"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? "ব্যক্তিগত অ্যাকাউন্ট বিবরণ এবং নিরাপত্তা পাসওয়ার্ড ব্যবস্থাপনা" : "Personal account details and security password management"}
            </p>
          </div>
          <div className="self-center sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{isBn ? "যাচাইকৃত অ্যাকাউন্ট" : "Verified Account"}</span>
          </div>
        </div>

        {/* ─── UNIFIED PROFILE CARD ─── */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
          {/* Header Row: Avatar + Name + Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            {/* Uploadable Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
                title="Click to upload profile picture"
              >
                <Avatar
                  name={user.fullName}
                  gender={user.gender}
                  isCurrentUser
                  size="xl"
                  className="w-full h-full border-0"
                />

                {/* ALWAYS-VISIBLE CAMERA BADGE */}
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-md group-hover:bg-blue-700 group-hover:scale-110 transition-all">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* ALWAYS-VISIBLE ACTION BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{user.avatarUrl ? (isBn ? "ছবি পরিবর্তন" : "Change Photo") : (isBn ? "ছবি আপলোড" : "Upload Photo")}</span>
                </button>

                {user.avatarUrl && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeAvatar();
                        showToast(isBn ? "প্রোফাইল ছবি সরানো হয়েছে" : "Profile picture removed", "info");
                      }}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                    >
                      {isBn ? "সরিয়ে ফেলুন" : "Remove"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name & Mail */}
            <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {translateUserName(user.fullName || "User")}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <Badge variant="primary" size="md">
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    {isAdmin ? t("roleSystemAdmin") : isTeacher ? t("navRoleTeacher") : t("navRoleStudent")}
                  </Badge>
                  {isTeacher && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                      <Award className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                      {isBn ? "সিনিয়র লেকচারার" : (teacherDetails?.designation || "Senior Lecturer")}
                    </span>
                  )}
                  {isStudent && (
                    <Badge variant="success" size="md">
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      {translateClass(studentDetails?.classLevel || 9)}
                    </Badge>
                  )}
                  {showGroup && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                      <GraduationCap className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-400" />
                      {isBn ? (studentDetails?.group === "Science" ? "বিজ্ঞান বিভাগ" : studentDetails?.group === "Commerce" ? "ব্যবসায় শিক্ষা" : "মানবিক বিভাগ") : studentDetails?.group}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            {/* Account Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {isBn ? "অ্যাকাউন্ট স্ট্যাটাস" : "Account Status"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isBn ? "সক্রিয়" : "Active"}
              </span>
            </div>

            {/* Portal Scope (for Admin) */}
            {isAdmin && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> {isBn ? "পোর্টাল স্কোপ" : "Portal Scope"}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? "সার্বিক প্রশাসক" : "Global Administrator"}
                </span>
              </div>
            )}

            {/* Designation (for Teacher) */}
            {isTeacher && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" /> {isBn ? "পদবী" : "Designation"}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? "সিনিয়র লেকচারার" : (teacherDetails?.designation || "Senior Lecturer")}
                </span>
              </div>
            )}

            {/* Student Specific ID */}
            {isStudent && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-400" /> {isBn ? "শিক্ষার্থী আইডি নম্বর" : "Student ID Number"}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {toBanglaDigits(studentDetails?.studentNumber || "BD-2026-001")}
                </span>
              </div>
            )}
          </div>

          {/* Subjects Taught List (for Teacher) */}
          {isTeacher && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{isBn ? "অ্যাসাইনকৃত পঠিত বিষয়সমূহ" : "Assigned Subjects Taught"}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {(teacherDetails?.subjects || ["Mathematics", "Physics", "Chemistry", "English"]).map((subject, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 shadow-2xs"
                  >
                    <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                    {translateSubject(subject)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── SECURITY CARD ─── */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isBn ? "নিরাপত্তা ও পাসওয়ার্ড ব্যবস্থাপনা" : "Security & Password Management"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBn ? "আপনার অ্যাকাউন্টের পাসওয়ার্ড আপডেট করুন" : "Update your account password"}
                </p>
              </div>
            </div>
            <Badge variant="warning" size="sm">
              {isBn ? "পাসওয়ার্ড নিরাপত্তা" : "Password Security"}
            </Badge>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            <Input
              label={isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={isBn ? "বর্তমান পাসওয়ার্ড দিন" : "Enter current password"}
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              className="h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800/50"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isBn ? "নতুন পাসওয়ার্ড দিন" : "Enter new password"}
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                className="h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800/50"
              />
              <Input
                label={isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isBn ? "নতুন পাসওয়ার্ডটি পুনরায় দিন" : "Confirm new password"}
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                className="h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800/50"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isChangingPassword ? (isBn ? "পাসওয়ার্ড আপডেট হচ্ছে..." : "Updating Password...") : (isBn ? "পাসওয়ার্ড আপডেট করুন" : "Update Password")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {cropImageSrc && (
        <AvatarCropModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onSave={(croppedBase64) => {
            updateAvatar(croppedBase64);
            setCropImageSrc(null);
            showToast(isBn ? "প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!" : "Profile picture updated successfully!", "success");
          }}
        />
      )}
    </div>
  );
}
