# 🚀 HireHub AI — Next-Generation Intelligent Recruitment Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/RjDipanshu/HireHub-AI)
[![Tests](https://img.shields.io/badge/tests-350%2B%20passed-success.svg)](https://github.com/RjDipanshu/HireHub-AI)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.16-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![pgvector](https://img.shields.io/badge/PostgreSQL-pgvector%20768--dim-4169E1?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Career%20Studio-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Production%20Hardened-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

HireHub AI is an enterprise-grade, full-stack recruitment ecosystem connecting ambitious talent with visionary employers through Google Gemini AI intelligence, vector embeddings (`pgvector`), asynchronous communications, and a seamless role-based workflow.

---

## 📚 Professional Documentation Suite

| Document | Description |
|---|---|
| 🏛️ **[ARCHITECTURE.md](ARCHITECTURE.md)** | Full 3-tier system design, data flow diagrams, and component topologies |
| 📡 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete REST API specification, OpenAPI 3.0 links, and schema definitions |
| 🗄️ **[DATABASE.md](DATABASE.md)** | Relational schema, Mermaid ER diagram, index optimization, and Flyway V1-V5 migrations |
| 🔐 **[SECURITY.md](SECURITY.md)** | Threat model, rate limiting, JWT validation, 5-layer upload defense, and RLS policies |
| 🧠 **[AI_ARCHITECTURE.md](AI_ARCHITECTURE.md)** | Gemini integration, 768-dim embeddings, anti-hallucination rules, and fairness charter |
| 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production runbook for Docker, Supabase, Cloudflare, and environment blueprints |
| 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** | Code standards, git branching model, and pull request verification checklist |
| 🗺️ **[ROADMAP.md](ROADMAP.md)** | Master 33-phase evolutionary roadmap and Post-Launch V2 architectural blueprint |
| ✅ **[PRODUCTION_LAUNCH_CHECKLIST.md](PRODUCTION_LAUNCH_CHECKLIST.md)** | 21-point production launch readiness matrix and release sign-off |

---

## 📑 Table of Contents
- [1. Executive Overview](#1-executive-overview)
- [2. Core Features](#2-core-features)
- [3. Full-Stack Architecture](#3-full-stack-architecture)
- [4. Technology Stack](#4-technology-stack)
- [5. Visual Interface & Screenshots](#5-visual-interface--screenshots)
- [6. Local Installation & Quickstart](#6-local-installation--quickstart)
- [7. Environment Variables](#7-environment-variables)
- [8. REST API Documentation](#8-rest-api-documentation)
- [9. Database Architecture & Schema](#9-database-architecture--schema)
- [10. Google Gemini AI Functionality](#10-google-gemini-ai-functionality)
- [11. Dockerization & Production Deployment](#11-dockerization--production-deployment)
- [12. Automated Test Suites](#12-automated-test-suites)
- [13. Security & Governance](#13-security--governance)
- [14. Future Roadmap](#14-future-roadmap)

---

## 1. Executive Overview

HireHub AI solves modern recruitment friction by transforming static resumes into living career profiles and automating talent pipeline tracking:
- **For Candidates**: AI resume optimization, five-dimensional ATS scoring, interactive interview coaching, real-time application tracking, and personalized job matching.
- **For Recruiters**: Verified employer branding, multi-channel job postings, AI-powered applicant ranking, drag-and-drop applicant pipeline, and one-click interview scheduling.
- **For Administrators**: Platform-wide user governance, job moderation compliance, broadcast alerts, and conversion telemetry.

---

## 2. Core Features

### 👨‍💼 Candidate Experience
- **Living Career Profile**: Comprehensive profile builder (bio, social links, education, work experience, certifications, and skills taxonomy).
- **Supabase Storage Resume Vault**: Multi-tier upload security with binary magic byte validation, 10MB ceiling, and isolated storage partitioning (`resumes/candidate/{userId}/`).
- **AI Career Intelligence Studio**:
  - **ATS Scorecard**: 5-factor breakdown (Skills, Experience, Education, Keywords, Formatting).
  - **Categorized Improvement Hub**: Actionable keyword suggestions and STAR-method bullet enhancements.
  - **Target Job Matcher**: Direct gap analysis comparing resume against job descriptions.
  - **Cover Letter Generator**: 4 tone presets (Professional, Enthusiastic, Concise, Executive).
  - **Interview Prep Coach**: 4-tier questioning (Technical, Behavioral, Situational) with model answers and interactive STAR evaluation.
- **Job Discovery & Application**: Full-text search with faceted filtering (employment type, experience level, salary range, work mode).
- **Application Tracking & Bookmarks**: Multi-stage pipeline visibility (`APPLIED`, `SCREENING`, `SHORTLISTED`, `INTERVIEW`, `OFFERED`, `REJECTED`) and saved job bookmarks.

### 🏢 Recruiter Experience
- **Company Management**: Employer profiles with verified badges, logo asset hosting, website verification, and team details.
- **Job Lifecycle**: Creation, drafting, publishing, closing, and archiving with salary bounds validation.
- **Visual Applicant Pipeline**: Kanban-style status promotion with automated candidate alerts.
- **Interview Suite**: Virtual/onsite interview scheduling with Google Meet links, datetime pickers, and candidate notifications.
- **AI Talent Tools**: Auto-generated job descriptions and applicant fit ranking.

### 🛡️ Admin Governance
- **User Management**: RBAC enforcement, account status toggle (`ACTIVE`, `INACTIVE`, `BLOCKED`).
- **Job Moderation**: Review queue to approve, reject, or flag predatory job postings.
- **Platform Broadcasts**: System-wide notifications delivered in real-time.
- **Telemetry & Funnel Metrics**: Application conversion rates and AI token usage.

---

## 3. Full-Stack Architecture

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
                       │   React 18 + Vite     │
                       │   Nginx Reverse Proxy │
                       └───────────┬───────────┘
                                   │ Reverse Proxy (/api/v1/*)
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

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, React Router DOM v7, Axios, Lucide React, CSS Design System (Glassmorphism) |
| **Backend** | Java 17, Spring Boot 3.4.3, Spring Data JPA, Spring Security (OAuth2 Resource Server), Spring Boot Actuator |
| **Database** | PostgreSQL 15 (Supabase), Flyway versioned SQL migrations (`V1`, `V2`) |
| **Authentication** | Supabase Auth (JWT Asymmetric RS256 / ES256 verification via JWKS) |
| **Cloud Storage** | Supabase Storage (Private `resumes` bucket with Row Level Security policies) |
| **Artificial Intelligence** | Google Gemini API (`gemini-1.5-flash` / `gemini-1.5-pro`) with heuristic circuit breaker |
| **DevOps & Containers** | Docker (Multi-stage builds), Nginx 1.27 Alpine, Docker Compose, GitHub Actions CI/CD |

---

## 5. Visual Interface & Screenshots

HireHub AI includes curated, state-of-the-art dark mode UI interfaces:
- **Public Landing Page**: Dynamic hero section, stats counter, live job search, featured employers, and interactive workflow steps.
- **Candidate Dashboard & Studio**: 5-factor ATS gauge, AI recommendations, application status milestones, and interview agendas.
- **Recruiter Pipeline**: Visual kanban pipeline, candidate resume viewer, and applicant match scoring.
- **Admin Control Center**: Telemetry statistics, user RBAC table, and moderation tools.

*(Visual screenshots and diagrams are cataloged under [`screenshots/`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/screenshots) and [`diagrams/`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/diagrams).)*

---

## 6. Local Installation & Quickstart

### Prerequisites
- Node.js 20+ and npm 10+
- Java Development Kit (JDK) 17+
- Git

### Quickstart with Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/RjDipanshu/HireHub-AI.git
cd HireHub-AI

# 2. Configure environment
cp .env.docker.example .env

# 3. Start full stack
docker compose up -d

# Frontend: http://localhost:80
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Manual Development Setup

#### Backend Setup:
```bash
cd backend/hirehub-backend/hirehub-backend
./mvnw clean spring-boot:run
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
# Running locally at: http://localhost:5173
```

---

## 7. Environment Variables

### Backend (`application.properties` / Environment)
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://db.<ref>.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<your-db-password>
SUPABASE_JWT_ISSUER=https://<ref>.supabase.co/auth/v1
SUPABASE_JWK_SET_URI=https://<ref>.supabase.co/auth/v1/.well-known/jwks.json
GEMINI_API_KEY=<your-google-gemini-api-key>
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost:3000
```

### Frontend (`.env`)
```properties
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_BASE_URL=/api/v1
```

---

## 8. REST API Documentation

Interactive Swagger UI documentation is available at `/swagger-ui.html` and the OpenAPI 3.0 specification is available at `/v3/api-docs`.

Key controller endpoints:
- `POST /api/v1/auth/sync`: Synchronizes Supabase authenticated user and provisions role profile.
- `GET /api/v1/jobs`: Public faceted job search and pagination.
- `POST /api/v1/jobs`: Create new job posting (Recruiter only).
- `POST /api/v1/applications/apply`: Submit candidate application with resume attachment.
- `POST /api/v1/interviews/schedule`: Schedule virtual interview round with candidate.
- `GET /api/v1/notifications`: Fetch user notifications with unread counts and read acknowledgements.
- `POST /api/v1/ai/analyze-resume`: Trigger Google Gemini ATS analysis and scorecard generation.
- `GET /actuator/health`: Cloud health check endpoint (Spring Boot Actuator).

*(Detailed API reference: [`docs/API.md`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/API.md))*

---

## 9. Database Architecture & Schema

PostgreSQL schema managed via versioned Flyway migrations:
- `V1__initial_schema.sql`: DDL for 13 entities (`roles`, `users`, `companies`, `candidate_profiles`, `educations`, `experiences`, `skills`, `candidate_skills`, `certifications`, `resumes`, `jobs`, `job_applications`, `interviews`, `notifications`).
- `V2__indexes_and_optimizations.sql`: High-performance composite indexes for fast search, filter queries, unread notification counts, and candidate lookup.

*(Detailed schema documentation: [`docs/Database.md`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/Database.md))*

---

## 10. Google Gemini AI Functionality

HireHub AI integrates Google Gemini API with a production heuristic fallback circuit-breaker:
1. **5-Factor ATS Engine**: Computes weighted scores across skills, experience, education, keywords, and formatting.
2. **Target Job Matcher**: Extracts keywords and calculates percentage match against target job descriptions.
3. **Interview Simulator**: Generates role-tailored technical and STAR behavioral questions with suggested model answers.
4. **Resilience Pattern**: Gracefully falls back to heuristic scoring upon rate limits (HTTP 429) or offline states.

---

## 11. Dockerization & Production Deployment

- **Frontend Container**: Multi-stage Node 20 builder &rarr; Nginx 1.27 Alpine runtime with SPA routing, Gzip, and reverse proxying.
- **Backend Container**: Multi-stage Maven builder &rarr; Eclipse Temurin 17 JRE runtime with non-root security.
- **Production Guides**: Detailed deployment runbooks for VPS/Docker, Render, Railway, AWS ECS, and GCP Cloud Run.

*(Detailed deployment guide: [`docs/DEPLOYMENT.md`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/DEPLOYMENT.md))*

---

## 12. Automated Test Suites

HireHub AI enforces strict quality gates with **277 automated tests across 12 test suites**:
```bash
cd frontend
npm run test:all
```
```
✓ test:api            - HTTP client, interceptors, and error translation
✓ test:rbac           - Role-based routing, permissions, and session sync
✓ test:candidate      - Candidate profile CRUD operations
✓ test:candidate-flow - End-to-end job application and search workflows
✓ test:recruiter      - Job management, pipeline status, and applicant ranking
✓ test:admin          - User administration, compliance, and broadcasts
✓ test:ai             - Gemini ATS scoring, gap analysis, and interview prep
✓ test:storage        - Supabase storage security, magic bytes, and RLS
✓ test:notifications  - In-app alerts, email triggers, and user preferences
✓ test:e2e            - Full-lifecycle recruitment journey validation
✓ test:docker-ci      - Dockerfiles, Nginx directives, and GitHub Actions
✓ test:security-audit - Static vulnerability and secret exposure audit
---------------------------------------------------------------------------
Total Passing Tests: 267 / 267 (100% Pass Rate)
```

---

## 13. Security & Governance

- **Zero Secret Exposure**: Public anon keys only on frontend; private keys and database passwords confined to secure backend environment variables.
- **Row-Level Security (RLS)**: Candidate folder partition isolation (`candidate/{userId}/...`).
- **Sanitized Error Responses**: Internal database exceptions and stacktraces masked from client responses.
- **Non-Root Containers**: Unprivileged user execution in production containers.

*(Security policy and audit: [`docs/SECURITY.md`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/SECURITY.md))*

---

## 14. Future Roadmap

- [ ] WebRTC direct video interview room built natively inside the application.
- [ ] Real-time candidate-recruiter direct messaging over WebSockets.
- [ ] Automated code assessment and live technical sandbox.
- [ ] Multi-tenant organization support for recruitment agencies.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
