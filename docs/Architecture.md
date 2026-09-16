# HireHub AI — System Architecture Specification

## 1. Architectural Overview

HireHub AI implements a decoupled, cloud-native enterprise architecture built on modern web and micro-service design patterns:
- **Presentation Tier**: Single Page Application built with React 18 and Vite, served via an optimized Nginx Alpine reverse-proxy container.
- **Application & API Tier**: Stateless REST microservices engineered with Spring Boot 3 on Java 17, secured via Spring Security OAuth2 Resource Server.
- **Persistence & Cloud Infrastructure**: Managed PostgreSQL, Supabase Auth, and Supabase Storage partitioned per candidate.
- **Cognitive Tier**: Google Gemini AI multimodal API orchestrated with heuristic fallback resilience.

---

## 2. Component Topology Diagram

```text
                                  INTERNET
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  Cloudflare / Route53 │
                         │    SSL/TLS (HTTPS)    │
                         └───────────┬───────────┘
                                     │ Port 443
                                     ▼
                         ┌───────────────────────┐
                         │  Nginx 1.27 Web Server│
                         │   SPA Routing / Gzip  │
                         └───────────┬───────────┘
                                     │ Reverse Proxy (/api/v1/*)
                                     ▼
                         ┌───────────────────────┐
                         │  Spring Boot REST API │
                         │    Port 8080 (JVM)    │
                         └───────────┬───────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
            ▼                        ▼                        ▼
┌────────────────────────┐┌────────────────────────┐┌────────────────────────┐
│  Supabase PostgreSQL   ││     Supabase Auth      ││    Google Gemini AI    │
│  - 13 Relational Tables││  - JWT Bearer (RS256)  ││  - ATS Scorecard Engine│
│  - Flyway Migrations   ││  - Session Management  ││  - Interview Simulator │
│  - Composite Indexes   ││  - Role Authority      ││  - Job Matcher         │
└───────────┬────────────┘└────────────────────────┘└────────────────────────┘
            │
            ▼
┌────────────────────────┐
│    Supabase Storage    │
│  - Private Resumes     │
│  - Folder Partition RLS│
└────────────────────────┘
```

---

## 3. Layered Design Breakdown

### 3.1 Presentation Layer (Frontend)
- **Framework**: React 18 + Vite 6 + React Router DOM v7.
- **Styling**: Pure CSS Design System with custom glassmorphism tokens, CSS variables, and zero utility runtime overhead.
- **State & Context Management**:
  - `AuthContext`: Centralizes Supabase user sessions and backend-verified roles (`CANDIDATE`, `RECRUITER`, `ADMIN`).
  - `telemetryService`: Real-time frontend exception capturing and API latency benchmarking.
- **Defensive UI Components**:
  - `ErrorBoundary`: Catches unhandled runtime crashes and provides graceful recovery.
  - `SkeletonLoader`: Shimmering placeholder states during asynchronous data fetching.
  - `EmptyState`: Contextual zero-data indicators.
  - `ConfirmDialog`: Glassmorphic modal confirmation for destructive actions.

### 3.2 Application Layer (Spring Boot Backend)
- **REST Controllers (13 endpoints)**: Clean API surface annotated with OpenAPI 3.0 `@Tag` and `@Operation`.
- **Domain Services**: Business validation, transaction boundaries (`@Transactional`), and event notifications.
- **Security Filter Chain**:
  - Stateless JWT token validation using `NimbusJwtDecoder` with Supabase JWKS public keys.
  - Method-level security (`@PreAuthorize("hasRole('RECRUITER')")`).
  - Strict CORS origin whitelisting (`cors.allowed-origins`).
- **Observability**:
  - Spring Boot Actuator: Health probes (`/actuator/health`), metrics (`/actuator/metrics`), and database status.
  - Standardized error response DTO: `ErrorResponseDTO(statusCode, error, message, timestamp)`.

### 3.3 Persistence & Storage Layer
- **PostgreSQL Database**:
  - Managed schema versioning via Flyway (`V1__initial_schema.sql`, `V2__indexes_and_optimizations.sql`).
  - Composite indexes on high-throughput query paths (`jobs(status, job_type, work_mode)`, `notifications(user_id, is_read)`).
- **Supabase Storage**:
  - Private `resumes` bucket with Row Level Security (RLS).
  - Folder partitioning: `resumes/candidate/{userId}/resume.pdf`.
  - Client-side validation: MIME check, binary magic bytes (`%PDF-`), and 10MB ceiling.

---

## 4. Authentication & Authorization Sequence

```text
Candidate / Recruiter                Supabase Auth                Spring Boot API
        │                                  │                             │
        │ 1. Sign In (Email / Password)    │                             │
        ├─────────────────────────────────►│                             │
        │                                  │                             │
        │ 2. Issues Session & JWT Access   │                             │
        │◄─────────────────────────────────┤                             │
        │                                                                │
        │ 3. POST /api/v1/auth/sync (Bearer JWT)                         │
        ├───────────────────────────────────────────────────────────────►│
        │                                                                │ 4. Validates JWT via JWKS
        │                                                                │    Assigns Role from DB
        │                                                                │    Provisions Candidate/Recruiter
        │ 5. Returns User Profile + Authority Role                       │
        │◄───────────────────────────────────────────────────────────────┤
        │                                                                │
        │ 6. ProtectedRoute enforces access by verified role             │
        │    (CANDIDATE -> CandidatePortal | RECRUITER -> RecruiterPortal)│
```

---

## 5. Container & Deployment Topology

- **Frontend Container**:
  - Multi-stage build (`node:20-alpine` builder &rarr; `nginx:1.27-alpine` runner).
  - Unifies routing: `/` &rarr; static React bundle; `/api/` &rarr; reverse proxy to backend.
- **Backend Container**:
  - Multi-stage build (`maven:3.9.6-temurin-17-alpine` builder &rarr; `eclipse-temurin:17-jre-alpine` runner).
  - Drops root privileges: runs under unprivileged system user `hirehub:hirehub`.
  - Tuned JVM ergonomics: `-XX:+UseG1GC -XX:MaxRAMPercentage=75.0`.
- **Docker Compose**: Orchestrates frontend, backend, healthchecks, and internal bridge network (`hirehub-network`).
