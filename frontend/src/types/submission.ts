export type SubmissionStatus =
  | "NotSubmitted"
  | "Submitted"
  | "Late"
  | "UnderReview"
  | "Graded"
  | "Missing";

export interface SubmissionListItem {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  classSubject?: string;
  subjectName?: string;
  classLevel?: number;
  studentId: number;
  studentUserId: number;
  studentName: string;
  studentNumber: string;
  submissionText?: string;
  fileUrl?: string;
  submittedAtUtc?: string;
  marks?: number;
  maxMarks: number;
  feedback?: string;
  status: SubmissionStatus;
  updatedAtUtc: string;
}

export interface SubmissionDetail extends SubmissionListItem {}

export interface SubmitAssignmentRequest {
  file: File;
  submissionText?: string;
}

export interface GradeSubmissionRequest {
  marks: number;
  feedback?: string;
  status?: SubmissionStatus;
}

export interface UpdateSubmissionStatusRequest {
  status: SubmissionStatus;
}
