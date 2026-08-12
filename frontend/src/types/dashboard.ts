import { AssignmentStatus } from "./assignment";
import { SubmissionStatus } from "./submission";

export interface RecentActivity {
  activityType: string;
  userName?: string;
  userRole?: string;
  description: string;
  timestampUtc: string;
}

export interface MonthlyPerformanceMetric {
  month: string;
  submissionRate: number;
  averageGrade: number;
  completionRate: number;
}

export interface AdminStatistics {
  usersByRole: Record<string, number>;
  assignmentsByStatus: Record<string, number>;
  submissionsByStatus: Record<string, number>;
  assignmentsCreatedPerMonth?: Record<string, number>;
  topSubjectsByAssignments?: Record<string, number>;
  classPerformance?: Record<string, number>;
  monthlyPerformance?: MonthlyPerformanceMetric[];
}

export interface AdminDashboardData {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalAssignments: number;
  totalSubmissions: number;
  latestActivities: RecentActivity[];
  statistics: AdminStatistics;
}

export interface TeacherAssignmentSummary {
  id: number;
  title: string;
  subjectName: string;
  classLevel: number;
  deadlineUtc: string;
  status: AssignmentStatus;
  submissionCount: number;
}

export interface PendingReviewSummary {
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  studentName: string;
  studentNumber: string;
  submittedAtUtc: string;
  status: SubmissionStatus;
}

export interface TeacherDashboardData {
  totalAssignments: number;
  totalPendingReviews: number;
  totalGraded: number;
  recentAssignments: TeacherAssignmentSummary[];
  pendingReviews: PendingReviewSummary[];
}

export interface StudentUpcomingAssignment {
  assignmentId: number;
  title: string;
  subjectName: string;
  classLevel?: number;
  description?: string;
  instructions?: string;
  createdAtUtc?: string;
  deadlineUtc: string;
  maxMarks: number;
  teacherName?: string;
  hasSubmitted: boolean;
}

export interface StudentSubmissionSummary {
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  submittedAtUtc: string;
  status: SubmissionStatus;
}

export interface StudentGradeSummary {
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  subjectName: string;
  marks: number;
  maxMarks: number;
  feedback?: string;
  gradedAtUtc: string;
}

export interface StudentDashboardData {
  studentName?: string;
  studentNumber?: string;
  classLevel?: number;
  group?: string;
  positionInClass?: number;
  totalUpcomingAssignments: number;
  totalSubmitted: number;
  totalPending: number;
  totalLate: number;
  totalGraded: number;
  upcomingAssignments: StudentUpcomingAssignment[];
  recentSubmissions: StudentSubmissionSummary[];
  grades: StudentGradeSummary[];
}
