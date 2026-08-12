import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { AdminDashboardData, StudentDashboardData, TeacherDashboardData } from "@/types/dashboard";

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await apiClient.get<AdminDashboardData>(API_ENDPOINTS.DASHBOARD.ADMIN);
    return response.data;
  },

  async getTeacherDashboard(): Promise<TeacherDashboardData> {
    const response = await apiClient.get<TeacherDashboardData>(API_ENDPOINTS.DASHBOARD.TEACHER);
    return response.data;
  },

  async getStudentDashboard(): Promise<StudentDashboardData> {
    const response = await apiClient.get<StudentDashboardData>(API_ENDPOINTS.DASHBOARD.STUDENT);
    return response.data;
  },
};
