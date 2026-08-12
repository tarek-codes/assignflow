import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  GradeSubmissionRequest,
  SubmissionDetail,
  SubmissionListItem,
  SubmitAssignmentRequest,
  UpdateSubmissionStatusRequest,
} from "@/types/submission";
import { PagedResult, PaginationQuery } from "@/types/api";

export const submissionService = {
  async submitOrReplace(assignmentId: number | string, data: SubmitAssignmentRequest): Promise<SubmissionDetail> {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.submissionText) {
      formData.append("submissionText", data.submissionText);
    }

    const response = await apiClient.post<SubmissionDetail>(
      API_ENDPOINTS.SUBMISSIONS.SUBMIT_OR_REPLACE(assignmentId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  async getMySubmission(assignmentId: number | string): Promise<SubmissionDetail | null> {
    try {
      const response = await apiClient.get<SubmissionDetail>(API_ENDPOINTS.SUBMISSIONS.MY_SUBMISSION(assignmentId));
      return response.data;
    } catch {
      return null;
    }
  },

  async getMySubmissions(query?: PaginationQuery): Promise<PagedResult<SubmissionListItem>> {
    const response = await apiClient.get<PagedResult<SubmissionListItem>>(API_ENDPOINTS.SUBMISSIONS.MY_SUBMISSIONS, {
      params: query,
    });
    return response.data;
  },

  async getMySubmissionsFull(): Promise<SubmissionListItem[]> {
    const all: SubmissionListItem[] = [];
    let pageNumber = 1;

    while (pageNumber <= 20) {
      const response = await apiClient.get<PagedResult<SubmissionListItem>>(API_ENDPOINTS.SUBMISSIONS.MY_SUBMISSIONS, {
        params: { pageNumber, pageSize: 100 },
      });

      all.push(...response.data.items);

      if (!response.data.hasNextPage) break;
      pageNumber += 1;
    }

    return all;
  },

  async getAllSubmissions(query?: PaginationQuery): Promise<PagedResult<SubmissionListItem>> {
    const response = await apiClient.get<PagedResult<SubmissionListItem>>("/submissions", {
      params: query,
    });
    return response.data;
  },

  async getAllSubmissionsFull(): Promise<SubmissionListItem[]> {
    const all: SubmissionListItem[] = [];
    let pageNumber = 1;

    try {
      while (pageNumber <= 10) {
        const response = await apiClient.get<PagedResult<SubmissionListItem>>("/submissions", {
          params: { pageNumber, pageSize: 1000 },
        });

        if (!response.data?.items || response.data.items.length === 0) break;
        all.push(...response.data.items);

        if (!response.data.hasNextPage) break;
        pageNumber += 1;
      }
    } catch (err) {
      console.error("Failed to fetch all submissions full:", err);
    }

    return all;
  },

  async getSubmissionsForAssignment(
    assignmentId: number | string,
    query?: PaginationQuery
  ): Promise<PagedResult<SubmissionListItem>> {
    const response = await apiClient.get<PagedResult<SubmissionListItem>>(
      API_ENDPOINTS.SUBMISSIONS.FOR_ASSIGNMENT(assignmentId),
      { params: query }
    );
    return response.data;
  },

  async getSubmissionById(id: number | string): Promise<SubmissionDetail> {
    const response = await apiClient.get<SubmissionDetail>(API_ENDPOINTS.SUBMISSIONS.BY_ID(id));
    return response.data;
  },

  async gradeSubmission(id: number | string, data: GradeSubmissionRequest): Promise<SubmissionDetail> {
    const response = await apiClient.post<SubmissionDetail>(API_ENDPOINTS.SUBMISSIONS.GRADE(id), data);
    return response.data;
  },

  async updateStatus(id: number | string, data: UpdateSubmissionStatusRequest): Promise<SubmissionDetail> {
    const response = await apiClient.patch<SubmissionDetail>(API_ENDPOINTS.SUBMISSIONS.UPDATE_STATUS(id), data);
    return response.data;
  },

  getPreviewUrl(id: number | string): string {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return `${baseUrl}${API_ENDPOINTS.SUBMISSIONS.PREVIEW(id)}?token=${encodeURIComponent(token || "")}`;
  },

  getDownloadUrl(id: number | string): string {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return `${baseUrl}${API_ENDPOINTS.SUBMISSIONS.DOWNLOAD(id)}?token=${encodeURIComponent(token || "")}`;
  },
};
