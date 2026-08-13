# 🚀 AssignFlow — Deployment Guide

This guide provides step-by-step instructions for deploying the **AssignFlow** full-stack application.

**Live Frontend:** [https://assignflow-bd.vercel.app/](https://assignflow-bd.vercel.app/)  
**Live API:** `https://assignflow-api-tq42.onrender.com/api`  


---

## 📐 Architecture Overview


| Component        | Technology              | Default Port    | Production Deployment Target       |
| ---------------- | ----------------------- | --------------- | ---------------------------------- |
| **Backend API**  | ASP.NET Core 10 Web API | `5196` / `8080` | Render / Railway / Docker          |
| **Frontend**     | Next.js 16 (App Router) | `3000`          | Vercel / Netlify / Docker          |
| **Database**     | PostgreSQL 15+          | `5432`          | Neon                               |
| **File Storage** | Local Disk / Volume     | `./storage`     | Mounted Persistent Volume / AWS S3 |


---



## 🔑 Environment Variables Reference



### Backend API (`src/AssignmentManagement.Api`)

Set these environment variables in your deployment platform (or in `appsettings.Production.json` / system environment):


| Environment Variable                   | Example Value                                                                  | Description                                   |
| -------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------- |
| `ConnectionStrings__DefaultConnection` | `Host=postgres.render.com;Database=assignflow;Username=dbuser;Password=secret` | Database connection string                    |
| `ConnectionStrings__Redis`             | `redis://red-xxx:6379`                                                         | Optional Redis URL for API response caching   |
| `Redis__InstanceName`                  | `assignflow:`                                                                  | Redis key prefix for this app                 |
| `Jwt__Secret`                          | `ProductionSecretKey_MustBeAtLeast256BitsLongAndSecure2026!`                   | Secret key for signing JWT tokens             |
| `Jwt__Issuer`                          | `AssignmentManagement`                                                         | JWT issuer string                             |
| `Jwt__Audience`                        | `AssignmentManagement.Web`                                                     | JWT audience string                           |
| `Cors__AllowedOrigins__0`              | `https://assignflow-bd.vercel.app`                                             | Allowed frontend origin for CORS              |
| `Storage__SubmissionRootPath`          | `/var/data/submissions`                                                        | Persistent directory path for student uploads |
| `Storage__MaxUploadSizeMb`             | `10`                                                                           | Maximum file upload size limit (MB)           |


---



### Frontend App (`frontend/`)

Set these build-time environment variables in your frontend platform (e.g., Vercel / Netlify):


| Environment Variable  | Example Value                             | Description                          |
| --------------------- | ----------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | `https://assignflow-api.onrender.com/api` | Base URL of the deployed backend API |


---



## ☁️ Method 1: Cloud Deployment (Recommended)



### Step 1: Provision Managed Database (Neon / Render Postgres)

1. Sign up at [Neon.tech](https://neon.tech) or [Render.com](https://render.com).
2. Create a new **PostgreSQL Database**.
3. Copy your connection string:
  ```text
   Host=ep-cool-db-12345.us-east-2.aws.neon.tech;Port=5432;Database=assignflow;Username=neonuser;Password=your_password;SSL Mode=Require;Trust Server Certificate=true
  ```

---



### Step 2: Deploy Backend API (Render / Railway)



#### Option A: Render (using Docker Language Setting)

1. Sign in to [Render Dashboard](https://dashboard.render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `https://github.com/tarek-codes/assignflow`.
3. Configure settings:
  - **Name**: `assignflow-api`
  - **Language / Runtime**: **Docker**
  - **Dockerfile Path**: `./Dockerfile`
  - **Docker Context**: `.`
  - **Port**: `8080` (or leave default, bound via `ASPNETCORE_URLS=http://+:8080`)
4. Under **Environment Variables**, add:
  - `ConnectionStrings__DefaultConnection`: `Host=ep-rapid-voice-azepmkjl.c-3.ap-southeast-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_ZQS3lkUAgiE0;SSL Mode=Require;Trust Server Certificate=true`
  - `Jwt__Secret`: `AssignmentManagement_SuperStrongSecretKey_2026_With_More_Than_256_Bits!`
  - `Jwt__Issuer`: `AssignmentManagement`
  - `Jwt__Audience`: `AssignmentManagement.Web`
  - `Cors__AllowedOrigins__0`: `https://assignflow-bd.vercel.app`
  - `DOTNET_USE_POLLING_FILE_WATCHER`: `true`
  - `DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE`: `false`
5. Click **Create Web Service**. Render will automatically pull the multi-stage `[Dockerfile](file:///c:/Users/Tarek/Desktop/assignment/Dockerfile)`, build the ASP.NET Core API image, execute EF Core migrations on Neon PostgreSQL, seed default users, and launch the API container.

---



### Step 3: Deploy Frontend Web App (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import repository `tarek-codes/assignflow`.
3. Configure project settings:
  - **Framework Preset**: Next.js
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
4. Under **Environment Variables**, add:
  - `NEXT_PUBLIC_API_URL` = `https://assignflow-api-tq42.onrender.com/api`
5. Click **Deploy**. Vercel will build and publish your frontend application.

---



