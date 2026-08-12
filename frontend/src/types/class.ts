export interface ClassListItem {
  id: number;
  classLevel: number;
  subjectId: number;
  subjectName: string;
  subjectCode?: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  description?: string;
  isActive: boolean;
}

export interface AssignTeacherRequest {
  teacherId: number;
}
