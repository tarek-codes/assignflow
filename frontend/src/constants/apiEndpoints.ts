export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CHANGE_PASSWORD: "/auth/change-password",
    CHECK_EMAIL: "/auth/check-email",
    AVATAR: "/auth/avatar",
    ME: "/auth/me",
  },
  ASSIGNMENTS: {
    BASE: "/assignments",
    BY_ID: (id: number | string) => `/assignments/${id}`,
    PUBLISH: (id: number | string) => `/assignments/${id}/publish`,
    DRAFT: (id: number | string) => `/assignments/${id}/draft`,
  },
  SUBMISSIONS: {
    SUBMIT_OR_REPLACE: (assignmentId: number | string) => `/submissions/assignments/${assignmentId}`,
    MY_SUBMISSION: (assignmentId: number | string) => `/submissions/assignments/${assignmentId}/my-submission`,
    MY_SUBMISSIONS: "/submissions/my-submissions",
    FOR_ASSIGNMENT: (assignmentId: number | string) => `/submissions/assignments/${assignmentId}`,
    BY_ID: (id: number | string) => `/submissions/${id}`,
    GRADE: (id: number | string) => `/submissions/${id}/grade`,
    UPDATE_STATUS: (id: number | string) => `/submissions/${id}/status`,
    PREVIEW: (id: number | string) => `/submissions/${id}/preview`,
    DOWNLOAD: (id: number | string) => `/submissions/${id}/download`,
  },
  DASHBOARD: {
    ADMIN: "/dashboard/admin",
    TEACHER: "/dashboard/teacher",
    STUDENT: "/dashboard/student",
  },
} as const;
