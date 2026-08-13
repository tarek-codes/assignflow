# Functional Requirements
## AssignFlow — Assignment & Submission Management System

**Live Demo:** [https://assignflow-bd.vercel.app/](https://assignflow-bd.vercel.app/)  
**Repository:** [https://github.com/tarek-codes/assignflow](https://github.com/tarek-codes/assignflow)

---

## 1. Authentication & Authorization

| ID | Requirement |
|----|-------------|
| FR-1.1 | Users must log in with email and password to access the system. |
| FR-1.2 | The system must issue a JWT on successful login, containing the user's role. |
| FR-1.3 | The system must enforce role-based access control (Admin, Teacher, Student) on every protected API endpoint. |
| FR-1.4 | Unauthorized or unauthenticated requests to protected endpoints must be rejected with an appropriate error (401/403). |
| FR-1.5 | Passwords must be stored hashed, never in plain text. |

---

## 2. Admin

| ID | Requirement |
|----|-------------|
| FR-2.1 | Admin can create, update, deactivate/delete user accounts (Admin, Teacher, Student). |
| FR-2.2 | Admin can create, update, and delete classes/courses. |
| FR-2.3 | Admin can create, update, and delete subjects. |
| FR-2.4 | Admin can assign a subject to a class/course. |
| FR-2.5 | Admin can assign a teacher to a specific class-subject combination. |
| FR-2.6 | Admin can view all assignments created by any teacher, across all classes/subjects. |
| FR-2.7 | Admin can view all student submissions across the system. |
| FR-2.8 | Admin can manage application-level settings (e.g. system configuration values), as applicable. |

---

## 3. Teacher

| ID | Requirement |
|----|-------------|
| FR-3.1 | Teacher can create an assignment only for a class-subject combination they are assigned to. |
| FR-3.2 | Assignment creation must capture: title, description, deadline, maximum marks. |
| FR-3.3 | Teacher can save an assignment as a draft (not visible to students) or publish it (visible to students). |
| FR-3.4 | Teacher can update or delete an assignment they created, subject to business rules (e.g. restrictions after submissions exist — document the chosen rule). |
| FR-3.5 | Teacher can view the list of submissions for each of their assignments. |
| FR-3.6 | Teacher can open an individual student submission and assign marks (not exceeding the assignment's maximum marks) and written feedback. |
| FR-3.6a | Teacher can view a submitted PDF inline on the site (in-browser preview) without needing to download it first. |
| FR-3.6b | Teacher can download the original submitted file (PDF or DOCX) at any time. |
| FR-3.6c | For DOCX submissions, since in-browser preview is not guaranteed, the system must at minimum provide download; inline preview for DOCX is optional (document the chosen approach in the README). |
| FR-3.7 | Teacher can update the status of a submission (e.g. Pending, Reviewed, Graded). |
| FR-3.8 | Teacher cannot view or modify assignments/submissions belonging to class-subjects they are not assigned to. |

---

## 4. Student

| ID | Requirement |
|----|-------------|
| FR-4.1 | Student can view only published assignments belonging to their own class/course. |
| FR-4.2 | Student can view full assignment details: title, description, deadline, maximum marks. |
| FR-4.3 | Student can submit an assignment answer as a file attachment (PDF or DOCX) before its deadline. |
| FR-4.4 | Student can replace their submitted file before the deadline, if resubmission is permitted for that assignment. |
| FR-4.5 | The system must prevent submission or resubmission after the deadline has passed. |
| FR-4.5a | The system must validate uploaded files by type (PDF/DOCX only) and enforce a maximum file size. |
| FR-4.6 | Student can view their own submission status, marks obtained, and teacher feedback once graded. |
| FR-4.7 | Student cannot view other students' submissions, marks, or feedback. |

---

## 5. Cross-Cutting / System Rules

| ID | Requirement |
|----|-------------|
| FR-5.1 | All API endpoints must validate input and return structured error responses for invalid data. |
| FR-5.2 | The system must log errors and significant actions (e.g. submission created, marks assigned) for traceability. |
| FR-5.3 | API must be documented via Swagger/OpenAPI. |
| FR-5.4 | Deadline enforcement (submission cutoff) must be evaluated server-side, not trusted from the client. |
| FR-5.5 | A draft assignment must never be retrievable by a Student via any endpoint. |
| FR-5.6 | Marks assigned to a submission must not exceed the assignment's defined maximum marks. |
| FR-5.7 | Uploaded submission files must be stored securely (e.g. cloud/blob storage or server-side storage outside the public web root) and served only to authorized users (the submitting student, their teacher, and Admin). |
| FR-5.8 | File access endpoints must enforce the same role/ownership checks as other submission data (a student must not be able to access another student's file). |

---