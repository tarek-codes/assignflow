export type AssignmentStatus = "Draft" | "Published" | "Closed";

export interface AssignmentListItem {
  id: number;
  classId: number;
  subjectName: string;
  classLevel: number;
  teacherName?: string;
  title: string;
  description?: string;
  deadlineUtc: string;
  maxMarks: number;
  status: AssignmentStatus;
  allowResubmission: boolean;
  createdAtUtc?: string;
}

export interface AssignmentDetail extends AssignmentListItem {
  instructions?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CreateAssignmentRequest {
  classId: number;
  title: string;
  description?: string;
  instructions?: string;
  deadlineUtc: string;
  maxMarks: number;
  allowResubmission: boolean;
}

export interface UpdateAssignmentRequest extends CreateAssignmentRequest {}
