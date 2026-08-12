# Technical Requirements
## Assignment & Submission Management System

---

## 1. Architecture Overview

| ID | Requirement |
|----|-------------|
| TR-1.1 | The system follows a decoupled architecture: a Next.js v16.3.0 / React 19.2.8 / TypeScript 7.0.2 frontend consuming a RESTful ASP.NET Core 10.0.10 Web API backend. |
| TR-1.2 | The backend follows a layered architecture (e.g. Controllers → Services → Repositories/DbContext), separating concerns cleanly. |
| TR-1.3 | The system is built backend-first: database schema, API, and business rules are implemented and tested before frontend integration. |

---

## 2. Backend

| ID | Requirement |
|----|-------------|
| TR-2.1 | Backend implemented in C# using ASP.NET Core 10.0.10 Web API. |
| TR-2.2 | Data access via Entity Framework Core, using a Code-First approach with migrations. |
| TR-2.3 | All endpoints follow REST conventions (proper HTTP verbs, status codes, resource-based routing). |
| TR-2.4 | Request payloads are validated using model validation (data annotations or FluentValidation), returning consistent 400-level error responses on failure. |
| TR-2.5 | Centralized exception handling middleware returns structured, consistent error responses. |
| TR-2.6 | Structured logging (e.g. Serilog or built-in ILogger) is implemented for key actions and errors. |
| TR-2.7 | API is documented via Swagger/OpenAPI, with endpoints grouped logically and JWT auth support in the Swagger UI. |
| TR-2.8 | Business rules (deadline checks, mark limits, role restrictions) are enforced in the service layer, not left to the frontend. |

---

## 3. Database

| ID | Requirement |
|----|-------------|
| TR-3.1 | PostgreSQL 18.4 is used as the relational database. |
| TR-3.2 | Core entities: User, Role, Class-Subject, Assignment, Submission. |
| TR-3.3 | Relationships (e.g. one class has many subjects, one teacher can be assigned to many class-subjects, one assignment has many submissions) are enforced via foreign keys and EF Core relationship configuration. |
| TR-3.4 | Migrations are included in the repository so the schema can be created from scratch via `dotnet ef database update`. |
| TR-3.5 | Seed data is provided for at least: 3 Admin, 15 Teachers, 100 Students, 30 class-subject, and 5 sample assignment. |
| TR-3.6 | Submission file metadata (filename, storage path/URL, file type, uploaded timestamp) is stored in the database; the binary/file itself is stored in file storage, not as a DB blob (documented in README if a different approach is chosen). |

---

## 4. File Storage (Submissions)

| ID | Requirement |
|----|-------------|
| TR-4.1 | Uploaded files (PDF/DOCX) are stored outside the public web root, or in cloud storage (e.g. local disk folder for dev, or a cloud bucket), not directly browsable. |
| TR-4.2 | File download/preview endpoints stream the file through the backend, applying authorization checks before serving it. |
| TR-4.3 | Only PDF and DOCX MIME types/extensions are accepted on upload; other types are rejected server-side (not just client-side). |
| TR-4.4 | A maximum file size limit is enforced server-side (e.g. 10MB), configurable via app settings. |
| TR-4.5 | PDF files are served in a way that supports inline browser preview (correct `Content-Type: application/pdf` and `Content-Disposition: inline` for preview vs `attachment` for download). |

---

## 5. Frontend

| ID | Requirement |
|----|-------------|
| TR-5.1 | Built with Next.js v16.3.0, React 19.2.8, and TypeScript 7.0.2. |
| TR-5.2 | Responsive UI, usable on both desktop and mobile viewports. |
| TR-5.3 | Client-side form validation mirrors backend validation rules (e.g. required fields, deadline format, max marks range). |
| TR-5.4 | API integration via a typed HTTP client (e.g. Axios/fetch wrapper) with centralized error handling. |
| TR-5.5 | JWT is stored securely (e.g. httpOnly cookie or secure storage strategy documented in README) and attached to authenticated requests. |
| TR-5.6 | Route/page access is restricted by role on the client in addition to backend enforcement (UI should not expose actions a role cannot perform). |
| TR-5.7 | PDF submissions render in an in-browser viewer component (e.g. `<iframe>`/PDF.js-based viewer) on the teacher's submission review page. |
| TR-5.8 | A download button/link is available for every submission file (PDF and DOCX) on the teacher's submission review page. |

---

## 6. Authentication & Security

| ID | Requirement |
|----|-------------|
| TR-6.1 | JWT-based authentication; tokens include user ID and role claims. |
| TR-6.2 | Passwords hashed using a strong algorithm (e.g. BCrypt/ASP.NET Core Identity's default hasher). |
| TR-6.3 | Role-based authorization enforced via `[Authorize(Roles = "...")]` or policy-based authorization on backend endpoints. |
| TR-6.4 | CORS is configured to allow only the frontend's origin(s). |
| TR-6.5 | Sensitive configuration (DB connection strings, JWT secret, storage keys) is kept out of source control via environment variables, with an `.env.example`/`appsettings.Example.json` provided. |
| TR-6.6 | Endpoints that access or return submission files validate that the requester owns the file or has a role entitled to view it (student = owner, teacher = assigned to that class-subject, admin = any). |

---

## 7. Testing

| ID | Requirement |
|----|-------------|
| TR-7.1 | Unit tests cover core business rules: deadline enforcement, mark-limit validation, role-based authorization logic, submission status transitions. |
| TR-7.2 | Tests use a mocking framework (e.g. Moq) and/or an in-memory/test database provider to isolate from the real PostgreSQL instance. |
| TR-7.3 | Test project is included in the repository and runnable via `dotnet test`, with instructions in the README. |

---


## 9. Out of Scope (unless added as optional enhancements)

- Real-time notifications
- Pagination and advanced filtering (optional per assignment brief)