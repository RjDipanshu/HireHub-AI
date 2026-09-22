# Production Deployment Guide — HireHub AI

This runbook outlines the deployment workflow for **HireHub AI** across containerized and cloud environments (Docker, Supabase, Railway, Vercel).

---

## 1. Production Architecture Overview

```
                        ┌────────────────────────┐
                        │      Cloudflare DNS    │
                        │    (SSL / HTTPS / WAF) │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │    Nginx (Port 80/443) │
                        │  - Reverse Proxy       │
                        │  - Static React SPA    │
                        └─────┬────────────┬─────┘
                              │            │
             / (React Routes) │            │ /api/* (API Calls)
                              ▼            ▼
                     ┌──────────────┐ ┌──────────────────────┐
                     │ Static Files │ │ Spring Boot Backend  │
                     │  (Vite Dist) │ │ (Container Port 8080)│
                     └──────────────┘ └──────────┬───────────┘
                                                 │
                                                 ▼
                                     ┌───────────────────────┐
                                     │  Supabase Cloud DB    │
                                     │  & Storage Bucket     │
                                     └───────────────────────┘
```

---

## 2. Environment Variables Configuration

Copy `.env.production.example` to `.env.production` and configure verified credentials:

```bash
# Backend Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://<supabase-host>:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<secure-database-password>

SUPABASE_JWT_ISSUER=https://<project-ref>.supabase.co/auth/v1
SUPABASE_JWK_SET_URI=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
CORS_ALLOWED_ORIGINS=https://hirehub.ai,https://www.hirehub.ai

GEMINI_API_KEY=<verified-google-ai-studio-api-key>

# Email / SMTP Configuration
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_USERNAME=<verified-support-email>
SPRING_MAIL_PASSWORD=<secure-app-password>
MAIL_FROM=<verified-support-email>
SUPPORT_EMAIL=<verified-support-email>

# Frontend Configuration
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key-only>
VITE_API_BASE_URL=https://hirehub.ai/api/v1
```

> [!CAUTION]
> NEVER provide the Supabase `service_role` key in frontend environment variables.

---

## 3. Database Migration (Flyway)

Flyway handles database migrations automatically upon application startup, ensuring the schema is safely evolved.

> [!WARNING]
> In production, `spring.jpa.hibernate.ddl-auto` MUST be set to `validate`. Never use `update` or `create-drop` in a production environment as it may destroy or incorrectly alter tables.

- Flyway scripts are located in `src/main/resources/db/migration`.
- During backend startup, Flyway acquires a lock and executes any pending `V*__description.sql` files against the Supabase PostgreSQL database.

---

## 4. Docker Production Deployment

### 4.1 Build and Launch via Docker Compose
```bash
# Build multi-stage optimized production images
docker compose -f docker-compose.yml build --no-cache

# Run containers in detached mode
docker compose -f docker-compose.yml up -d
```

### 4.2 Verify Container Health
```bash
# Verify backend and frontend containers are healthy
docker compose ps

# Inspect backend logs
docker compose logs -f backend

# Verify Backend Actuator health probe
curl -f http://localhost:8080/actuator/health

# Verify Frontend/Nginx health probe
curl -f http://localhost:80/healthz
```

---

## 5. Supabase Production Setup

### 5.1 Storage Bucket & RLS Policies
Execute `docs/supabase_storage_resumes_policies.sql` in the Supabase SQL Editor:
1. Creates public/private `resumes` bucket with 10MB upload ceiling.
2. Enforces Row-Level Security restricting file access to `candidate/{userId}/`.

### 5.2 Auth Redirect URLs
In Supabase Dashboard $\rightarrow$ Authentication $\rightarrow$ URL Configuration:
- **Site URL**: `https://hirehub.ai`
- **Redirect URLs**:
  - `https://hirehub.ai/auth/callback`
  - `https://hirehub.ai/reset-password`

---

## 6. Production Health & Monitoring Checklist

- [ ] Spring Boot Actuator returns `{"status":"UP"}` at `/actuator/health`.
- [ ] Frontend Nginx returns `healthy` at `/healthz`.
- [ ] Database connection pool reports active connections without leaks.
- [ ] AI telemetry endpoint `/api/v1/ai/metrics` returns valid token and latency metrics.
- [ ] Nginx serves all static assets with Gzip and HTTP security headers.
- [ ] All automated test suites pass cleanly (`npm run test:all`).

---

## 7. Rollback & Disaster Recovery

### 7.1 Application Rollback
If a deployment introduces critical bugs, rollback to the previous stable Docker image:
```bash
# Assuming the previous image tag was v1.0.4
docker pull your-registry/hirehub-backend:v1.0.4
docker pull your-registry/hirehub-frontend:v1.0.4

# Update docker-compose.yml image tags and restart
docker compose up -d
```

### 7.2 Database Rollback
We do not use automatic down-migrations. If a Flyway migration fails or introduces issues:
1. Connect to the Supabase Dashboard.
2. Restore from the most recent PITR (Point-In-Time Recovery) backup or daily backup.
3. Roll back the application container to the matching previous version.
