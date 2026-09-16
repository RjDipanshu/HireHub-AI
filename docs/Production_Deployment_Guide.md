# HireHub AI — Production Deployment Guide & Architecture

This guide provides step-by-step instructions for deploying HireHub AI to production across modern cloud environments (Docker, PaaS, or Enterprise Cloud).

---

## 1. Production Architecture Overview

```text
                                INTERNET
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │  Cloudflare / Route53 │
                       │    SSL/TLS Termination│
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │    Frontend Container │
                       │     React + Vite      │
                       │     Nginx Web Server  │
                       └───────────┬───────────┘
                                   │ Reverse Proxy (/api/*)
                                   ▼
                       ┌───────────────────────┐
                       │    Backend Container  │
                       │ Spring Boot 3 (Java17)│
                       │     Port 8080         │
                       └───────────┬───────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
│ Supabase PostgreSQL  ││   Supabase Auth      ││    Google Gemini     │
│ Database + Flyway    ││   JWT Bearer RS256   ││  AI Career Engine    │
└───────────┬──────────┘└──────────────────────┘└──────────────────────┘
            │
            ▼
┌──────────────────────┐
│  Supabase Storage    │
│  Private Resumes     │
└──────────────────────┘
```

---

## 2. Environment Variables Matrix

### Backend Environment Variables (`hirehub-backend`)
| Variable | Description | Example / Default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC Connection URL | `jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `<your-db-password>` |
| `SUPABASE_JWT_ISSUER` | Supabase Auth issuer URL | `https://<project-ref>.supabase.co/auth/v1` |
| `SUPABASE_JWK_SET_URI` | Supabase JWKS endpoint for token validation | `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `CORS_ALLOWED_ORIGINS` | Permitted browser origins (comma-separated) | `https://hirehub.ai,https://www.hirehub.ai` |

### Frontend Build Variables (`hirehub-frontend`)
| Variable | Description | Example / Default |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Project Public API URL | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anonymous API Key | `eyJhbGci...` |
| `VITE_API_BASE_URL` | Base path for backend REST API calls | `/api/v1` |

---

## 3. Deployment Options

### Option A: Unified Docker Compose (VPS / DigitalOcean / AWS EC2)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RjDipanshu/HireHub-AI.git
   cd HireHub-AI
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.docker.example .env
   nano .env
   ```

3. **Build & Start Full-Stack Services**:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

4. **Verify Container Health**:
   ```bash
   docker compose ps
   curl -I http://localhost/healthz
   curl -I http://localhost:8080/v3/api-docs
   ```

---

### Option B: PaaS Platforms (Render / Railway)

#### Backend Deployment (Spring Boot):
1. Create a new **Web Service** pointing to `./backend/hirehub-backend/hirehub-backend`.
2. Choose **Docker** as the environment (it automatically detects `Dockerfile`).
3. Set Port: `8080`.
4. Configure the environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_PASSWORD`, `GEMINI_API_KEY`, etc.).

#### Frontend Deployment (React + Vite):
1. Create a new **Static Site** or **Web Service** with `./frontend`.
2. Set Build Command: `npm run build`.
3. Set Publish Directory: `dist`.
4. Set Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` (`https://<your-backend-domain>/api/v1`).
5. Add SPA Rewrite Rule: `/*` &rarr; `/index.html`.

---

### Option C: Enterprise Cloud (AWS / Google Cloud)

- **Frontend**: AWS S3 + CloudFront CDN or Google Cloud Storage + Cloud CDN.
- **Backend**: AWS ECS Fargate or Google Cloud Run (serverless container autoscaling).
- **Database & Storage**: Managed Supabase PostgreSQL & Storage with dedicated compute.

---

## 4. Supabase Setup & Security Checklist

1. **Database Schema & Migrations**:
   - Flyway scripts execute automatically on Spring Boot backend boot:
     - `V1__initial_schema.sql` (Creates 13 tables)
     - `V2__indexes_and_optimizations.sql` (Creates high-performance composite indexes)
2. **Storage RLS Policies**:
   - Run [`docs/supabase_storage_resumes_policies.sql`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/supabase_storage_resumes_policies.sql) in Supabase SQL Editor to enforce per-candidate partition isolation (`resumes/candidate/{userId}/...`).
3. **Authentication Settings**:
   - In Supabase Dashboard &rarr; Authentication &rarr; URL Configuration:
     - Set **Site URL**: `https://your-domain.com`
     - Add **Redirect URLs**: `https://your-domain.com/*`, `http://localhost:5173/*`

---

## 5. Post-Deployment Verification Checklist

- [ ] `GET /healthz` returns `200 OK`
- [ ] `GET /api/v1/jobs` returns published jobs list without authentication
- [ ] `POST /api/v1/auth/sync` successfully assigns role to Supabase authenticated user
- [ ] Resume upload to `candidate/{userId}/resume.pdf` succeeds and enforces 10MB limit
- [ ] Gemini AI ATS resume analyzer returns 5-dimension scorecard
- [ ] Recruiter applicant stage updates dispatch in-app notification and email alert
- [ ] OpenAPI Swagger documentation accessible at `/swagger-ui.html`
