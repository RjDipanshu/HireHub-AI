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

# Frontend Configuration
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key-only>
VITE_API_BASE_URL=https://hirehub.ai/api/v1
```

> [!CAUTION]
> NEVER provide the Supabase `service_role` key in frontend environment variables.

---

## 3. Docker Production Deployment

### 3.1 Build and Launch via Docker Compose
```bash
# Build multi-stage optimized production images
docker compose -f docker-compose.yml build --no-cache

# Run containers in detached mode
docker compose -f docker-compose.yml up -d
```

### 3.2 Verify Container Health
```bash
# Verify backend and frontend containers are healthy
docker compose ps

# Inspect backend logs
docker compose logs -f backend

# Verify Actuator health probe
curl -f http://localhost:8080/actuator/health
```

---

## 4. Supabase Production Setup

### 4.1 Storage Bucket & RLS Policies
Execute `docs/supabase_storage_resumes_policies.sql` in the Supabase SQL Editor:
1. Creates public/private `resumes` bucket with 10MB upload ceiling.
2. Enforces Row-Level Security restricting file access to `candidate/{userId}/`.

### 4.2 Auth Redirect URLs
In Supabase Dashboard $\rightarrow$ Authentication $\rightarrow$ URL Configuration:
- **Site URL**: `https://hirehub.ai`
- **Redirect URLs**:
  - `https://hirehub.ai/auth/callback`
  - `https://hirehub.ai/reset-password`

---

## 5. Production Health & Monitoring Checklist

- [ ] Spring Boot Actuator returns `{"status":"UP"}` at `/actuator/health`.
- [ ] Database connection pool reports active connections without leaks.
- [ ] AI telemetry endpoint `/api/v1/ai/metrics` returns valid token and latency metrics.
- [ ] Nginx serves all static assets with Gzip and HTTP security headers.
- [ ] All 17 automated test suites pass cleanly (`npm run test:all`).
