import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  AssignmentDetail,
  AssignmentListItem,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from "@/types/assignment";
import { PagedResult, PaginationQuery } from "@/types/api";

export const assignmentService = {
  async getAssignments(query?: PaginationQuery): Promise<PagedResult<AssignmentListItem>> {
    const response = await apiClient.get<PagedResult<AssignmentListItem>>(API_ENDPOINTS.ASSIGNMENTS.BASE, {
      params: query,
    });
    return response.data;
  },

  async getAssignmentById(id: number | string): Promise<AssignmentDetail> {
    const response = await apiClient.get<AssignmentDetail>(API_ENDPOINTS.ASSIGNMENTS.BY_ID(id));
    return response.data;
  },

  async createAssignment(data: CreateAssignmentRequest): Promise<AssignmentDetail> {
    const response = await apiClient.post<AssignmentDetail>(API_ENDPOINTS.ASSIGNMENTS.BASE, data);
    return response.data;
  },

  async updateAssignment(id: number | string, data: UpdateAssignmentRequest): Promise<AssignmentDetail> {
    const response = await apiClient.put<AssignmentDetail>(API_ENDPOINTS.ASSIGNMENTS.BY_ID(id), data);
    return response.data;
  },

  async publishAssignment(id: number | string): Promise<AssignmentDetail> {
    const response = await apiClient.post<AssignmentDetail>(API_ENDPOINTS.ASSIGNMENTS.PUBLISH(id));
    return response.data;
  },

  async saveDraft(id: number | string): Promise<AssignmentDetail> {
    const response = await apiClient.post<AssignmentDetail>(API_ENDPOINTS.ASSIGNMENTS.DRAFT(id));
    return response.data;
  },

  async deleteAssignment(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ASSIGNMENTS.BY_ID(id));
  },

  async getAllAssignments(): Promise<AssignmentListItem[]> {
    const all: AssignmentListItem[] = [];
    let pageNumber = 1;

    while (pageNumber <= 20) {
      const response = await apiClient.get<PagedResult<AssignmentListItem>>(API_ENDPOINTS.ASSIGNMENTS.BASE, {
        params: { pageNumber, pageSize: 100 },
      });

      all.push(...response.data.items);

      if (!response.data.hasNextPage) break;
      pageNumber += 1;
    }

    return all;
  },
};
