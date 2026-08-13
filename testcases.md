# AssignFlow - Comprehensive Test Cases (100 Test Cases)

This document contains 100 comprehensive test cases covering all functional, architectural, security, and workflow requirements of the **AssignFlow Academic Portal**.

**Live Demo:** [https://assignflow-bd.vercel.app/](https://assignflow-bd.vercel.app/)  
**Repository:** [https://github.com/tarek-codes/assignflow](https://github.com/tarek-codes/assignflow)  
**API Base URL:** `https://assignflow-api-tq42.onrender.com/api`

---

## 1. Authentication & Authorization (TC-001 to TC-015)

### TC-001: Student Successful Login
- **Feature**: Authentication
- **Description**: Verify that a registered Student can log in with valid credentials and receive a valid JWT token.
- **Preconditions**: Student account exists and is active.
- **Steps**:
  1. Send `POST /api/auth/login` with valid student email and password.
  2. Inspect response payload.
- **Expected Result**: HTTP 200 OK returned with JWT access token, user role `Student`, and user details.

### TC-002: Teacher Successful Login
- **Feature**: Authentication
- **Description**: Verify that a registered Teacher can log in and obtain access to teacher endpoints.
- **Preconditions**: Teacher account exists.
- **Steps**: Send `POST /api/auth/login` with valid teacher credentials.
- **Expected Result**: HTTP 200 OK returned with role `Teacher`.

### TC-003: Administrator Successful Login
- **Feature**: Authentication
- **Description**: Verify that an Admin user can log in and obtain full system access permissions.
- **Preconditions**: Admin account exists (`admin@example.com`).
- **Steps**: Send `POST /api/auth/login` with admin credentials.
- **Expected Result**: HTTP 200 OK returned with role `Admin`.

### TC-004: Login Failure with Invalid Password
- **Feature**: Authentication Security
- **Description**: Verify login rejection when an incorrect password is provided.
- **Steps**: Send `POST /api/auth/login` with valid email and wrong password.
- **Expected Result**: HTTP 401 Unauthorized returned with error message "Invalid email or password."

### TC-005: Login Failure for Non-Existent User Email
- **Feature**: Authentication Security
- **Description**: Verify rejection when logging in with an email not present in the system.
- **Steps**: Send `POST /api/auth/login` with `unknown@assignflow.com`.
- **Expected Result**: HTTP 401 Unauthorized returned.

### TC-006: Inactive Account Login Prevention
- **Feature**: Account Status Control
- **Description**: Verify that soft-deleted / inactive accounts cannot log in.
- **Preconditions**: User account `IsActive = false`.
- **Steps**: Attempt login with inactive user credentials.
- **Expected Result**: HTTP 401 Unauthorized returned with message "Account is inactive."

### TC-007: JWT Token Refresh Endpoint
- **Feature**: Session Management
- **Description**: Verify that a valid refresh token yields a new JWT access token.
- **Steps**: Send `POST /api/auth/refresh-token` with valid RefreshToken string.
- **Expected Result**: HTTP 200 OK with new JWT access token and updated expiry.

### TC-008: Expired Refresh Token Rejection
- **Feature**: Session Security
- **Description**: Verify that an expired refresh token is rejected.
- **Steps**: Send `POST /api/auth/refresh-token` with an expired token.
- **Expected Result**: HTTP 401 Unauthorized.

### TC-009: User Logout Endpoint
- **Feature**: Authentication
- **Description**: Verify that calling logout revokes active user session claims.
- **Steps**: Send `POST /api/auth/logout` with Bearer token header.
- **Expected Result**: HTTP 200 OK with message "Logged out successfully."

### TC-010: Change Password with Valid Current Password
- **Feature**: Account Security
- **Description**: Verify that an authenticated user can change their password.
- **Steps**: Send `POST /api/auth/change-password` with correct current password and new valid password.
- **Expected Result**: HTTP 200 OK and password hash updated in DB.

### TC-011: Change Password Rejection on Incorrect Current Password
- **Feature**: Account Security
- **Description**: Verify rejection when providing an incorrect current password.
- **Steps**: Send `POST /api/auth/change-password` with invalid current password.
- **Expected Result**: HTTP 400 BadRequest or 401 Unauthorized.

### TC-012: Check Email Availability Endpoint
- **Feature**: User Onboarding
- **Description**: Verify email existence check returns `exists: true` for existing email.
- **Steps**: Send `GET /api/auth/check-email?email=admin@example.com`.
- **Expected Result**: HTTP 200 OK with JSON `{ "exists": true }`.

### TC-013: RBAC Enforce Admin Portal Endpoint Access
- **Feature**: Role Authorization
- **Description**: Verify that Student/Teacher tokens receive 403 Forbidden when calling Admin endpoints.
- **Steps**: Call `GET /api/dashboard/admin` with Student token.
- **Expected Result**: HTTP 403 Forbidden.

### TC-014: RBAC Enforce Teacher Class Creation Access
- **Feature**: Role Authorization
- **Description**: Verify that Student accounts cannot publish assignments.
- **Steps**: Call `POST /api/assignments` using a Student bearer token.
- **Expected Result**: HTTP 403 Forbidden.

### TC-015: Unauthenticated API Access Protection
- **Feature**: Endpoint Security
- **Description**: Verify that calling protected API endpoints without an Authorization header returns 401.
- **Steps**: Send `GET /api/assignments` without auth header.
- **Expected Result**: HTTP 401 Unauthorized.

---

## 2. User Directory & Account Management (TC-016 to TC-030)

### TC-016: Admin View All Users Directory with Pagination
- **Feature**: User Directory
- **Description**: Verify Admin can query users list with page number and page size.
- **Steps**: Send `GET /api/users?pageNumber=1&pageSize=10` as Admin.
- **Expected Result**: HTTP 200 OK returning `PagedResult<UserListItemDto>` with total count and 10 items.

### TC-017: Search User Directory by Keyword
- **Feature**: User Directory Search
- **Description**: Verify searching users by first name or last name keyword.
- **Steps**: Send `GET /api/users?searchTerm=Anisur`.
- **Expected Result**: HTTP 200 OK containing users matching "Anisur".

### TC-018: Filter User Directory by Role (Teacher)
- **Feature**: User Filtering
- **Description**: Verify filtering user directory specifically by role.
- **Steps**: Send `GET /api/users?role=Teacher`.
- **Expected Result**: HTTP 200 OK with only Teacher users in result set.

### TC-019: Filter User Directory by Gender (Female)
- **Feature**: User Filtering
- **Description**: Verify filtering users by Gender attribute.
- **Steps**: Send `GET /api/users?gender=Female`.
- **Expected Result**: HTTP 200 OK with female users only.

### TC-020: Get Detailed User Profile by ID
- **Feature**: User Management
- **Description**: Verify retrieving single user details by user ID.
- **Steps**: Send `GET /api/users/1`.
- **Expected Result**: HTTP 200 OK with user ID, name, email, phone, role, and active status.

### TC-021: Create New User Account Manually by Admin
- **Feature**: User Provisioning
- **Description**: Verify Admin can create a new user account with specified role.
- **Steps**: Send `POST /api/users` with valid `CreateUserRequestDto`.
- **Expected Result**: HTTP 201 Created / 200 OK with new User ID.

### TC-022: Prevent Duplicate Email User Creation
- **Feature**: Data Integrity
- **Description**: Verify rejection when creating a user with an existing email address.
- **Steps**: Send `POST /api/users` using `admin@example.com`.
- **Expected Result**: HTTP 409 Conflict with message "Email already exists."

### TC-023: Update User Profile Info
- **Feature**: User Management
- **Description**: Verify updating user's first name, last name, and phone.
- **Steps**: Send `PUT /api/users/2` with updated profile payload.
- **Expected Result**: HTTP 200 OK with updated profile information.

### TC-024: Deactivate User Account (Soft Delete)
- **Feature**: User Deletion
- **Description**: Verify soft deleting a user updates `IsActive = false`.
- **Steps**: Send `DELETE /api/users/5`.
- **Expected Result**: HTTP 200 OK and target user `IsActive` set to false in DB.

### TC-025: Prevent Self-Deletion of Active Admin Account
- **Feature**: System Guardrail
- **Description**: Verify currently logged-in Admin cannot soft-delete their own account.
- **Steps**: Admin user sends `DELETE /api/users/{CurrentAdminId}`.
- **Expected Result**: HTTP 400 BadRequest or 409 Conflict.

### TC-026: Admin Approve Pending Registration Queue
- **Feature**: Registration Approval Workflow
- **Description**: Verify Admin can approve a pending account registration request.
- **Steps**: Send `POST /api/users/15/approve` as Admin.
- **Expected Result**: HTTP 200 OK and account status updated to Approved/Active.

### TC-027: Admin Reject Pending Registration Request
- **Feature**: Registration Approval Workflow
- **Description**: Verify Admin can reject a registration request with reason.
- **Steps**: Send `POST /api/users/16/reject` with rejection note.
- **Expected Result**: HTTP 200 OK and registration marked as rejected.

### TC-028: View Pending Registrations List
- **Feature**: Admin Dashboard
- **Description**: Verify retrieving pending user registration queue items.
- **Steps**: Send `GET /api/users/pending`.
- **Expected Result**: HTTP 200 OK with list of pending user accounts.

### TC-029: Get Teachers Directory with Subject Specializations
- **Feature**: Directory Insights
- **Description**: Verify teacher list includes assigned teaching subjects.
- **Steps**: Send `GET /api/teachers`.
- **Expected Result**: HTTP 200 OK returning teachers with assigned subject IDs and names.

### TC-030: Get Students Directory Filtered by Class Level
- **Feature**: Directory Insights
- **Description**: Verify filtering student directory by Class Level 10.
- **Steps**: Send `GET /api/students?classLevel=10`.
- **Expected Result**: HTTP 200 OK returning Class 10 students.

---

## 3. Classroom & Curriculum Management (TC-031 to TC-045)

### TC-031: Create New Classroom (Class 10 Physics)
- **Feature**: Classroom Management
- **Description**: Verify creating a new classroom mapping Class Level, Subject, and Teacher.
- **Steps**: Send `POST /api/classes` with `ClassLevel = 10`, `SubjectId = 5`, `TeacherId = 2`.
- **Expected Result**: HTTP 200 OK / 201 Created with new Class ID.

### TC-032: Prevent Duplicate Class Level & Subject Combination
- **Feature**: Curriculum Validation
- **Description**: Verify rejection when creating a classroom with duplicate level and subject.
- **Steps**: Send `POST /api/classes` with an existing `(ClassLevel, SubjectId)` pair.
- **Expected Result**: HTTP 409 Conflict with message "Class level and subject combination already exists."

### TC-033: Create Classroom Rejection for Non-Existent Subject ID
- **Feature**: Foreign Key Integrity
- **Description**: Verify rejection when assigning an invalid subject ID.
- **Steps**: Send `POST /api/classes` with `SubjectId = 9999`.
- **Expected Result**: HTTP 404 NotFound with message "Subject does not exist."

### TC-034: Create Classroom Rejection for Non-Existent Teacher ID
- **Feature**: Foreign Key Integrity
- **Description**: Verify rejection when assigning an invalid teacher ID.
- **Steps**: Send `POST /api/classes` with `TeacherId = 9999`.
- **Expected Result**: HTTP 404 NotFound with message "Teacher does not exist."

### TC-035: View All Classrooms with Pagination
- **Feature**: Classroom Directory
- **Description**: Verify retrieving paged classrooms list.
- **Steps**: Send `GET /api/classes?pageNumber=1&pageSize=10`.
- **Expected Result**: HTTP 200 OK with paged classrooms list.

### TC-036: Filter Classrooms by Class Grade (Class 11)
- **Feature**: Curriculum Filtering
- **Description**: Verify filtering classrooms list for Class 11.
- **Steps**: Send `GET /api/classes?classLevel=11`.
- **Expected Result**: HTTP 200 OK returning Class 11 classrooms only.

### TC-037: Filter Classrooms by Teacher User ID
- **Feature**: Teacher Portal
- **Description**: Verify teacher views only their assigned classrooms.
- **Steps**: Authenticate as Teacher (UserId = 42) and send `GET /api/classes`.
- **Expected Result**: HTTP 200 OK with classrooms assigned to Teacher 42.

### TC-038: Get Single Classroom Detail by ID
- **Feature**: Classroom Management
- **Description**: Verify retrieving classroom details including Subject, Teacher, and enrolled counts.
- **Steps**: Send `GET /api/classes/1`.
- **Expected Result**: HTTP 200 OK with classroom details.

### TC-039: Enroll Student into Classroom
- **Feature**: Enrollment Management
- **Description**: Verify enrolling a student into a classroom.
- **Steps**: Send `POST /api/classes/1/students` with `StudentId = 10`.
- **Expected Result**: HTTP 200 OK and StudentClass mapping record created.

### TC-040: Prevent Duplicate Student Classroom Enrollment
- **Feature**: Enrollment Integrity
- **Description**: Verify rejection when enrolling a student already in the classroom.
- **Steps**: Send `POST /api/classes/1/students` with an already enrolled `StudentId`.
- **Expected Result**: HTTP 409 Conflict / 400 BadRequest.

### TC-041: Disenroll Student from Classroom
- **Feature**: Enrollment Management
- **Description**: Verify removing a student from a classroom.
- **Steps**: Send `DELETE /api/classes/1/students/10`.
- **Expected Result**: HTTP 200 OK and StudentClass mapping removed.

### TC-042: View Enrolled Students List for Classroom
- **Feature**: Classroom Insights
- **Description**: Verify retrieving list of students enrolled in a specific classroom.
- **Steps**: Send `GET /api/classes/1/students`.
- **Expected Result**: HTTP 200 OK returning list of enrolled students.

### TC-043: Update Classroom Teacher Assignment
- **Feature**: Classroom Management
- **Description**: Verify reassigning a classroom to a different teacher.
- **Steps**: Send `PUT /api/classes/1/teacher` with new `TeacherId`.
- **Expected Result**: HTTP 200 OK with updated teacher info.

### TC-044: Deactivate Classroom
- **Feature**: Classroom Lifecycle
- **Description**: Verify setting `IsActive = false` on a classroom.
- **Steps**: Send `PATCH /api/classes/1/status` with `isActive = false`.
- **Expected Result**: HTTP 200 OK.

### TC-045: Delete Classroom Entity
- **Feature**: Classroom Deletion
- **Description**: Verify deleting an existing classroom.
- **Steps**: Send `DELETE /api/classes/99` for a class with no active submissions.
- **Expected Result**: HTTP 200 OK.

---

## 4. Subject Directory & Curriculum Mapping (TC-046 to TC-055)

### TC-046: View All Subjects Directory
- **Feature**: Subject Management
- **Description**: Verify retrieving all subjects list with subject codes and names.
- **Steps**: Send `GET /api/subjects`.
- **Expected Result**: HTTP 200 OK with list of subjects (e.g. BEN101, ENG101, PHY201).

### TC-047: Search Subjects by Code or Name
- **Feature**: Subject Search
- **Description**: Verify searching subject list by "Mathematics" keyword.
- **Steps**: Send `GET /api/subjects?searchTerm=Mathematics`.
- **Expected Result**: HTTP 200 OK containing General Mathematics and Higher Mathematics.

### TC-048: Filter Subjects by Higher Secondary Stream (Science)
- **Feature**: Stream Filtering
- **Description**: Verify filtering subjects for Class 9-12 Science stream.
- **Steps**: Send `GET /api/subjects?group=Science`.
- **Expected Result**: HTTP 200 OK with Physics, Chemistry, Biology, Higher Math.

### TC-049: Create New Subject Entity
- **Feature**: Subject Creation
- **Description**: Verify creating a new subject with unique code.
- **Steps**: Send `POST /api/subjects` with `SubjectName = "Statistics"`, `SubjectCode = "STAT301"`.
- **Expected Result**: HTTP 201 Created / 200 OK with new Subject ID.

### TC-050: Prevent Duplicate Subject Code Creation
- **Feature**: Subject Code Integrity
- **Description**: Verify rejection when creating a subject with existing subject code.
- **Steps**: Send `POST /api/subjects` using `SubjectCode = "PHY201"`.
- **Expected Result**: HTTP 409 Conflict with message "Subject code already exists."

### TC-051: Prevent Duplicate Subject Name Creation
- **Feature**: Subject Name Integrity
- **Description**: Verify rejection when creating a subject with existing subject name.
- **Steps**: Send `POST /api/subjects` using `SubjectName = "Physics"`.
- **Expected Result**: HTTP 409 Conflict with message "Subject name already exists."

### TC-052: Get Single Subject Details by ID
- **Feature**: Subject Management
- **Description**: Verify retrieving detailed subject entity by ID.
- **Steps**: Send `GET /api/subjects/1`.
- **Expected Result**: HTTP 200 OK with subject name, code, description.

### TC-053: Update Subject Details
- **Feature**: Subject Management
- **Description**: Verify updating subject name and description.
- **Steps**: Send `PUT /api/subjects/1` with updated fields.
- **Expected Result**: HTTP 200 OK.

### TC-054: Delete Subject Without Assigned Classes
- **Feature**: Subject Deletion
- **Description**: Verify deleting an unassigned subject.
- **Steps**: Send `DELETE /api/subjects/{UnassignedSubjectId}`.
- **Expected Result**: HTTP 200 OK.

### TC-055: Prevent Deleting Subject Assigned to Active Classes
- **Feature**: Relational Integrity
- **Description**: Verify rejection when attempting to delete a subject assigned to classrooms.
- **Steps**: Send `DELETE /api/subjects/1` (assigned to Class 10 Physics).
- **Expected Result**: HTTP 409 Conflict with message "Subject cannot be deleted because it is assigned to one or more classes."

---

## 5. Assignment Lifecycle & Creation (TC-056 to TC-075)

### TC-056: Teacher Create Assignment for Assigned Classroom
- **Feature**: Assignment Creation
- **Description**: Verify teacher can create an assignment for a classroom they teach.
- **Preconditions**: Teacher owns target classroom.
- **Steps**: Send `POST /api/assignments` with valid `CreateAssignmentRequestDto`.
- **Expected Result**: HTTP 201 Created / 200 OK with new Assignment ID and status `Draft`.

### TC-057: Prevent Assignment Creation for Non-Owned Classroom
- **Feature**: Ownership Authorization
- **Description**: Verify teacher cannot create assignment for another teacher's classroom.
- **Steps**: Teacher 1 sends `POST /api/assignments` targeting Teacher 2's classroom.
- **Expected Result**: HTTP 403 Forbidden.

### TC-058: Assignment Creation Validation for Empty Title
- **Feature**: Payload Validation
- **Description**: Verify rejection when assignment title is empty.
- **Steps**: Send `POST /api/assignments` with `Title = ""`.
- **Expected Result**: HTTP 400 BadRequest.

### TC-059: Assignment Creation Validation for Max Marks Boundary
- **Feature**: Payload Validation
- **Description**: Verify assignment max marks must be within valid range (20 to 50 / 100).
- **Steps**: Send `POST /api/assignments` with `MaxMarks = -5`.
- **Expected Result**: HTTP 400 BadRequest.

### TC-060: Assignment Attachment File Upload (PDF)
- **Feature**: Multi-File Support
- **Description**: Verify attaching a PDF instruction document to an assignment.
- **Steps**: Upload `assignment_guide.pdf` via `POST /api/assignments/{id}/attachment`.
- **Expected Result**: HTTP 200 OK with stored file URL.

### TC-061: Assignment Attachment File Extension Validation
- **Feature**: File Upload Security
- **Description**: Verify rejection of unsupported executable file attachments (.exe).
- **Steps**: Upload `virus.exe` to assignment attachment endpoint.
- **Expected Result**: HTTP 400 BadRequest with message "Invalid file extension."

### TC-062: Assignment Attachment File Size Limit Enforcement
- **Feature**: Storage Security
- **Description**: Verify rejection of files exceeding maximum size (10MB).
- **Steps**: Upload 25MB file attachment.
- **Expected Result**: HTTP 400 BadRequest with file size error.

### TC-063: Save Assignment as Draft
- **Feature**: Assignment Lifecycle
- **Description**: Verify assignment created with `PublishImmediately = false` stays in `Draft`.
- **Steps**: Send `POST /api/assignments` with draft flag.
- **Expected Result**: HTTP 200 OK with `Status = AssignmentStatus.Draft`.

### TC-064: Update Draft Assignment Content
- **Feature**: Assignment Editing
- **Description**: Verify modifying title, instructions, and deadline of a draft assignment.
- **Steps**: Send `PUT /api/assignments/5` as owning teacher.
- **Expected Result**: HTTP 200 OK with updated details.

### TC-065: Publish Draft Assignment to Enrolled Students
- **Feature**: Assignment Publishing
- **Description**: Verify transitioning assignment status from `Draft` to `Published`.
- **Steps**: Send `POST /api/assignments/5/publish` as owning teacher.
- **Expected Result**: HTTP 200 OK with `Status = AssignmentStatus.Published`.

### TC-066: Prevent Publishing Assignment with Past Deadline
- **Feature**: Deadline Validation
- **Description**: Verify rejection when publishing an assignment whose deadline is in the past.
- **Steps**: Set assignment deadline to `DateTime.UtcNow.AddHours(-1)` and call publish.
- **Expected Result**: HTTP 409 Conflict with message "Deadline must be in the future."

### TC-067: Prevent Publishing Assignment with Zero Max Marks
- **Feature**: Score Validation
- **Description**: Verify rejection when publishing assignment with `MaxMarks = 0`.
- **Steps**: Call publish on assignment with `MaxMarks = 0`.
- **Expected Result**: HTTP 409 Conflict with message "Max marks must be greater than zero."

### TC-068: Configure Allow Resubmission Policy Flag
- **Feature**: Submission Policy
- **Description**: Verify setting `AllowResubmission = false` for strict quizzes.
- **Steps**: Create assignment with `AllowResubmission = false`.
- **Expected Result**: HTTP 200 OK with `AllowResubmission = false`.

### TC-069: View Published Assignments for Enrolled Student
- **Feature**: Student Portal
- **Description**: Verify student sees published assignments for their enrolled classes.
- **Steps**: Authenticate as Student and send `GET /api/assignments`.
- **Expected Result**: HTTP 200 OK returning published assignments.

### TC-070: Student Cannot View Draft Assignments
- **Feature**: Privacy Guardrail
- **Description**: Verify draft assignments are hidden from students.
- **Steps**: Student sends `GET /api/assignments` when a draft assignment exists.
- **Expected Result**: Draft assignment absent from student response list.

### TC-071: View Upcoming Assignments Sorted by Deadline
- **Feature**: Task Planning
- **Description**: Verify student tasks sorted by nearest upcoming deadline.
- **Steps**: Send `GET /api/assignments/upcoming`.
- **Expected Result**: HTTP 200 OK sorted by `DeadlineUtc` ascending.

### TC-072: Filter Assignments by Class Level & Subject
- **Feature**: Filtering
- **Description**: Verify filtering assignments for Class 10 Physics.
- **Steps**: Send `GET /api/assignments?classLevel=10&subjectId=5`.
- **Expected Result**: HTTP 200 OK with matching assignments.

### TC-073: Search Assignments by Keyword
- **Feature**: Search
- **Description**: Verify searching assignments by keyword "Midterm".
- **Steps**: Send `GET /api/assignments?searchTerm=Midterm`.
- **Expected Result**: HTTP 200 OK.

### TC-074: Get Single Assignment Detail by ID
- **Feature**: Assignment View
- **Description**: Verify retrieving complete assignment details.
- **Steps**: Send `GET /api/assignments/1`.
- **Expected Result**: HTTP 200 OK with title, max marks, deadline, instructions, attachments.

### TC-075: Delete Assignment Entity
- **Feature**: Assignment Deletion
- **Description**: Verify teacher owner can delete an assignment.
- **Steps**: Send `DELETE /api/assignments/10` as owning teacher.
- **Expected Result**: HTTP 200 OK.

---

## 6. Student Submissions & Deadline Policies (TC-076 to TC-090)

### TC-076: Student Submit Assignment Before Deadline
- **Feature**: Student Submission
- **Description**: Verify student submitting text and solution file before deadline.
- **Preconditions**: Student enrolled in classroom, assignment published and active.
- **Steps**: Send `POST /api/assignments/1/submissions` with text and `solution.pdf`.
- **Expected Result**: HTTP 200 OK with submission status `Submitted`.

### TC-077: Prevent Submission for Non-Enrolled Classroom
- **Feature**: Enrollment Authorization
- **Description**: Verify student cannot submit work for a class they are not enrolled in.
- **Steps**: Non-enrolled student sends `POST /api/assignments/1/submissions`.
- **Expected Result**: HTTP 403 Forbidden with message "You are not enrolled in this class."

### TC-078: Submission File Format Validation (.pdf, .docx)
- **Feature**: File Security
- **Description**: Verify accepting valid document extensions (.pdf, .docx, .png, .jpg).
- **Steps**: Upload `homework.pdf`.
- **Expected Result**: HTTP 200 OK file uploaded successfully.

### TC-079: Resubmit Assignment Before Deadline (AllowResubmission = true)
- **Feature**: Resubmission Policy
- **Description**: Verify student can replace submission prior to deadline when allowed.
- **Steps**: Send new file to `POST /api/assignments/1/submissions` before deadline.
- **Expected Result**: HTTP 200 OK updating submission file and timestamp.

### TC-080: Prevent Resubmission When Policy Disabled (AllowResubmission = false)
- **Feature**: Resubmission Policy
- **Description**: Verify resubmission rejection when assignment policy disables it.
- **Preconditions**: Assignment `AllowResubmission = false` and student already submitted.
- **Steps**: Attempt second submission to `POST /api/assignments/1/submissions`.
- **Expected Result**: HTTP 409 Conflict with message "Resubmission is not allowed for this assignment."

### TC-081: Handle Late Submission After Deadline (AllowResubmission = true)
- **Feature**: Deadline Policy
- **Description**: Verify submission accepted after deadline is marked with status `Late`.
- **Steps**: Submit work when `DateTime.UtcNow > DeadlineUtc`.
- **Expected Result**: HTTP 200 OK with `Status = SubmissionStatus.Late`.

### TC-082: Missing Submission Automatic Status Handling (AllowResubmission = false)
- **Feature**: Strict Deadline Policy
- **Description**: Verify student who misses strict deadline receives `Status = Missing` and 0 marks.
- **Steps**: Query submission status for non-submitter after strict deadline.
- **Expected Result**: `Status = SubmissionStatus.Missing` and `Marks = 0`.

### TC-083: Student View Own Submission Status & Feedback
- **Feature**: Student View
- **Description**: Verify student can view their submission status, uploaded file, and teacher feedback.
- **Steps**: Send `GET /api/assignments/1/my-submission` as student.
- **Expected Result**: HTTP 200 OK with submission details.

### TC-084: Teacher View Received Submissions List for Assignment
- **Feature**: Evaluation Interface
- **Description**: Verify teacher can view all student submissions for an assignment.
- **Steps**: Send `GET /api/assignments/1/submissions` as owning teacher.
- **Expected Result**: HTTP 200 OK with submissions list.

### TC-085: Filter Submissions by Status (Pending, Graded, Late)
- **Feature**: Evaluation Filtering
- **Description**: Verify filtering submissions list by `Submitted` status.
- **Steps**: Send `GET /api/assignments/1/submissions?status=Submitted`.
- **Expected Result**: HTTP 200 OK with submitted but ungraded items.

### TC-086: Download Student Submission File Stream
- **Feature**: Document Viewer
- **Description**: Verify retrieving file stream of student's uploaded solution.
- **Steps**: Send `GET /api/submissions/10/file` as authorized teacher.
- **Expected Result**: HTTP 200 OK with `Content-Type: application/pdf` file stream.

### TC-087: Prevent Unauthorized User from Downloading Submission File
- **Feature**: Data Privacy
- **Description**: Verify student cannot download another student's submission file.
- **Steps**: Student 1 requests `GET /api/submissions/{Student2SubmissionId}/file`.
- **Expected Result**: HTTP 403 Forbidden.

### TC-088: Inline Document Preview Header Check
- **Feature**: Inline Document Viewer
- **Description**: Verify file response header sets `Content-Disposition: inline`.
- **Steps**: Send `GET /api/submissions/10/file?inline=true`.
- **Expected Result**: Response header contains `inline`.

### TC-089: Submission Count Metrics Check (e.g., 13/15 Turned In)
- **Feature**: Teacher Dashboard
- **Description**: Verify submission counts calculated accurately for classroom.
- **Steps**: Query submission statistics for assignment.
- **Expected Result**: `SubmittedCount = 13`, `TotalStudents = 15`.

### TC-090: Re-upload Submission File Before Deadline Replacement
- **Feature**: File Replacement
- **Description**: Verify previous storage file is replaced upon new resubmission.
- **Steps**: Resubmit new PDF file for active assignment.
- **Expected Result**: HTTP 200 OK and old file replaced in storage.

---

## 7. Grading, Feedback & Marks Calculation (TC-091 to TC-100)

### TC-091: Teacher Grade Submission with Valid Score & Feedback
- **Feature**: Submission Grading
- **Description**: Verify teacher grading a submission with score and written notes.
- **Preconditions**: Teacher owns assignment classroom.
- **Steps**: Send `POST /api/submissions/1/grade` with `Marks = 45`, `Feedback = "Great work!"`.
- **Expected Result**: HTTP 200 OK with `Status = SubmissionStatus.Graded`.

### TC-092: Prevent Grading by Non-Assigned Teacher
- **Feature**: Grading Authorization
- **Description**: Verify teacher cannot grade submissions for classes taught by others.
- **Steps**: Unassigned teacher sends `POST /api/submissions/1/grade`.
- **Expected Result**: HTTP 403 Forbidden.

### TC-093: Grade Validation for Negative Score
- **Feature**: Score Boundary
- **Description**: Verify rejection when marks are less than zero.
- **Steps**: Send `POST /api/submissions/1/grade` with `Marks = -10`.
- **Expected Result**: HTTP 400 BadRequest / 409 Conflict.

### TC-094: Grade Validation Exceeding Maximum Marks
- **Feature**: Score Boundary
- **Description**: Verify rejection when assigned score exceeds `MaxMarks`.
- **Preconditions**: Assignment `MaxMarks = 50`.
- **Steps**: Send `POST /api/submissions/1/grade` with `Marks = 55`.
- **Expected Result**: HTTP 409 Conflict with message "Marks cannot exceed maximum assignment marks."

### TC-095: Automatic Percentage Marks Calculation
- **Feature**: Evaluation Engine
- **Description**: Verify auto-calculation of percentage score.
- **Preconditions**: Score 40 out of MaxMarks 50.
- **Steps**: Grade submission with 40/50.
- **Expected Result**: Percentage calculated as `80.0%`.

### TC-096: Automatic Grade Tier Tiering (A+ down to F)
- **Feature**: Evaluation Engine
- **Description**: Verify percentage mapped to performance grade tiers:
  - `90% - 100%`: A+
  - `80% - 89%`: A
  - `70% - 79%`: B
  - `60% - 69%`: C
  - `50% - 59%`: D
  - `< 50%`: F
- **Steps**: Grade submission with score yielding 92%.
- **Expected Result**: Grade tier set to `A+`.

### TC-097: Update Existing Grade Score & Feedback
- **Feature**: Regrading
- **Description**: Verify teacher modifying previously entered grade score and comments.
- **Steps**: Send updated `Marks = 48` to `POST /api/submissions/1/grade`.
- **Expected Result**: HTTP 200 OK with updated score 48 and recalculated grade tier `A+`.

### TC-098: Student View Performance Breakdown & Teacher Notes
- **Feature**: Student Gradebook
- **Description**: Verify student viewing evaluated score, percentage, tier, and feedback.
- **Steps**: Authenticate as Student and send `GET /api/student/grades`.
- **Expected Result**: HTTP 200 OK displaying full grade breakdown.

### TC-099: System Dashboard Summary Overview Metrics Computation
- **Feature**: System Analytics
- **Description**: Verify system-wide overview metrics calculation (Total Users, Assignments, Submissions, Average Grade).
- **Steps**: Authenticate as Admin and send `GET /api/dashboard/admin`.
- **Expected Result**: HTTP 200 OK with correct aggregated metrics.

### TC-100: Monthly Assignment Creation Trends & Heatmaps Analytics
- **Feature**: System Analytics
- **Description**: Verify monthly assignment creation trends and grade distribution data.
- **Steps**: Send `GET /api/dashboard/monthly-assignments` as Admin.
- **Expected Result**: HTTP 200 OK returning monthly counts (Feb to Aug 2026) and position heatmaps.
