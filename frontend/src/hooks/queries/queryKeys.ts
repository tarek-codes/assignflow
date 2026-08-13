export const queryKeys = {
  assignments: {
    all: ["assignments", "all"] as const,
    detail: (id: string | number) => ["assignments", "detail", id] as const,
  },
  submissions: {
    all: ["submissions", "all"] as const,
    mine: ["submissions", "mine"] as const,
    detail: (id: string | number) => ["submissions", "detail", id] as const,
  },
  users: {
    all: ["users", "all"] as const,
  },
  teachers: {
    all: ["teachers", "all"] as const,
  },
  students: {
    all: ["students", "all"] as const,
  },
  classes: {
    all: ["classes", "all"] as const,
    page: (pageNumber: number, pageSize: number) => ["classes", "page", pageNumber, pageSize] as const,
  },
  dashboard: {
    admin: ["dashboard", "admin"] as const,
    teacher: ["dashboard", "teacher"] as const,
    student: ["dashboard", "student"] as const,
  },
} as const;
