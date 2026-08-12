# Assignment & Submission Management System

A decoupled assignment and submission management system for Admin, Teacher, and Student roles. The target architecture is a Next.js frontend consuming an ASP.NET Core Web API backend with PostgreSQL persistence, EF Core migrations, JWT authentication, and role-based access control.

This README is a living project document. Update it as features, structure, and setup instructions change during development.

## Current Status

- Requirements captured from the assignment brief
- Core architecture and data model documented
- Clean Architecture solution scaffold created under `src/`
- Demo credentials, ports, and exact run commands still need to be replaced with real project values

## Project Overview

The system supports the full lifecycle of assignments:

- Admins manage users, classes/courses, subjects, class-subject assignments, teacher allocations, and application settings.
- Teachers create, publish, draft, update, review, grade, and download student submissions for the class-subjects they are assigned to.
- Students view published assignments for their enrolled class/courses, upload PDF or DOCX submissions before the deadline, and review feedback and marks after grading.

The backend is responsible for all authorization, validation, deadline checks, file access checks, mark limits, and structured error handling. The frontend provides a responsive role-aware experience and mirrors key validation rules.

## How To Keep This README Updated

When you add or change implementation details, update the matching section below:

- Authentication changes: update Authentication & Authorization, Environment Configuration, and Security Notes
- Backend changes: update Technology Stack, Architecture, Setup Instructions, and Testing
- Database changes: update Database Model Summary and Database Setup
- File storage changes: update Cross-Cutting Rules, Security Notes, and Known Limitations
- Frontend changes: update Technology Stack, Repository Structure, and Running the Application
- New business rules: add them to Main Features and Assumptions if they are still undecided

## Main Features

### Authentication & Authorization
- Email/password login
- JWT-based authentication with role claims
- Role-based access control for Admin, Teacher, and Student
- Passwords stored hashed, never in plain text

### Admin Capabilities
- Create, update, and deactivate/delete users
- Manage classes/courses and subjects
- Assign subjects to classes
- Assign teachers to class-subject combinations
- View all assignments and all student submissions
- Manage application settings

### Teacher Capabilities
- Create assignments for assigned class-subject combinations only
- Save assignments as draft or publish them
- Update or delete assignments according to business rules
- View submissions for owned assignments
- Review a submission, assign marks, provide feedback, and update status
- Preview submitted PDF files inline in the browser
- Download original PDF or DOCX submissions at any time

### Student Capabilities
- View only published assignments for their own class/course
- Read assignment title, description, deadline, and maximum marks
- Submit PDF or DOCX files before the deadline
- Resubmit before deadline when allowed
- View submission status, marks, and feedback after grading

### Cross-Cutting Rules
- Structured validation and error responses
- Server-side deadline enforcement
- Secure submission file storage outside the public web root
- Swagger/OpenAPI documentation
- Logging for errors and important actions
- File access checks for ownership and role permissions

## Technology Stack

### Frontend
- Next.js 16.3.0
- React 19.2.8
- TypeScript 7.0.2

### Backend
- ASP.NET Core 10.0.10 Web API
- Entity Framework Core
- JWT authentication
- Swagger/OpenAPI
- Structured logging via ILogger or Serilog

### Database
- PostgreSQL 18.4

### Testing
- .NET test project
- Mocking framework such as Moq
- In-memory or test database provider

## Architecture

The system is designed as a backend-first, decoupled application:

- Frontend: Next.js UI consumes API endpoints only
- Backend: ASP.NET Core layered architecture with controllers, services, and data access
- Database: PostgreSQL schema created through EF Core migrations
- File storage: submission files stored on disk outside the public web root or in cloud storage, with backend-streamed access

## Database Model Summary

Core entities include:

- Users
- Admins, Teachers, Students
- Subjects
- Classes
- Student enrollments
- Assignments
- Submissions
- App settings

Important relationships:

- One teacher can be assigned to many class-subject combinations
- One class can have many assignments
- One assignment can have many submissions
- One student can enroll in multiple classes

## Repository Structure

Expected top-level structure:

```text
/AssignmentManagement.sln
/src/AssignmentManagement.Api
/src/AssignmentManagement.Application
/src/AssignmentManagement.Domain
/src/AssignmentManagement.Infrastructure
/tests
/database
README.md
```

The scaffold in this repository currently follows the `src/AssignmentManagement.*` layout above.

## Setup Instructions

> Update the commands below to match the actual solution once the codebase is added.

### Prerequisites
- Node.js compatible with the chosen Next.js version
- .NET SDK compatible with ASP.NET Core 10.0.10
- PostgreSQL 18.4
- Git

### Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### Backend Setup
1. Restore dependencies.
2. Configure the database connection string, JWT settings, CORS origin, and file storage path.
3. Apply migrations.
4. Seed demo data.
5. Run the API.

Example commands:
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup
1. Install frontend dependencies.
2. Configure API base URL and authentication settings.
3. Run the frontend app.

Example commands:
```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Do not commit secrets to source control. Use local environment files and provide example templates in the repository.

### Frontend `.env.example`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Backend `appsettings.Example.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=assignment_db;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Issuer": "AssignmentSystem",
    "Audience": "AssignmentSystemUsers",
    "Secret": "replace-with-a-strong-secret",
    "ExpiryMinutes": 120
  },
  "Storage": {
    "SubmissionRootPath": "./storage/submissions",
    "MaxUploadSizeMb": 10
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

## Database Setup

The repository should include EF Core migrations and seed data so the schema can be created from scratch without manual table creation.

Typical setup flow:

```bash
cd backend
dotnet ef database update
```

Seed data should cover at least:

- 3 Admins
- 15 Teachers
- 100 Students
- 30 class-subject combinations
- 5 sample assignments

## Running the Application

### Backend
```bash
cd backend
dotnet run
```

### Frontend
```bash
cd frontend
npm run dev
```

### API Documentation
Swagger/OpenAPI should be available from the backend during development, typically at:

```text
http://localhost:<backend-port>/swagger
```

## Testing

The repository should include a test project that can be executed with:

```bash
dotnet test
```

Tests should cover the core business rules, including:

- Deadline enforcement
- Maximum marks validation
- Role-based authorization logic
- Submission status transitions

## Demo Credentials

Provide working demo accounts for all three roles in the final repository.

| Role | Email | Password |
|------|-------|----------|
| Admin | TODO | TODO |
| Teacher | TODO | TODO |
| Student | TODO | TODO |

## Development Log

Use this section to record notable progress as the project is built. Keep entries short and factual.

- 2026-08-05: Initial requirements-based README created.
- 2026-08-05: Added living-document guidance for ongoing updates.

## Next Updates To Make

When the codebase is implemented, replace the placeholders with real values for:

- Backend and frontend commands
- Actual ports and URLs
- Real folder structure
- Seeded demo accounts
- Migration and test commands that work in this repository
- Final file storage approach and limits

## Assumptions

These assumptions are documented because the requirements leave some implementation details open:

- Assignment draft visibility: drafts must never be visible to students.
- Assignment deletion after submissions exist: the backend should enforce a clear business rule, such as preventing hard delete once submissions exist and using status changes instead.
- DOCX preview: PDF preview is required inline; DOCX preview is optional, but download must always be supported.
- Submission files are stored outside the public web root and streamed through authorized backend endpoints.
- File size limit should be configurable, with a default of 10 MB unless changed later.

## Known Limitations

This draft does not yet include the actual implementation, so the following items still need to be completed in the codebase:

- Actual backend controllers, services, and repository/DbContext code
- Actual frontend pages, components, and auth flow
- Real migration and seed files
- Real test coverage
- Final demo credentials
- Final ports, URLs, and deployment details

## Security Notes

- Passwords must be hashed using a strong hashing approach such as BCrypt or ASP.NET Core Identity hashing.
- JWTs must include user ID and role claims.
- Submission file endpoints must enforce the same role and ownership checks as the rest of the API.
- CORS should only allow the frontend origin(s).
- Sensitive settings must stay out of source control.

## Submission Checklist

Before submitting, confirm that the repository includes:

- Frontend source code
- Backend source code
- EF Core migrations and seed data
- Test project
- README with setup and test instructions
- Demo credentials for Admin, Teacher, and Student
- `.env.example` for frontend
- `appsettings.Example.json` or equivalent for backend
- No committed secrets

## License

Not specified.
