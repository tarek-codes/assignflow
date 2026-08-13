import React from "react";
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Laptop,
  Globe,
  BookText,
  HeartHandshake,
  Receipt,
  Coins,
  BookOpen,
  Binary,
  LucideIcon,
} from "lucide-react";

export type ClassSegmentKey = "all" | "primary" | "secondary" | "higher_secondary";

export interface ClassSegment {
  key: ClassSegmentKey;
  name: string;
  range: string;
  badgeBg: string;
  borderColor: string;
  description: string;
}

export function getClassSegment(level: number): ClassSegment {
  if (level >= 1 && level <= 5) {
    return {
      key: "primary",
      name: "Primary",
      range: "Class 1 - 5",
      badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      description: "Foundation elementary education",
    };
  }
  if (level >= 6 && level <= 10) {
    return {
      key: "secondary",
      name: "Secondary",
      range: "Class 6 - 10",
      badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60",
      borderColor: "border-blue-200 dark:border-blue-800",
      description: "Secondary school curriculum",
    };
  }
  return {
    key: "higher_secondary",
    name: "Higher Secondary",
    range: "Class 11 - 12",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "College preparatory advanced curriculum",
  };
}

export interface ClassLevelConfig {
  numberLabel: string;
  label: string;
  segment: ClassSegment;
  badgeBg: string;
  iconBg: string;
  hoverBorder: string;
  activeTabBg: string;
  textColor: string;
}

export function getClassLevelConfig(level: number): ClassLevelConfig {
  const segment = getClassSegment(level);

  switch (level) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return {
        numberLabel: `${level}`,
        label: `Class ${level}`,
        segment,
        badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
        iconBg: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300",
        hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-500/5",
        activeTabBg: "bg-emerald-600 text-white",
        textColor: "text-emerald-600 dark:text-emerald-400",
      };
    case 6:
      return {
        numberLabel: "6",
        label: "Class 6",
        segment,
        badgeBg: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60",
        iconBg: "bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/60 dark:text-teal-300",
        hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-teal-500/5",
        activeTabBg: "bg-teal-600 text-white",
        textColor: "text-teal-600 dark:text-teal-400",
      };
    case 7:
      return {
        numberLabel: "7",
        label: "Class 7",
        segment,
        badgeBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/60",
        iconBg: "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950/60 dark:text-violet-300",
        hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-violet-500/5",
        activeTabBg: "bg-violet-600 text-white",
        textColor: "text-violet-600 dark:text-violet-400",
      };
    case 8:
      return {
        numberLabel: "8",
        label: "Class 8",
        segment,
        badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
        iconBg: "bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950/60 dark:text-amber-300",
        hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-amber-500/5",
        activeTabBg: "bg-amber-600 text-white",
        textColor: "text-amber-600 dark:text-amber-400",
      };
    case 9:
      return {
        numberLabel: "9",
        label: "Class 9",
        segment,
        badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60",
        iconBg: "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/60 dark:text-blue-300",
        hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-blue-500/5",
        activeTabBg: "bg-blue-600 text-white",
        textColor: "text-blue-600 dark:text-blue-400",
      };
    case 10:
      return {
        numberLabel: "10",
        label: "Class 10",
        segment,
        badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
        iconBg: "bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-950/60 dark:text-rose-300",
        hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-rose-500/5",
        activeTabBg: "bg-rose-600 text-white",
        textColor: "text-rose-600 dark:text-rose-400",
      };
    case 11:
    case 12:
    default:
      return {
        numberLabel: `${level}`,
        label: `Class ${level}`,
        segment,
        badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60",
        iconBg: "bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-950/60 dark:text-purple-300",
        hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-purple-500/5",
        activeTabBg: "bg-purple-600 text-white",
        textColor: "text-purple-600 dark:text-purple-400",
      };
  }
}

export function SubjectLogo({ subjectName, className = "h-4 w-4" }: { subjectName: string; className?: string }) {
  const n = subjectName.toLowerCase();

  // English -> BookText / Language
  if (n.includes("eng")) {
    return <BookText className={className} />;
  }

  // Bangladesh and Global Studies (BGS) / Geography -> Globe
  if (n.includes("bgs") || n.includes("global") || n.includes("bangladesh") || n.includes("social") || n.includes("geog")) {
    return <Globe className={className} />;
  }

  // Bengali / Bangla -> Literature Book
  if (n.includes("bengali") || n.includes("bangla")) {
    return <BookOpen className={className} />;
  }

  if (n.includes("physics")) return <Atom className={className} />;
  if (n.includes("chem")) return <FlaskConical className={className} />;
  if (n.includes("bio")) return <Dna className={className} />;
  if (n.includes("ict") || n.includes("computer") || n.includes("info")) return <Laptop className={className} />;
  if (n.includes("higher math")) return <Binary className={className} />;
  if (n.includes("math")) return <Calculator className={className} />;
  if (n.includes("relig") || n.includes("moral") || n.includes("islam")) return <HeartHandshake className={className} />;
  if (n.includes("account")) return <Receipt className={className} />;
  if (n.includes("finan") || n.includes("bank") || n.includes("busin")) return <Coins className={className} />;

  return <BookOpen className={className} />;
}

export interface SubjectTheme {
  iconBg: string;
  cardBg: string;
  borderHover: string;
  badgeBg: string;
  textColor: string;
}

export function getSubjectTheme(subjectName: string, index: number = 0): SubjectTheme {
  const n = subjectName.toLowerCase();

  // 1. Physics -> Electric Royal Blue
  if (n.includes("physics")) {
    return {
      iconBg: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
      cardBg: "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80",
      borderHover: "hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-blue-500/15",
      badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200 border-blue-300 dark:border-blue-700",
      textColor: "text-blue-600 dark:text-blue-400",
    };
  }

  // 2. Chemistry -> Neon Lime / Bright Green
  if (n.includes("chem")) {
    return {
      iconBg: "bg-lime-600 text-white shadow-sm shadow-lime-600/30",
      cardBg: "bg-lime-50/60 dark:bg-lime-950/30 border-lime-200 dark:border-lime-800/80",
      borderHover: "hover:border-lime-500 dark:hover:border-lime-400 hover:shadow-lime-500/15",
      badgeBg: "bg-lime-100 text-lime-800 dark:bg-lime-900/80 dark:text-lime-200 border-lime-300 dark:border-lime-700",
      textColor: "text-lime-700 dark:text-lime-400",
    };
  }

  // 3. Biology -> Deep Emerald
  if (n.includes("bio")) {
    return {
      iconBg: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
      cardBg: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80",
      borderHover: "hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-emerald-500/15",
      badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
      textColor: "text-emerald-600 dark:text-emerald-400",
    };
  }

  // 4. ICT / Computer -> Crimson Red
  if (n.includes("ict") || n.includes("computer") || n.includes("info")) {
    return {
      iconBg: "bg-red-600 text-white shadow-sm shadow-red-600/30",
      cardBg: "bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800/80",
      borderHover: "hover:border-red-500 dark:hover:border-red-400 hover:shadow-red-500/15",
      badgeBg: "bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200 border-red-300 dark:border-red-700",
      textColor: "text-red-600 dark:text-red-400",
    };
  }

  // 5. Higher Mathematics -> Deep Violet
  if (n.includes("higher math")) {
    return {
      iconBg: "bg-violet-600 text-white shadow-sm shadow-violet-600/30",
      cardBg: "bg-violet-50/60 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/80",
      borderHover: "hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-violet-500/15",
      badgeBg: "bg-violet-100 text-violet-800 dark:bg-violet-900/80 dark:text-violet-200 border-violet-300 dark:border-violet-700",
      textColor: "text-violet-600 dark:text-violet-400",
    };
  }

  // 6. General Mathematics -> Amber Gold
  if (n.includes("math")) {
    return {
      iconBg: "bg-amber-600 text-white shadow-sm shadow-amber-600/30",
      cardBg: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80",
      borderHover: "hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-amber-500/15",
      badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 border-amber-300 dark:border-amber-700",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  }

  // 7. Bengali -> Fuchsia Pink
  if (n.includes("bengali") || n.includes("bangla")) {
    return {
      iconBg: "bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/30",
      cardBg: "bg-fuchsia-50/60 dark:bg-fuchsia-950/30 border-fuchsia-200 dark:border-fuchsia-800/80",
      borderHover: "hover:border-fuchsia-500 dark:hover:border-fuchsia-400 hover:shadow-fuchsia-500/15",
      badgeBg: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/80 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-700",
      textColor: "text-fuchsia-600 dark:text-fuchsia-400",
    };
  }

  // 8. English -> Sky Cyan
  if (n.includes("eng")) {
    return {
      iconBg: "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30",
      cardBg: "bg-cyan-50/60 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/80",
      borderHover: "hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-cyan-500/15",
      badgeBg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/80 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700",
      textColor: "text-cyan-600 dark:text-cyan-400",
    };
  }

  // 9. BGS / Bangladesh -> Teal
  if (n.includes("bgs") || n.includes("global") || n.includes("bangladesh") || n.includes("social")) {
    return {
      iconBg: "bg-teal-600 text-white shadow-sm shadow-teal-600/30",
      cardBg: "bg-teal-50/60 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/80",
      borderHover: "hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-teal-500/15",
      badgeBg: "bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200 border-teal-300 dark:border-teal-700",
      textColor: "text-teal-600 dark:text-teal-400",
    };
  }

  // 10. Religion -> Vibrant Orange
  if (n.includes("relig") || n.includes("moral") || n.includes("islam")) {
    return {
      iconBg: "bg-orange-600 text-white shadow-sm shadow-orange-600/30",
      cardBg: "bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/80",
      borderHover: "hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-orange-500/15",
      badgeBg: "bg-orange-100 text-orange-800 dark:bg-orange-900/80 dark:text-orange-200 border-orange-300 dark:border-orange-700",
      textColor: "text-orange-600 dark:text-orange-400",
    };
  }

  // 11. Accounting -> Coral Rose
  if (n.includes("account")) {
    return {
      iconBg: "bg-rose-500 text-white shadow-sm shadow-rose-500/30",
      cardBg: "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80",
      borderHover: "hover:border-rose-400 dark:hover:border-rose-400 hover:shadow-rose-500/15",
      badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200 border-rose-300 dark:border-rose-700",
      textColor: "text-rose-600 dark:text-rose-400",
    };
  }

  // 12. Finance & Banking -> Deep Indigo
  if (n.includes("finan") || n.includes("bank") || n.includes("busin")) {
    return {
      iconBg: "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30",
      cardBg: "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80",
      borderHover: "hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-indigo-500/15",
      badgeBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700",
      textColor: "text-indigo-600 dark:text-indigo-400",
    };
  }

  // Distinct fallback themes by index
  const fallbackThemes: SubjectTheme[] = [
    { iconBg: "bg-violet-600 text-white", cardBg: "bg-violet-50/60 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/80", borderHover: "hover:border-violet-400", badgeBg: "bg-violet-100 text-violet-800", textColor: "text-violet-600 dark:text-violet-400" },
    { iconBg: "bg-emerald-600 text-white", cardBg: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80", borderHover: "hover:border-emerald-400", badgeBg: "bg-emerald-100 text-emerald-800", textColor: "text-emerald-600 dark:text-emerald-400" },
    { iconBg: "bg-orange-600 text-white", cardBg: "bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/80", borderHover: "hover:border-orange-400", badgeBg: "bg-orange-100 text-orange-800", textColor: "text-orange-600 dark:text-orange-400" },
  ];

  return fallbackThemes[index % fallbackThemes.length];
}

export function canonicalizeSubjectName(rawName?: string): string {
  if (!rawName || !rawName.trim()) return "General";
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  const is1st = lower.includes("1st paper") || lower.includes("1st");
  const is2nd = lower.includes("2nd paper") || lower.includes("2nd");
  const paperSuffix = is1st ? " 1st Paper" : is2nd ? " 2nd Paper" : "";

  if (lower.includes("bangla") || lower.includes("bengali")) return `Bangla${paperSuffix}`;
  if (lower.includes("english")) return `English${paperSuffix}`;
  if (lower.includes("physics")) return `Physics${paperSuffix}`;
  if (lower.includes("chemistry")) return `Chemistry${paperSuffix}`;
  if (lower.includes("biology")) return `Biology${paperSuffix}`;
  if (lower.includes("accounting")) return `Accounting${paperSuffix}`;
  if (lower.includes("finance")) return `Finance and Banking${paperSuffix}`;
  if (lower.includes("higher math")) return `Higher Mathematics${paperSuffix}`;
  if (lower.includes("economics")) return `Economics${paperSuffix}`;

  if (lower === "math" || lower === "mathematics" || lower === "general mathematics") return "Mathematics";
  if (lower.includes("ict") || lower.includes("digital technology") || lower.includes("information and communication")) return "ICT";
  if (lower === "science" || lower === "general science") return "Science";

  return trimmed;
}

export function getCurriculumSubjectsForClass(classLevel: number, group?: string): string[] {
  let list: string[] = [];

  // Class 6, 7, 8
  if (classLevel >= 6 && classLevel <= 8) {
    list = [
      "Bangla",
      "English",
      "Mathematics",
      "Science",
      "Bangladesh and Global Studies",
      "ICT",
      "History and Social Science",
      "Life and Livelihood",
      "Arts and Culture",
      "Health Protection",
      "Religion",
    ];
  }
  // Class 9 & 10
  else if (classLevel === 9 || classLevel === 10) {
    const g = group?.toLowerCase().trim();
    if (g?.includes("business")) {
      list = [
        "Bangla",
        "English",
        "Mathematics",
        "Accounting",
        "Finance and Banking",
        "Business Entrepreneurship",
        "ICT",
        "Bangladesh and Global Studies",
        "Religion",
      ];
    } else if (g?.includes("humanities") || g?.includes("arts")) {
      list = [
        "Bangla",
        "English",
        "Mathematics",
        "History of Bangladesh and World Civilization",
        "Geography and Environment",
        "Economics",
        "Civics and Citizenship",
        "ICT",
        "Religion",
      ];
    } else {
      // Default to Science Group
      list = [
        "Bangla",
        "English",
        "Mathematics",
        "Higher Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "ICT",
        "Bangladesh and Global Studies",
        "Religion",
      ];
    }
  }
  // Class 11 & 12 (Includes 1st Paper and 2nd Paper as distinct subjects)
  else if (classLevel >= 11) {
    const g = group?.toLowerCase().trim();
    if (g?.includes("business")) {
      list = [
        "Bangla 1st Paper",
        "Bangla 2nd Paper",
        "English 1st Paper",
        "English 2nd Paper",
        "Accounting 1st Paper",
        "Accounting 2nd Paper",
        "Finance, Banking and Insurance 1st Paper",
        "Finance, Banking and Insurance 2nd Paper",
        "Business Organization and Management 1st Paper",
        "Business Organization and Management 2nd Paper",
        "Production Management & Marketing 1st Paper",
        "Production Management & Marketing 2nd Paper",
      ];
    } else if (g?.includes("humanities") || g?.includes("arts")) {
      list = [
        "Bangla 1st Paper",
        "Bangla 2nd Paper",
        "English 1st Paper",
        "English 2nd Paper",
        "History 1st Paper",
        "History 2nd Paper",
        "Civics & Good Governance 1st Paper",
        "Civics & Good Governance 2nd Paper",
        "Economics 1st Paper",
        "Economics 2nd Paper",
        "Geography 1st Paper",
        "Geography 2nd Paper",
      ];
    } else {
      // Default to Science Group
      list = [
        "Bangla 1st Paper",
        "Bangla 2nd Paper",
        "English 1st Paper",
        "English 2nd Paper",
        "Physics 1st Paper",
        "Physics 2nd Paper",
        "Chemistry 1st Paper",
        "Chemistry 2nd Paper",
        "Biology 1st Paper",
        "Biology 2nd Paper",
        "Higher Mathematics 1st Paper",
        "Higher Mathematics 2nd Paper",
      ];
    }

  } else {
    list = [
      "Bangla",
      "English",
      "Mathematics",
      "Science",
      "Bangladesh and Global Studies",
      "Religion",
    ];
  }

  const set = new Set(list.map((s) => canonicalizeSubjectName(s)));
  return Array.from(set);
}

export function getClassSolidBadge(level: number): string {
  switch (level) {
    case 1:
      return "bg-emerald-600 text-white font-semibold";
    case 2:
      return "bg-teal-600 text-white font-semibold";
    case 3:
      return "bg-cyan-600 text-white font-semibold";
    case 4:
      return "bg-sky-600 text-white font-semibold";
    case 5:
      return "bg-indigo-600 text-white font-semibold";
    case 6:
      return "bg-blue-600 text-white font-semibold";
    case 7:
      return "bg-violet-600 text-white font-semibold";
    case 8:
      return "bg-amber-600 text-white font-semibold";
    case 9:
      return "bg-orange-600 text-white font-semibold";
    case 10:
      return "bg-rose-600 text-white font-semibold";
    case 11:
      return "bg-purple-600 text-white font-semibold";
    case 12:
      return "bg-fuchsia-600 text-white font-semibold";
    default:
      return "bg-slate-600 text-white font-semibold";
  }
}
