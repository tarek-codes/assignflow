"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignmentService";
import { classService } from "@/services/classService";
import { dashboardService } from "@/services/dashboardService";
import { submissionService } from "@/services/submissionService";
import { userService } from "@/services/userService";
import { queryKeys } from "./queryKeys";

type QueryOptions = {
  enabled?: boolean;
};

export function useAllAssignments(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.assignments.all,
    queryFn: () => assignmentService.getAllAssignments(),
    enabled: options?.enabled ?? true,
  });
}

export function useAllSubmissions(scope: "all" | "mine" = "all", options?: QueryOptions) {
  return useQuery({
    queryKey: scope === "mine" ? queryKeys.submissions.mine : queryKeys.submissions.all,
    queryFn: () =>
      scope === "mine" ? submissionService.getMySubmissionsFull() : submissionService.getAllSubmissionsFull(),
    enabled: options?.enabled ?? true,
  });
}

export function useAllStudents(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.students.all,
    queryFn: () => userService.getAllStudents(),
    enabled: options?.enabled ?? true,
  });
}

export function useAllTeachers(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.teachers.all,
    queryFn: () => userService.getAllTeachers(),
    enabled: options?.enabled ?? true,
  });
}

export function useAllUsers(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => userService.getAllUsers(),
    enabled: options?.enabled ?? true,
  });
}

export function useAllClasses(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: () => classService.getAllClasses(),
    enabled: options?.enabled ?? true,
  });
}

export function useClassesPage(pageNumber = 1, pageSize = 100, options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.classes.page(pageNumber, pageSize),
    queryFn: async () => {
      const result = await classService.getClasses({ pageNumber, pageSize });
      return result.items;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useAdminDashboard(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: () => dashboardService.getAdminDashboard(),
    enabled: options?.enabled ?? true,
  });
}

export function useTeacherDashboard(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.dashboard.teacher,
    queryFn: () => dashboardService.getTeacherDashboard(),
    enabled: options?.enabled ?? true,
  });
}

export function useStudentDashboard(options?: QueryOptions) {
  return useQuery({
    queryKey: queryKeys.dashboard.student,
    queryFn: () => dashboardService.getStudentDashboard(),
    enabled: options?.enabled ?? true,
  });
}

export function useInvalidateDataCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAssignments: () => queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all }),
    invalidateSubmissions: () =>
      queryClient.invalidateQueries({
        queryKey: ["submissions"],
      }),
    invalidateClasses: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
    invalidateTeachers: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all }),
    invalidateStudents: () => queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
    invalidateDashboards: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    invalidateAllLists: () =>
      queryClient.invalidateQueries({
        predicate: (query) => {
          const root = query.queryKey[0];
          return ["assignments", "submissions", "classes", "students", "teachers", "users", "dashboard"].includes(
            root as string
          );
        },
      }),
  };
}
