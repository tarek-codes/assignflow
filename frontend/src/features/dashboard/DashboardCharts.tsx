"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/utils/cn";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

const cardBase =
  "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md";

function CardHeader({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  classFilter,
  onClassChange,
  subjectFilter,
  onSubjectChange,
  availableSubjects = [],
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badgeText?: string;
  classFilter?: string;
  onClassChange?: (cls: string) => void;
  subjectFilter?: string;
  onSubjectChange?: (subj: string) => void;
  availableSubjects?: string[];
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {badgeText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {badgeText}
          </span>
        )}

        {onClassChange && (
          <select
            value={classFilter || "all"}
            onChange={(e) => onClassChange(e.target.value)}
            className="text-xs font-semibold bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 outline-none cursor-pointer hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
          >
            <option value="all">All Classes</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        )}

        {onSubjectChange && (
          <select
            value={subjectFilter || "all"}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="text-xs font-semibold bg-violet-50/60 dark:bg-violet-950/30 border border-violet-300 dark:border-violet-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 outline-none cursor-pointer hover:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all max-w-[140px] truncate"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// Custom Glassmorphism Tooltip Component
function CustomTooltip({ active, payload, label, unit }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label || data.name}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color || data.fill || "#2563eb" }} />
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
            {data.value} {unit || ""}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BAR CHART: Assignments Created Per Month
// ─────────────────────────────────────────────────────────────────────────────
export function AssignmentsBarChart({
  data,
  classFilter,
  onClassChange,
  subjectFilter,
  onSubjectChange,
  availableSubjects = [],
}: {
  data: Record<string, number>;
  classFilter?: string;
  onClassChange?: (cls: string) => void;
  subjectFilter?: string;
  onSubjectChange?: (subj: string) => void;
  availableSubjects?: string[];
}) {
  const mounted = useHasMounted();
  const entries = Object.entries(data);

  const defaultData = [
    { month: "Jan 2026", count: 4 },
    { month: "Feb 2026", count: 8 },
    { month: "Mar 2026", count: 28 },
    { month: "Apr 2026", count: 32 },
    { month: "May 2026", count: 18 },
    { month: "Jun 2026", count: 20 },
  ];

  const standardMonths = ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"];
  const countsByMonth: Record<string, number> = {};
  if (entries.length > 0) {
    entries.forEach(([month, count]) => {
      countsByMonth[month] = count;
    });
  } else {
    defaultData.forEach((d) => {
      countsByMonth[d.month] = d.count;
    });
  }

  const chartData = standardMonths.map((m) => ({
    month: m,
    count: countsByMonth[m] || 0,
  }));
  const totalCreated = entries.length > 0
    ? entries.reduce((acc, [_, count]) => acc + count, 0)
    : chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className={cardBase}>
      <CardHeader
        title="Assignments Created"
        subtitle="Monthly assignment generation"
        icon={TrendingUp}
        badgeText={`${totalCreated} total`}
        classFilter={classFilter}
        onClassChange={onClassChange}
        subjectFilter={subjectFilter}
        onSubjectChange={onSubjectChange}
        availableSubjects={availableSubjects}
      />
      <div className="p-5">
        <div className="h-44 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="assignmentsBarColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }}
                  dy={6}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip unit="assignments" />} />
                <Bar
                  dataKey="count"
                  name="Assignments"
                  fill="url(#assignmentsBarColor)"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                  label={{
                    position: "top",
                    fill: "#1e293b",
                    fontSize: 11,
                    fontWeight: 700,
                    formatter: (val: number) => val > 0 ? val : "",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PIE CHART: Submission Status Distribution (4 Exact Categories with Percentages)
// ─────────────────────────────────────────────────────────────────────────────
const renderPieSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  if (!percent || percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-extrabold select-none pointer-events-none drop-shadow-md"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function SubmissionPieChart({
  data,
  classFilter,
  onClassChange,
  subjectFilter,
  onSubjectChange,
  availableSubjects = [],
}: {
  data: Record<string, number>;
  classFilter?: string;
  onClassChange?: (cls: string) => void;
  subjectFilter?: string;
  onSubjectChange?: (subj: string) => void;
  availableSubjects?: string[];
}) {
  const mounted = useHasMounted();

  // Normalize incoming backend keys to the required 4 categories:
  // On-Time Submission, Late Submission, Missing, Graded
  const onTimeCount = (data["Submitted"] ?? 0) + (data["On-Time Submission"] ?? 0);
  const lateCount = (data["Late"] ?? 0) + (data["Late Submission"] ?? 0);
  const missingCount = (data["NotSubmitted"] ?? 0) + (data["Missing"] ?? 0) + (data["UnderReview"] ?? 0);
  const gradedCount = data["Graded"] ?? 0;

  const rawSum = onTimeCount + lateCount + missingCount + gradedCount;

  const chartData = [
    { name: "On-Time Submission", value: onTimeCount, color: "#2563eb" },
    { name: "Late Submission", value: lateCount, color: "#f59e0b" },
    { name: "Missing", value: missingCount, color: "#ef4444" },
    { name: "Graded", value: gradedCount, color: "#10b981" },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cardBase}>
      <CardHeader
        title="Submission Status"
        subtitle="Overall distribution"
        icon={PieChartIcon}
        badgeText={`${total} total`}
        classFilter={classFilter}
        onClassChange={onClassChange}
        subjectFilter={subjectFilter}
        onSubjectChange={onSubjectChange}
        availableSubjects={availableSubjects}
      />

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="relative h-44 w-full flex items-center justify-center">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip unit="submissions" />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-2">
          {chartData.map((item, i) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center justify-between text-xs sm:text-sm p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                  <span className="font-extrabold text-xs" style={{ color: item.color }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MONTHLY PERFORMANCE HORIZONTAL BAR CHART WITH METRIC TABS
// ─────────────────────────────────────────────────────────────────────────────
import { Tabs } from "@/components/ui/Tabs";

type PerformanceMetricKey = "submissionRate" | "averageGrade" | "completionRate";

interface MetricConfig {
  label: string;
  unit: string;
  stroke: string;
  gradientId: string;
  gradientColor: string;
}

const METRIC_CONFIGS: Record<PerformanceMetricKey, MetricConfig> = {
  submissionRate: {
    label: "Submission Rate",
    unit: "%",
    stroke: "#2563eb",
    gradientId: "subRateGrad",
    gradientColor: "#2563eb",
  },
  averageGrade: {
    label: "Average Grade",
    unit: "%",
    stroke: "#10b981",
    gradientId: "avgGradeGrad",
    gradientColor: "#10b981",
  },
  completionRate: {
    label: "Completion Rate",
    unit: "%",
    stroke: "#8b5cf6",
    gradientId: "compRateGrad",
    gradientColor: "#8b5cf6",
  },
};

const DEFAULT_MONTHLY_PERFORMANCE = [
  { month: "Jan 2026", submissionRate: 82, averageGrade: 76, completionRate: 86 },
  { month: "Feb 2026", submissionRate: 86, averageGrade: 79, completionRate: 89 },
  { month: "Mar 2026", submissionRate: 90, averageGrade: 82, completionRate: 93 },
  { month: "Apr 2026", submissionRate: 88, averageGrade: 84, completionRate: 91 },
  { month: "May 2026", submissionRate: 93, averageGrade: 87, completionRate: 95 },
  { month: "Jun 2026", submissionRate: 96, averageGrade: 89, completionRate: 97 },
];

export function MonthlyPerformanceChart({
  data,
}: {
  data?: Array<{ month: string; submissionRate: number; averageGrade: number; completionRate: number }>;
}) {
  const mounted = useHasMounted();
  const [activeMetric, setActiveMetric] = useState<PerformanceMetricKey>("submissionRate");

  const chartData = data && data.length > 0 ? data : DEFAULT_MONTHLY_PERFORMANCE;
  const config = METRIC_CONFIGS[activeMetric];

  const latestValue = chartData[chartData.length - 1]?.[activeMetric] ?? 0;

  const metricTabs = [
    { id: "submissionRate", label: "Submission Rate %" },
    { id: "averageGrade", label: "Average Grade" },
    { id: "completionRate", label: "Completion Rate" },
  ];

  return (
    <div className={cardBase}>
      <CardHeader
        title="Monthly Performance"
        subtitle="Historical performance comparison"
        icon={TrendingUp}
        badgeText={`Latest: ${latestValue}%`}
      />

      <div className="p-5 space-y-4">
        {/* Metric Switcher Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs
            tabs={metricTabs}
            activeTab={activeMetric}
            onChange={(id) => setActiveMetric(id as PerformanceMetricKey)}
          />

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.stroke }} />
            <span>{config.label} ({config.unit})</span>
          </div>
        </div>

        {/* Recharts Horizontal Bar Chart */}
        <div className="h-44 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={config.gradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={config.gradientColor} stopOpacity={0.65} />
                    <stop offset="100%" stopColor={config.gradientColor} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }}
                  tickFormatter={(val) => `${val}%`}
                />
                <YAxis
                  type="category"
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                  width={70}
                />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Bar
                  dataKey={activeMetric}
                  name={config.label}
                  fill={`url(#${config.gradientId})`}
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
