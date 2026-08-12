# 📚 AssignFlow — Assignment & Submission Management System

> A full-stack platform for managing academic assignments across Admin, Teacher, and Student roles — built with **Next.js**, **ASP.NET Core 10**, and **PostgreSQL**.

---

## ✨ Features at a Glance

| Role | Key Capabilities |
|------|-----------------|
| 🛡️ **Admin** | Manage users, classes, subjects, teacher allocations, and view all data |
| 👨‍🏫 **Teacher** | Create & publish assignments, review and grade submissions, give feedback |
| 🎓 **Student** | View assignments, submit PDF/DOCX files, track grades and feedback |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** · **React 19** · **TypeScript**
- Tailwind CSS · ShadCN UI components
- JWT-based auth with role-aware routing

### Backend
- **ASP.NET Core 10** Web API
- **Entity Framework Core** (code-first, migrations)
- **BCrypt** password hashing
- **Swagger / OpenAPI** documentation
- Structured logging (Serilog)

### Database
- **PostgreSQL** — schema managed via EF Core migrations with full seed data

---

## 📁 Project Structure

```
assignflow/
├── frontend/                         # Next.js frontend app
│   └── src/
│       ├── features/
│       │   ├── admin/                # Admin-only views
│       │   ├── assignments/          # Assignment list & detail
│       │   ├── auth/                 # Login, auth context
│       │   ├── dashboard/            # Role-aware dashboard
│       │   ├── submissions/          # Submission views
│       │   └── teacher/              # Teacher-specific views
│       ├── components/               # Shared UI components
│       └── utils/                    # Helpers and utilities
│
├── src/
│   ├── AssignmentManagement.Api/         # Controllers, middleware, startup
│   ├── AssignmentManagement.Application/ # Services, DTOs, validators
│   ├── AssignmentManagement.Domain/      # Entities, enums, core types
│   └── AssignmentManagement.Infrastructure/ # EF Core, repositories, seed data
│
├── tests/
│   └── AssignmentManagement.UnitTests/   # xUnit tests with Moq
│
└── AssignmentManagement.sln
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 15+](https://www.postgresql.org/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/tarek-codes/assignflow.git
cd assignflow
```

---

### 2. Backend Setup

**Configure the API** — update `src/AssignmentManagement.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=assignflow;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Issuer": "AssignmentSystem",
    "Audience": "AssignmentSystemUsers",
    "Secret": "replace-with-a-strong-secret-32chars",
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

**Run the API** (the database and seed data are created automatically on first run):

```bash
dotnet run --project src/AssignmentManagement.Api/AssignmentManagement.Api.csproj
```

The API will be available at: `http://localhost:5196`  
Swagger docs at: `http://localhost:5196/swagger`

> **Note:** The database schema is created and seeded automatically via `EnsureCreated` + `DbInitializer` on startup. No manual migration commands are needed.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5196
```

Start the dev server:

```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

---

## 🔑 Demo Credentials

All demo accounts share the same password:

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@example.com` | `Password123!` |
| 👨‍🏫 Teacher | `teacher@example.com` | `Password123!` |
| 🎓 Student | `student@example.com` | `Password123!` |

> The seed data includes **1 admin**, **20 teachers**, and **100 students** across 7 class levels (Grade 6–12).

---

## 🧪 Running Tests

```bash
dotnet test tests/AssignmentManagement.UnitTests/
```

Tests cover:
- Assignment service business rules
- Deadline enforcement
- Submission status transitions
- Auth service token generation

---

## 🌱 Seed Data Overview

When the API starts for the first time, it automatically seeds:

- **1 Admin** account
- **20 Teachers** with subject specializations
- **100 Students** distributed across Grade 6–12
- **36 Subjects** (SSC + HSC curriculum including Science, Business, and Humanities streams)
- Assignments and submissions distributed across classes and terms

---

## 🔒 Security Notes

- Passwords are hashed with **BCrypt** — never stored in plain text
- JWTs contain user ID and role claims, verified on every protected request
- Submission files are stored **outside the public web root** and served through authorized API endpoints
- CORS is restricted to the configured frontend origin
- **Never commit secrets** — use `appsettings.json` locally and environment variables in production

---

## 📖 API Documentation

Swagger UI is available in development mode at:

```
http://localhost:5196/swagger
```

---

## 👤 Author

**Tarek** · [@tarek-codes](https://github.com/tarek-codes) · `tarekalambhuiyan@gmail.com`
