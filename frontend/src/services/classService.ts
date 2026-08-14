import { apiClient } from "./apiClient";
import { ClassListItem, AssignTeacherRequest } from "@/types/class";
import { PagedResult, PaginationQuery } from "@/types/api";
import { invalidateCachedPrefix } from "@/hooks/useCachedData";

const MAX_PAGE_SIZE = 100;
const MAX_PAGES_TO_FETCH = 20;

export const classService = {
  async getClasses(query?: PaginationQuery): Promise<PagedResult<ClassListItem>> {
    const response = await apiClient.get<PagedResult<ClassListItem>>("/classes", { params: query });
    return response.data;
  },

  /**
   * Fetches every class-subject record by paging through the API.
   * The backend caps pageSize at 100, so this loops until all pages are collected.
   */
  async getAllClasses(): Promise<ClassListItem[]> {
    const all: ClassListItem[] = [];
    let pageNumber = 1;

    while (pageNumber <= MAX_PAGES_TO_FETCH) {
      const response = await apiClient.get<{
        items: ClassListItem[];
        hasNextPage: boolean;
      }>("/classes", { params: { pageNumber, pageSize: MAX_PAGE_SIZE } });

      all.push(...response.data.items);

      if (!response.data.hasNextPage) break;
      pageNumber += 1;
    }

    return all;
  },

  async assignTeacher(classId: number, data: AssignTeacherRequest): Promise<ClassListItem> {
    const response = await apiClient.patch<ClassListItem>(`/classes/${classId}/assign-teacher`, data);
    invalidateCachedPrefix("");
    return response.data;
  },
};
