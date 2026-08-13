# 🚀 AssignFlow — Deployment Guide

This guide provides step-by-step instructions for deploying the **AssignFlow** full-stack application.

---

## 📐 Architecture Overview

| Component | Technology | Default Port | Production Deployment Target |
| :--- | :--- | :--- | :--- |
| **Backend API** | C# .NET 9 Web API | `5000` / `5001` | Render / Railway / Azure App Service / Docker |
| **Frontend** | Next.js 16 (App Router) | `3000` | Vercel / Netlify / Docker |
| **Database** | PostgreSQL / SQL Server | `5432` / `1433` | Neon / Render Postgres / Azure SQL / AWS RDS |
| **File Storage** | Local Disk / Volume | `./storage` | Mounted Persistent Volume / AWS S3 |

---

## 🔑 Environment Variables Reference

### Backend API (`src/AssignmentManagement.Api`)

Set these environment variables in your deployment platform (or in `appsettings.Production.json` / system environment):

| Environment Variable | Example Value | Description |
| :--- | :--- | :--- |
| `ConnectionStrings__DefaultConnection` | `Host=postgres.render.com;Database=assignflow;Username=dbuser;Password=secret` | Database connection string |
| `Jwt__Secret` | `ProductionSecretKey_MustBeAtLeast256BitsLongAndSecure2026!` | Secret key for signing JWT tokens |
| `Jwt__Issuer` | `AssignmentManagement` | JWT issuer string |
| `Jwt__Audience` | `AssignmentManagement.Web` | JWT audience string |
| `Cors__AllowedOrigins__0` | `https://assignflow-app.vercel.app` | Allowed frontend origin for CORS |
| `Storage__SubmissionRootPath` | `/var/data/submissions` | Persistent directory path for student uploads |
| `Storage__MaxUploadSizeMb` | `10` | Maximum file upload size limit (MB) |

---

### Frontend App (`frontend/`)

Set these build-time environment variables in your frontend platform (e.g., Vercel / Netlify):

| Environment Variable | Example Value | Description |
| :--- | :--- | :--- |
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
   - `Cors__AllowedOrigins__0`: `https://your-frontend.vercel.app` (replace with your production frontend URL)
   - `DOTNET_USE_POLLING_FILE_WATCHER`: `true`
   - `DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE`: `false`
5. Click **Create Web Service**. Render will automatically pull the multi-stage [`Dockerfile`](file:///c:/Users/Tarek/Desktop/assignment/Dockerfile), build the ASP.NET Core API image, execute EF Core migrations on Neon PostgreSQL, seed default users, and launch the API container.

---

### Step 3: Deploy Frontend Web App (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import repository `tarek-codes/assignflow`.
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://assignflow-api.onrender.com/api`
5. Click **Deploy**. Vercel will build and publish your frontend application.

---

## 🐳 Method 2: Docker & Docker Compose (VPS Deployment)

Deploying to an Ubuntu/Debian Linux VPS (e.g., DigitalOcean, Hetzner, AWS EC2) using Docker Compose.

### Step 1: SSH into your VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Clone the Repository
```bash
git clone https://github.com/tarek-codes/assignflow.git
cd assignflow
```

### Step 3: Create `docker-compose.yml` in Root Directory
Create a file named `docker-compose.yml`:
```yaml
version: '3.8'

services:
  database:
    image: postgres:16-alpine
    container_name: assignflow_db
    restart: always
    environment:
      POSTGRES_DB: assignment_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: StrongProductionPassword2026!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: assignflow_api
    restart: always
    depends_on:
      - database
    environment:
      - ConnectionStrings__DefaultConnection=Host=database;Port=5432;Database=assignment_management;Username=postgres;Password=StrongProductionPassword2026!
      - Jwt__Secret=AssignFlow_Production_Secret_Key_Must_Be_256_Bits_Long!
      - Jwt__Issuer=AssignmentManagement
      - Jwt__Audience=AssignmentManagement.Web
      - Cors__AllowedOrigins__0=http://your-vps-ip:3000
    volumes:
      - submission_data:/app/storage/submissions
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://your-vps-ip:5000/api
    container_name: assignflow_frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  submission_data:
```

### Step 4: Run Docker Containers
```bash
docker compose up -d --build
```

### Step 5: Configure Reverse Proxy & SSL (Nginx + Certbot)
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/assignflow`:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site & SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/assignflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🖥️ Method 3: Windows Server & IIS Deployment

### Step 1: Install Prerequisites
1. Download & install [.NET 9.0 Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/9.0) on your Windows Server.
2. Ensure IIS is installed with **Web Management Tools** and **World Wide Web Services**.

### Step 2: Publish & Deploy Backend API
```powershell
dotnet publish src/AssignmentManagement.Api/AssignmentManagement.Api.csproj -c Release -o C:\inetpub\wwwroot\AssignFlowApi
```
1. Open IIS Manager → Add Website → **AssignFlow API**.
2. Physical Path: `C:\inetpub\wwwroot\AssignFlowApi`.
3. Set Application Pool to **No Managed Code**.
4. Update `web.config` or environment variables for connection strings and JWT secrets.

### Step 3: Build & Deploy Frontend
```powershell
cd frontend
npm run build
```
Start Node.js application using **PM2** or IIS Node module:
```powershell
npm install -g pm2
pm2 start npm --name "assignflow-frontend" -- start
```

---

## ✅ Post-Deployment Verification Checklist

- [ ] **Backend Health Check**: Navigate to `https://your-api-domain.com/api/dashboard/summary` (Ensure API returns standard JSON or HTTP 401 Unauthorized for unauthenticated requests).
- [ ] **Swagger Documentation**: Check `https://your-api-domain.com/swagger` (Enable in production if desired).
- [ ] **Seed Credentials Check**: Verify logins work for pre-seeded accounts:
  - **Admin**: `admin@assignflow.edu` / `AdminPass123!`
  - **Teacher**: `j.smith@school.edu` / `TeacherPass123!`
  - **Student**: `alex.johnson@student.edu` / `StudentPass123!`
- [ ] **CORS Verification**: Log into frontend app and inspect browser DevTools console for zero CORS blocking errors.
- [ ] **File Upload Test**: Submit a test PDF assignment as a student to confirm write permissions on `./storage/submissions`.

---

*Updated: August 2026 — AssignFlow Production Deployment Documentation*
