import { apiClient } from "./apiClient";
import { PagedResult, PaginationQuery } from "@/types/api";

export interface UserListItem {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface TeacherListItem {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  designation?: string;
  gender?: string;
  taughtSubjects?: string[];
  assignedClassesCount?: number;
}

export interface StudentListItem {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  studentNumber: string;
  classLevel?: number;
  group?: string;
  gender?: string;
  enrolledClassesCount?: number;
}

const MAX_PAGE_SIZE = 100;
const MAX_PAGES_TO_FETCH = 20;

export const userService = {
  async getUsers(query?: PaginationQuery): Promise<PagedResult<UserListItem>> {
    const response = await apiClient.get<PagedResult<UserListItem>>("/users", { params: query });
    return response.data;
  },

  async getAllUsers(): Promise<UserListItem[]> {
    const all: UserListItem[] = [];
    let pageNumber = 1;

    while (pageNumber <= MAX_PAGES_TO_FETCH) {
      const response = await apiClient.get<PagedResult<UserListItem>>("/users", {
        params: { pageNumber, pageSize: MAX_PAGE_SIZE },
      });

      all.push(...response.data.items);

      if (!response.data.hasNextPage) break;
      pageNumber += 1;
    }

    return all;
  },

  async getTeachers(query?: PaginationQuery): Promise<PagedResult<TeacherListItem>> {
    const response = await apiClient.get<PagedResult<TeacherListItem>>("/teachers", { params: query });
    return response.data;
  },

  /**
   * Fetches every teacher by paging through the API (backend caps pageSize at 100).
   * Useful for admin pickers that need the full teacher roster to filter client-side.
   */
  async getAllTeachers(): Promise<TeacherListItem[]> {
    const all: TeacherListItem[] = [];
    let pageNumber = 1;

    while (pageNumber <= MAX_PAGES_TO_FETCH) {
      const response = await apiClient.get<PagedResult<TeacherListItem>>("/teachers", {
        params: { pageNumber, pageSize: MAX_PAGE_SIZE },
      });

      all.push(...response.data.items);

      if (!response.data.hasNextPage) break;
      pageNumber += 1;
    }

    return all;
  },

  async getStudents(query?: PaginationQuery): Promise<PagedResult<StudentListItem>> {
    const response = await apiClient.get<PagedResult<StudentListItem>>("/students", { params: query });
    return response.data;
  },

  async getAllStudents(): Promise<StudentListItem[]> {
    const all: StudentListItem[] = [];
    let pageNumber = 1;

    while (pageNumber <= MAX_PAGES_TO_FETCH) {
      const response = await apiClient.get<PagedResult<StudentListItem>>("/students", {
        params: { pageNumber, pageSize: MAX_PAGE_SIZE },
      });

      all.push(...response.data.items);

      if (!response.data.hasNextPage) break;
      pageNumber += 1;
    }

    return all;
  },
};
