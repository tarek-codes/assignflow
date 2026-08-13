# 📚 AssignFlow — Assignment & Submission Management System

> A modern, full-stack enterprise academic platform for managing assignments, submissions, grading, and curriculum analytics across **Admin**, **Teacher**, and **Student** roles — built with **Next.js 16**, **ASP.NET Core 10 Web API**, and **PostgreSQL**.

**🌐 Live Demo:** [https://assignflow-bd.vercel.app/](https://assignflow-bd.vercel.app/)  
**🔌 API (Production):** `https://assignflow-api-tq42.onrender.com/api`

---

## 🔑 Demo Credentials

All seeded demo accounts share the password **`Password123!`**:

| Role | Email | Default Password | Notes |
|------|-------|------------------|-------|
| 🛡️ **Admin** | `admin@example.com` | `Password123!` | System Administrator |
| 👨‍🏫 **Teacher** | `teacher@example.com` | `Password123!` | Mathematics Lead Teacher |
| 🎓 **Student** | `student@example.com` | `Password123!` | Grade 10 Student |

---

## ✨ Features & Role Capabilities

| Role | Key Capabilities |
|------|-----------------|
| 🛡️ **Admin** | Full system administration, user directory management, class & group allocations, pending account approval queue, student results overview, and system-wide monthly analytics dashboards. |
| 👨‍🏫 **Teacher** | Assignment creation & editing, class assignment targeting, deadline management, submission reviewing with inline PDF file previewer, percentage grading & performance tier feedback, and classroom analytics. |
| 🎓 **Student** | Dedicated learner portal, interactive assignment calendar, multi-file assignment submissions, real-time submission status tracking, grades overview, and teacher feedback. |

### 🌐 System-Wide Features
- 🌓 **Dark & Light Mode** toggle with persistent user preferences.
- 🗣️ **Bilingual Internationalization (i18n)** support for **English** and **Bangla**.
- 🔒 **Role-Based Access Control (RBAC)** powered by JWT bearer tokens with refresh token rotation.
- 📊 **Interactive Data Visualizations** using Recharts (monthly assignment trends, status distributions, score heatmaps).
- 📁 **File Attachment Previewer** with support for PDF viewing, inline text previews, and secure file downloads.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Data & Charts**: Recharts & Framer Motion animations
- **State & Context**: React Context (Auth, Language, Theme)
- **HTTP Client**: Axios with request/response interceptors & token refresh logic

### Backend
- **Framework**: ASP.NET Core 10 Web API
- **ORM & Database**: Entity Framework Core 10 (Code-First) & PostgreSQL
- **Security & Auth**: JWT Bearer Authentication, Refresh Tokens, BCrypt password hashing
- **Validation & Mapping**: FluentValidation & AutoMapper
- **Documentation**: Swagger / OpenAPI
- **Logging & Diagnostics**: Serilog structured logging & custom global exception handler middleware

### Database & Seed Engine
- **PostgreSQL 15+**: Schema auto-managed on API startup via `DbInitializer`
- **Data Seeding**: Seeds full demo dataset on initial startup (Admin, 20 Teachers, 100 Students across Class 6–12, 36 Subjects, Assignments & Submissions)

---

## 📁 Repository Structure

```
assignflow/
├── frontend/                             # Next.js 16 Frontend Web Application
│   ├── src/
│   │   ├── app/                          # Next.js App Router pages & layouts
│   │   ├── components/                   # Shared UI, layout, navbar & modals
│   │   ├── context/                      # Auth, Language & Theme contexts
│   │   ├── features/                     # Feature modules (Admin, Teacher, Student, Assignments, Submissions)
│   │   ├── services/                     # API client services (Auth, Assignment, Submission, User, Class)
│   │   ├── types/                        # TypeScript interfaces & domain types
│   │   └── utils/                        # Formatting, date utilities, class level helpers
│   ├── public/                           # Static assets & public resources
│   └── package.json
│
├── src/                                  # ASP.NET Core 10 Solution Projects
│   ├── AssignmentManagement.Api/         # Controllers, Middlewares, Program startup & Appsettings
│   ├── AssignmentManagement.Application/ # Services, DTOs, Mapping profiles & Validators
│   ├── AssignmentManagement.Domain/      # Entities, Value Objects, Enums & Domain Interfaces
│   └── AssignmentManagement.Infrastructure/ # EF Core DbContext, Repositories, Migrations & DbInitializer
│
├── tests/                                # Test Suite
│   ├── AssignmentManagement.UnitTests/   # Unit tests with xUnit, Moq & FluentAssertions
│   └── AssignmentManagement.IntegrationTests/ # Integration tests with TestHost
│
├── AssignmentManagement.sln             # Visual Studio Solution File
└── README.md                             # Project Documentation
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

1. Configure the connection string and JWT options in `src/AssignmentManagement.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=assignflow;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Issuer": "AssignmentSystem",
    "Audience": "AssignmentSystemUsers",
    "Secret": "replace-with-a-strong-secret-32chars-minimum",
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

2. Run the ASP.NET Core Web API (see [Database Setup](#3-database-setup) first if PostgreSQL is not installed yet):

```bash
dotnet run --project src/AssignmentManagement.Api/AssignmentManagement.Api.csproj
```

The API will listen on: `http://localhost:5196`  
Swagger Documentation: `http://localhost:5196/swagger`

> **Note:** Database tables and initial seed data are populated automatically on application startup via `DbInitializer`.

---

### 3. Database Setup

AssignFlow uses **PostgreSQL 15+** with **Entity Framework Core** (code-first). There are no manual SQL scripts — the API creates the schema and seeds demo data when it starts.

#### Option A: Local PostgreSQL (recommended for development)

1. **Install PostgreSQL**  
   Download from [postgresql.org](https://www.postgresql.org/download/) (Windows/macOS/Linux) or use Docker:

   ```bash
   docker run --name assignflow-postgres -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=assignflow -p 5432:5432 -d postgres:15
   ```

2. **Create a database** (skip if using the Docker command above — it already creates `assignflow`):

   ```sql
   CREATE DATABASE assignflow;
   ```

3. **Set the connection string** in `src/AssignmentManagement.Api/appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=assignflow;Username=postgres;Password=your_password"
   }
   ```

4. **Start the API** — on first run, EF Core creates all tables and seeds the demo dataset:

   ```bash
   dotnet run --project src/AssignmentManagement.Api/AssignmentManagement.Api.csproj
   ```

#### Option B: Cloud PostgreSQL (Neon — used in production)

1. Create a free project at [Neon.tech](https://neon.tech).
2. Create a PostgreSQL database and copy the **connection string**.
3. Paste it into `appsettings.json` (or set `ConnectionStrings__DefaultConnection` as an environment variable on Render/Railway):

   ```text
   Host=ep-xxxx.region.aws.neon.tech;Port=5432;Database=neondb;Username=your_user;Password=your_password;SSL Mode=Require;Trust Server Certificate=true
   ```

#### What gets created automatically

| Item | Details |
|------|---------|
| **Schema** | All tables (`users`, `teachers`, `students`, `classes`, `assignments`, `submissions`, etc.) via `EnsureCreatedAsync` |
| **Seed data** | 1 Admin, 20 Teachers, 100 Students (Class 6–12), 36 Subjects, class assignments, graded & pending submissions |
| **Demo logins** | See [Demo Credentials](#-demo-credentials) — all use password `Password123!` |

> **Important:** On each API startup, `DbInitializer` **resets and re-seeds** the database to guarantee a consistent demo environment. Do not use this behavior for production data you need to keep — configure a separate initializer strategy before go-live.

#### Optional: Redis (API response caching)

For faster dashboards and list endpoints in production, connect a Redis instance and add to `appsettings.json` or environment variables:

```json
"ConnectionStrings": {
  "Redis": "redis://your-redis-host:6379"
},
"Redis": {
  "InstanceName": "assignflow:"
}
```

If Redis is not configured, the API falls back to in-memory caching locally.

---

### 4. Frontend Setup

1. Navigate to the `frontend` folder and install dependencies:

```bash
cd frontend
npm install
```

2. Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5196
```

3. Launch the Next.js development server:

```bash
npm run dev
```

The frontend app will be live at: `http://localhost:3000`

---

## 🧪 Running Tests

### Backend Unit & Integration Tests

```bash
# Run backend unit tests
dotnet test tests/AssignmentManagement.UnitTests/

# Run backend integration tests
dotnet test tests/AssignmentManagement.IntegrationTests/
```

### Frontend TypeScript Verification & Production Build

```bash
cd frontend

# Verify TypeScript type checking
npx tsc --noEmit

# Execute Next.js production build
npm run build
```

---

## 🔒 Security & Best Practices

- **Password Hashing**: Industry-standard **BCrypt** hashing with salt.
- **Stateless Authorization**: JWT token claims (ID, Email, Role) validated per request.
- **Secure File Storage**: Uploaded files stored outside the web root with access control checks prior to download.
- **CORS Protection**: Access limited to white-listed client origins.

---

## 👤 Author

**Tarek** · [@tarek-codes](https://github.com/tarek-codes) · `tarekalambhuiyan@gmail.com`
