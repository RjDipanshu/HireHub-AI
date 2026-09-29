<div align="center">

# 🚀 HireHub AI

### Next-Generation Intelligent Recruitment & Career Studio Platform

[![CI/CD Pipeline](https://github.com/RjDipanshu/HireHub-AI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/RjDipanshu/HireHub-AI/actions)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=flat&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](LICENSE)

<br />

**HireHub AI** is an enterprise-scale, full-stack AI recruitment platform that automates the entire talent acquisition and career progression lifecycle — from intelligent resume analysis to semantic job matching and automated interview scheduling.

Built with **Spring Boot 3** · **React 18** · **Supabase** · **Google Gemini AI** · **Docker**

[🌐 Live Demo](#-deployment) · [📖 API Docs](#-api-documentation) · [🐛 Report Bug](https://github.com/RjDipanshu/HireHub-AI/issues) · [💡 Request Feature](https://github.com/RjDipanshu/HireHub-AI/issues)

</div>

---

## 📑 Table of Contents

- [✨ Key Highlights](#-key-highlights)
- [🎯 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🧠 AI Intelligence Suite](#-ai-intelligence-suite)
- [🖥️ Role-Based Portals](#️-role-based-portals)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🐳 Docker Deployment](#-docker-deployment)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🧪 Testing](#-testing)
- [📡 API Documentation](#-api-documentation)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Highlights

<table>
<tr>
<td width="50%">

**🤖 AI-Powered Intelligence**
- 5-dimension ATS resume scoring via Google Gemini
- Semantic job & candidate search with pgvector embeddings
- AI cover letter generator with multiple tones
- STAR-method interview prep coach
- Zero-hallucination guardrails & AI fairness charter

</td>
<td width="50%">

**🏢 Enterprise-Grade Architecture**
- 3 role-based portals (Candidate, Recruiter, Admin)
- OAuth2/JWT authentication with Supabase Auth
- Rate limiting, GDPR compliance & audit logging
- Multi-stage Docker containers with CI/CD
- 277+ automated tests with 100% pass rate

</td>
</tr>
</table>

---

## 🎯 Features

### 👤 For Candidates
| Feature | Description |
|---------|-------------|
| **AI Resume Analyzer** | Upload PDF → extract text with Apache PDFBox → 5-category ATS score (0–100) powered by Gemini |
| **AI Job Match** | Compare your profile against any job posting → fit percentage with 5 category breakdown |
| **AI Cover Letter Generator** | Generate personalized cover letters in Professional, Enthusiastic, or Concise tones |
| **AI Interview Prep Coach** | Custom behavioral & technical questions with STAR-method coaching for target roles |
| **Semantic Job Search** | Natural language queries like *"Find backend roles involving distributed systems"* |
| **Resume Builder** | Multi-section living resume with education, experience, skills & certifications |
| **Application Tracker** | Real-time pipeline status: Applied → Under Review → Shortlisted → Interview → Offered |
| **Skill Assessments** | Timed competency evaluations to earn verified skill badges on your profile |
| **Interview Scheduler** | View upcoming interviews with Google Meet/Zoom integration links |
| **Saved Jobs & Bookmarks** | Bookmark interesting opportunities for later review |

### 🏢 For Recruiters
| Feature | Description |
|---------|-------------|
| **AI Applicant Ranking** | Auto-rank hundreds of applicants against custom job criteria in seconds |
| **AI Job Description Generator** | Generate professional, high-converting job posts from simple prompts |
| **AI Candidate Matcher** | Score any candidate against specific role requirements |
| **AI Hiring Insights** | Market compensation data, demand scores & hiring timeline forecasts |
| **Semantic Candidate Search** | Natural language talent scouting across the entire candidate pool |
| **Applicant Pipeline** | Visual stage transitions: Applied → Shortlisted → Interview → Offered → Hired |
| **Company Profile** | Branded employer page with logo, industry, company size & verification badge |
| **Interview Scheduling** | Create & manage interview slots with datetime pickers and meeting links |
| **Direct Messaging** | Threaded conversations with candidates via in-app messaging |

### 🛡️ For Administrators
| Feature | Description |
|---------|-------------|
| **Platform Dashboard** | Real-time telemetry: users, jobs, applications, revenue metrics |
| **User Management** | Toggle user status (Active / Inactive / Blocked), role filtering |
| **Job Moderation** | Review queue for spam, predatory, or policy-violating job listings |
| **Company Verification** | Approve/reject employer verification requests |
| **Audit Logs** | Searchable, filterable log of all platform-critical administrative actions |
| **Platform Broadcasts** | Role-targeted notification broadcasts to all users |
| **Support Ticket System** | Review, respond to, and resolve user support tickets with priority tracking |
| **Analytics Dashboard** | Platform-wide analytics and growth metrics |

---

## 🏗️ System Architecture

```
                              ┌──────────────────────────────────────┐
                              │            Clients / Browser         │
                              │   (Candidate / Recruiter / Admin)    │
                              └───────────────────┬──────────────────┘
                                                  │ HTTPS
                                                  ▼
                              ┌──────────────────────────────────────┐
                              │         Nginx Reverse Proxy          │
                              │   • Gzip Compression                 │
                              │   • Security Headers (CSP, HSTS)     │
                              │   • SPA Fallback Routing             │
                              └───────┬──────────────────────┬───────┘
                                      │                      │
                       / (Static SPA) │                      │ /api/* (REST)
                                      ▼                      ▼
                        ┌───────────────────┐  ┌─────────────────────────────┐
                        │   React 18 SPA    │  │   Spring Boot 3 REST API    │
                        │  • Vite 6 Bundle  │  │   • RateLimitingFilter      │
                        │  • Vanilla CSS    │  │   • OAuth2 Resource Server  │
                        │  • Lucide Icons   │  │   • Method-Level RBAC       │
                        │  • React Router 7 │  │   • Spring Actuator         │
                        │  • PWA Support    │  │   • OpenAPI / Swagger       │
                        └─────────┬─────────┘  └──────┬───────────────┬──────┘
                                  │                   │               │
                 Public Key JWKS  │                   │ JDBC / SQL    │ REST / JSON
                                  ▼                   ▼               ▼
                        ┌───────────────────┐  ┌──────────────┐ ┌─────────────┐
                        │   Supabase        │  │ PostgreSQL   │ │ Google      │
                        │  • Auth (JWT)     │  │ • pgvector   │ │ Gemini AI   │
                        │  • Storage (S3)   │  │ • 27 Tables  │ │ • Flash 1.5 │
                        │  • RLS Policies   │  │ • Flyway V5  │ │ • Embed 004 │
                        └───────────────────┘  └──────────────┘ └─────────────┘
```

### Data Flow: Candidate Application Lifecycle

```
Candidate ──► Uploads PDF Resume ──► Supabase Storage (RLS Protected)
                                           │
                                           ▼
                               Spring Boot PDF Extractor (Apache PDFBox)
                                           │
                                           ▼
                               Gemini AI ──► 5-Dimension ATS Score & Skill Extraction
                                           │
                                           ▼
                               Candidate Applies to Job ──► JobApplication (APPLIED)
                                           │
                                           ▼
                               Notification Service ──► In-App Alert + Email to Recruiter
```

---

## 🧠 AI Intelligence Suite

HireHub AI integrates the **Google Gemini Generative AI Platform** with **PostgreSQL pgvector** for production-grade recruitment intelligence.

| AI Feature | Model | Output |
|------------|-------|--------|
| **Resume Analyzer** | `gemini-1.5-flash` | 5-category ATS Score (0–100) with keyword analysis |
| **Job Match Engine** | `gemini-1.5-flash` | Fit percentage + 5 category breakdown bars |
| **Semantic Search** | `text-embedding-004` | 768-dim normalized vector space with cosine similarity |
| **Cover Letter Generator** | `gemini-1.5-flash` | Multi-tone personalized letters (Professional/Enthusiastic/Concise) |
| **Interview Prep Coach** | `gemini-1.5-flash` | STAR-method behavioral & technical coaching |
| **Applicant Ranker** | `gemini-1.5-flash` | Automated candidate ranking against job criteria |
| **JD Generator** | `gemini-1.5-flash` | Professional job descriptions from simple prompts |

### 🛡️ AI Safety & Governance

- **Anti-Hallucination Guardrails** — All prompts strictly prohibit fabricating skills, experience, or credentials
- **PII Sanitization** — SSNs, phone numbers, DOB, gender, religion scrubbed before AI processing
- **Fairness Charter** — Compliant with EU AI Act: no evaluation of protected characteristics
- **Heuristic Fallback** — Deterministic local fallback engine ensures 100% uptime during Gemini outages
- **Assistive Decision-Support** — All AI output explicitly labeled as guidance for human hiring authorities

---

## 🖥️ Role-Based Portals

<table>
<tr>
<td align="center" width="33%">

### 👤 Candidate Portal
`/candidate/*`

Dashboard · Profile Builder · Job Search · Applications Tracker · AI Career Studio · Interviews · Assessments · Resume Builder · Messages · Notifications · Privacy Settings

</td>
<td align="center" width="33%">

### 🏢 Recruiter Portal
`/recruiter/*`

Dashboard · Company Profile · Job Management · Applicant Pipeline · Candidate Search · AI Tools · Interview Scheduling · Messages · Notifications · Privacy Settings

</td>
<td align="center" width="33%">

### 🛡️ Admin Portal
`/admin/*`

Dashboard · User Management · Company Verification · Job Moderation · Application Oversight · Audit Logs · Broadcasts · Analytics · Support Tickets · API Integration Tests

</td>
</tr>
</table>

### Public Pages

Landing Page · Job Discovery with Faceted Filters · Job Details · Company Profiles · Salary Insights · Public Candidate Profiles · About · Help & Support · Privacy Policy · Terms of Service

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Java 17 LTS** | Core language runtime (Eclipse Temurin) |
| **Spring Boot 3.5** | Application framework with auto-configuration |
| **Spring Security 6** | OAuth2 Resource Server with JWKS JWT validation |
| **Spring Data JPA** | Hibernate 6 ORM with HikariCP connection pooling |
| **PostgreSQL 15+** | Primary database engine (Supabase-hosted) |
| **pgvector** | 768-dim vector embeddings for semantic search |
| **Flyway** | Versioned database migration pipeline (V1–V5) |
| **Apache PDFBox 3.0** | PDF text extraction for resume parsing |
| **SpringDoc OpenAPI 2.8** | Interactive Swagger UI API documentation |
| **Spring Boot Actuator** | Health checks, metrics & monitoring endpoints |
| **Spring Retry + AOP** | Resilient external service calls with retry logic |
| **Spring Mail** | Branded HTML transactional email notifications |
| **Lombok** | Annotation-driven boilerplate reduction |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI with hooks & Context API |
| **Vite 6** | Lightning-fast HMR dev server & optimized bundling |
| **React Router DOM v7** | Declarative nested routing with lazy-loaded chunks |
| **Supabase JS v2** | Client-side authentication & file storage |
| **Axios** | HTTP client with JWT interceptors & error mapping |
| **Lucide React** | Beautifully consistent icon system |
| **Vanilla CSS** | HSL design tokens, glassmorphism, zero runtime overhead |
| **Google Fonts** | Inter + Outfit typography system |
| **PWA** | Service Worker with offline support & install prompt |

### Infrastructure & DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Multi-stage production containers |
| **Docker Compose** | Single-command full-stack orchestration |
| **Nginx 1.27 Alpine** | Reverse proxy with Gzip, SPA fallback, security headers |
| **GitHub Actions** | 4-job CI/CD pipeline (test → build → dockerize → deploy) |
| **Supabase** | Auth, PostgreSQL DB, Storage (S3-compatible), RLS |
| **Render / Railway** | Cloud PaaS deployment support |
| **Google Gemini API** | Generative AI & text embedding models |

---

## 📁 Project Structure

```
HireHub-AI/
├── 📂 .github/workflows/
│   └── ci-cd.yml                    # 4-job GitHub Actions CI/CD pipeline
│
├── 📂 backend/hirehub-backend/hirehub-backend/
│   ├── 📂 src/main/java/com/hirehub/hirehub_backend/
│   │   ├── 📂 config/              # SecurityConfig, OpenAPI, DataInitializer, CORS
│   │   ├── 📂 controller/          # 25 REST controllers (Auth, Jobs, AI, Admin, GDPR...)
│   │   ├── 📂 dto/                 # Request/Response DTOs (AI, Application, Candidate...)
│   │   ├── 📂 entity/              # 27 JPA entities (User, Job, Resume, Company...)
│   │   ├── 📂 enums/               # 21 enums (JobStatus, ApplicationStatus, RoleType...)
│   │   ├── 📂 exception/           # GlobalExceptionHandler, custom exceptions
│   │   ├── 📂 health/              # Custom Actuator health indicators
│   │   ├── 📂 jobaggregation/      # External job source aggregation pipeline
│   │   ├── 📂 jobmatching/         # AI job matching algorithms
│   │   ├── 📂 mapper/              # Entity ↔ DTO mapping utilities
│   │   ├── 📂 repository/          # 27 Spring Data JPA repositories
│   │   ├── 📂 security/            # RateLimitingFilter, JWT converter, audit
│   │   └── 📂 service/             # 28 business services (AI, Gemini, Email, GDPR...)
│   ├── Dockerfile                   # Multi-stage Java 17 production container
│   └── pom.xml                      # Maven dependencies & build configuration
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/          # Reusable UI components
│   │   │   ├── 📂 ai/              # AiJobMatchModal, AtsScoreGauge, AiSparkleCard
│   │   │   ├── 📂 applications/    # ApplicationStatusBadge
│   │   │   ├── 📂 candidate/       # Candidate-specific components
│   │   │   ├── 📂 common/          # ErrorBoundary, SkeletonLoader, Footer, EmptyState
│   │   │   ├── 📂 interviews/      # InterviewCard, ScheduleInterviewModal
│   │   │   ├── 📂 jobs/            # JobCard, JobFilter, ApplyJobModal
│   │   │   ├── 📂 layout/          # Sidebar navigation components
│   │   │   └── 📂 support/         # Support ticket components
│   │   ├── 📂 context/             # AuthContext, ThemeContext, LanguageContext
│   │   ├── 📂 hooks/               # useAuth, useDebounce, useRealtimeMessages
│   │   ├── 📂 layouts/             # MainLayout, CandidateLayout, RecruiterLayout, AdminLayout
│   │   ├── 📂 pages/
│   │   │   ├── 📂 admin/           # 10 admin pages (Dashboard, Users, Moderation, Audit...)
│   │   │   ├── 📂 auth/            # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   │   │   ├── 📂 candidate/       # 10 candidate pages (Dashboard, Profile, AI Tools, Resume...)
│   │   │   ├── 📂 common/          # Messages, Notifications, PrivacySecurity
│   │   │   ├── 📂 public/          # 12 public pages (Home, Jobs, Companies, Salary Insights...)
│   │   │   ├── 📂 recruiter/       # 9 recruiter pages (Dashboard, Jobs, Applicants, AI Tools...)
│   │   │   └── 📂 support/         # SupportPage, SupportTicketDetailsPage
│   │   ├── 📂 routes/              # AppRouter, ProtectedRoute, GuestRoute (RBAC guards)
│   │   ├── 📂 services/            # 23 API service modules (AI, Auth, Jobs, Messaging...)
│   │   ├── 📂 styles/              # Design system: variables.css, globals.css, components.css
│   │   └── 📂 utils/               # Utility functions
│   ├── Dockerfile                   # Multi-stage React + Nginx production container
│   ├── nginx.conf                   # Reverse proxy, Gzip, SPA fallback, security headers
│   └── package.json                 # Dependencies & 20+ test scripts
│
├── 📂 docs/                         # SRS, Architecture, Database, API, Security, Deployment guides
├── docker-compose.yml               # Full-stack orchestration (Backend + Frontend)
├── render.yaml                      # Render.com deployment blueprint
├── .env.docker.example              # Docker environment template
├── .env.production.example          # Production environment template
├── ARCHITECTURE.md                  # System architecture documentation
├── AI_ARCHITECTURE.md               # AI feature matrix & governance
├── SECURITY.md                      # Security model & threat analysis
├── CONTRIBUTING.md                  # Contribution guidelines
├── DEPLOYMENT.md                    # Deployment guides (Docker, PaaS, VPS)
└── ROADMAP.md                       # Future feature roadmap
```

---

## ⚡ Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Java JDK** | 17+ | Backend runtime |
| **Node.js** | 18+ | Frontend tooling |
| **Maven** | 3.9+ | Backend build (or use included `mvnw` wrapper) |
| **Docker** | 24+ | Containerized deployment (optional) |
| **Supabase Account** | — | Auth, Database & File Storage |
| **Google Gemini API Key** | — | AI features (optional — heuristic fallback available) |

### 1. Clone the Repository

```bash
git clone https://github.com/RjDipanshu/HireHub-AI.git
cd HireHub-AI
```

### 2. Backend Setup (Spring Boot)

```bash
cd backend/hirehub-backend/hirehub-backend

# Configure environment variables
# Edit src/main/resources/application.properties with your Supabase credentials

# Build and run
./mvnw clean spring-boot:run
```

The backend will start on **http://localhost:8080**

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Supabase URL and Anon Key

# Start development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 4. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **Anon Public Key** into the frontend `.env`
3. Copy your **Database Connection String** and **Password** into the backend config
4. Execute the RLS storage policies from `docs/supabase_storage_resumes_policies.sql` in the SQL Editor

---

## 🐳 Docker Deployment

Launch the entire platform with a single command:

```bash
# 1. Copy environment template
cp .env.docker.example .env

# 2. Fill in your real credentials
#    - Supabase URL, Anon Key, DB Password
#    - Gemini API Key (optional)

# 3. Build and launch
docker compose up -d
```

| Service | Container | Port | Technology |
|---------|-----------|------|------------|
| **Backend API** | `hirehub-backend` | `:8080` | Spring Boot 3 + Java 17 |
| **Frontend App** | `hirehub-frontend` | `:80` | React 18 + Nginx |

Both containers include health checks, automatic restarts, and communicate via the `hirehub-network` bridge.

---

## ⚙️ Environment Configuration

### Frontend Variables (`.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
VITE_API_BASE_URL=/api/v1
```

### Backend Variables

```env
# Database (Supabase PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://db.your-project.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_database_password

# Authentication (Supabase JWT)
SUPABASE_JWT_ISSUER=https://your-project.supabase.co/auth/v1
SUPABASE_JWK_SET_URI=https://your-project.supabase.co/auth/v1/.well-known/jwks.json

# AI (Google Gemini — optional, heuristic fallback available)
GEMINI_API_KEY=your_google_gemini_api_key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:5173

# Email (Optional — logs to console if not configured)
SPRING_MAIL_HOST=smtp.sendgrid.net
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=apikey
SPRING_MAIL_PASSWORD=your_sendgrid_api_key
```

> **💡 Tip:** The backend includes a built-in heuristic circuit-breaker that provides realistic ATS analysis and mock interview questions when the Gemini API key is not configured, so the platform works fully without an AI key.

---

## 🧪 Testing

HireHub AI ships with **277+ automated tests** across **17+ test suites** with a **100% pass rate**.

```bash
cd frontend

# Run the complete test suite
npm run test:all
```

### Available Test Suites

| Command | Tests | Coverage Area |
|---------|-------|---------------|
| `npm run test:api` | 18 | Axios client, error mapping, JWT interceptors |
| `npm run test:rbac` | 22 | Protected route guards, role authority verification |
| `npm run test:candidate` | 16 | Candidate profile CRUD operations |
| `npm run test:candidate-flow` | 15 | End-to-end application submission & bookmarks |
| `npm run test:recruiter` | 18 | Job creation, pipeline stages, AI ranking |
| `npm run test:admin` | 14 | User status, compliance, broadcast alerts |
| `npm run test:ai` | 13 | 5-dimension ATS scoring, STAR interview coaching |
| `npm run test:storage` | 12 | Magic bytes, 10MB limits, path isolation |
| `npm run test:notifications` | 8 | In-app alerts, email triggers, preferences |
| `npm run test:e2e` | 10 | Full recruitment lifecycle simulation |
| `npm run test:docker-ci` | 11 | Dockerfiles, Nginx directives, CI/CD schema |
| `npm run test:security-audit` | 10 | Secret leak prevention, non-root, error masking |
| `npm run test:semantic-search` | — | Semantic vector search quality |
| `npm run test:ai-evaluation` | — | AI accuracy, stability & fairness benchmarks |
| `npm run test:e2e-journeys` | — | Multi-role end-to-end user journeys |
| `npm run test:ui-ux-audit` | — | UI/UX compliance and accessibility checks |
| `npm run test:forgot-password` | — | Password reset flow verification |

### Backend Tests

```bash
cd backend/hirehub-backend/hirehub-backend
./mvnw clean test
```

---

## 📡 API Documentation

The backend exposes **25 REST controllers** with full **OpenAPI 3.0 / Swagger** documentation.

**Swagger UI:** `http://localhost:8080/swagger-ui.html`

### Core API Endpoints

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/sync` | Sync Supabase user with backend |
| `GET` | `/api/v1/auth/me` | Get current authenticated user |

</details>

<details>
<summary><strong>💼 Jobs</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/jobs` | Search jobs with multi-criteria filters |
| `POST` | `/api/v1/jobs` | Create new job posting (Recruiter) |
| `GET` | `/api/v1/jobs/{id}` | Get job details |
| `PATCH` | `/api/v1/jobs/{id}/status` | Update job status |
| `POST` | `/api/v1/jobs/{id}/save` | Bookmark a job |

</details>

<details>
<summary><strong>📋 Applications</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/applications` | Submit job application |
| `GET` | `/api/v1/applications/me` | Get candidate's applications |
| `PATCH` | `/api/v1/applications/{id}/status` | Update application status (Recruiter) |
| `DELETE` | `/api/v1/applications/{id}` | Withdraw application |

</details>

<details>
<summary><strong>🧠 AI Intelligence</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ai/resume-analysis` | AI resume ATS analysis |
| `POST` | `/api/v1/ai/resume-analysis/upload` | Upload & analyze PDF resume |
| `POST` | `/api/v1/ai/job-match/{jobId}` | AI job-candidate match scoring |
| `POST` | `/api/v1/ai/cover-letter` | Generate AI cover letter |
| `POST` | `/api/v1/ai/interview-prep` | Generate interview prep questions |
| `POST` | `/api/v1/ai/semantic/jobs` | Semantic natural-language job search |
| `POST` | `/api/v1/ai/semantic/candidates` | Semantic candidate talent search |
| `GET` | `/api/v1/ai/rank-applicants/{jobId}` | AI applicant ranking |
| `POST` | `/api/v1/ai/job-description` | AI job description generator |
| `POST` | `/api/v1/ai/candidate-match` | AI candidate-job match scoring |

</details>

<details>
<summary><strong>👤 Candidate Profile</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/candidates/me` | Get current candidate profile |
| `PUT` | `/api/v1/candidates/me` | Update candidate profile |
| `POST` | `/api/v1/candidates/me/education` | Add education entry |
| `POST` | `/api/v1/candidates/me/experience` | Add work experience |
| `POST` | `/api/v1/candidates/me/skills` | Add skill with proficiency |
| `POST` | `/api/v1/candidates/me/resumes` | Upload resume |

</details>

<details>
<summary><strong>🏢 Recruiter & Company</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/recruiters/me` | Get current recruiter profile |
| `GET` | `/api/v1/companies` | Search companies |
| `POST` | `/api/v1/companies` | Register company |
| `PATCH` | `/api/v1/companies/{id}/verify` | Verify company (Admin) |

</details>

<details>
<summary><strong>📅 Interviews & Notifications</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/interviews` | Schedule interview |
| `PATCH` | `/api/v1/interviews/{id}/status` | Update interview status |
| `GET` | `/api/v1/notifications` | Get user notifications |
| `PATCH` | `/api/v1/notifications/{id}/read` | Mark notification as read |

</details>

<details>
<summary><strong>🛡️ Admin & GDPR</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users` | List all users (Admin) |
| `PATCH` | `/api/v1/users/{id}/status` | Toggle user status (Admin) |
| `GET` | `/api/v1/audit-logs` | Query audit trail (Admin) |
| `POST` | `/api/v1/gdpr/export` | GDPR data export request |
| `DELETE` | `/api/v1/gdpr/delete` | GDPR right-to-erasure request |

</details>

---

## 🔒 Security

HireHub AI implements **defense-in-depth** across all layers:

```
[Client Request]
       │
       ▼
1. Nginx ─── Defensive Headers (CSP, HSTS, X-Frame-Options: DENY)
       │
       ▼
2. RateLimitingFilter ─── Sliding window token bucket
   • General: 120 req/min    • AI: 20 req/min    • Auth: 30 req/min
       │
       ▼
3. Spring Security OAuth2 ─── RS256/ES256 JWT via Supabase JWKS
       │
       ▼
4. Method & Object-Level Authorization ─── Data isolation per user
       │
       ▼
5. Input Sanitization ─── Magic byte inspection, 10MB limit, PII scrubbing
       │
       ▼
6. PostgreSQL RLS ─── Row-Level Security policies for data isolation
```

### Key Security Features

- **Zero Secret Exposure** — No `service_role` keys in frontend; all secrets via env vars
- **5-Layer Resume Upload Security** — Extension → MIME → Magic Bytes → Size → RLS isolation
- **PII Scrubbing** — SSNs, phone, DOB, gender, religion redacted before AI processing
- **GDPR Compliance** — Data export and right-to-erasure endpoints
- **Audit Logging** — All administrative actions tracked with timestamps and actor IDs
- **Non-Root Containers** — Docker images drop root privileges to dedicated `hirehub` user

---

## 🚀 Deployment

### Option A: Docker on VPS (DigitalOcean / AWS EC2)

```bash
git clone https://github.com/RjDipanshu/HireHub-AI.git
cd HireHub-AI
cp .env.docker.example .env
# Edit .env with your real credentials
docker compose up -d
```

### Option B: PaaS (Render / Railway)

A `render.yaml` blueprint is included for one-click Render deployment:

- **Backend**: Docker runtime, port 8080, health check at `/actuator/health`
- **Frontend**: Static site, build command `npm run build`, publish dir `dist`

### Option C: Separate Hosting

- **Backend** → Any Java 17 host (AWS Elastic Beanstalk, Google Cloud Run, Railway)
- **Frontend** → Any static host (Vercel, Netlify, Cloudflare Pages)

### Post-Deployment Checklist

- [ ] Execute Supabase Storage RLS policies (`docs/supabase_storage_resumes_policies.sql`)
- [ ] Configure Google Gemini API key in production env
- [ ] Update Supabase Auth redirect URLs to production domain
- [ ] Configure SMTP for transactional emails (optional)
- [ ] Set `CORS_ALLOWED_ORIGINS` to production domain

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| ✅ | Full-stack Candidate/Recruiter/Admin portals | **Complete** |
| ✅ | AI Resume Analyzer & ATS Scoring | **Complete** |
| ✅ | AI Job Match & Semantic Search | **Complete** |
| ✅ | AI Cover Letter Generator & Interview Prep | **Complete** |
| ✅ | Docker multi-stage containers & CI/CD | **Complete** |
| ✅ | GDPR compliance & audit logging | **Complete** |
| ✅ | PWA with Service Worker | **Complete** |
| ✅ | Dark mode with smooth transitions | **Complete** |
| ✅ | Direct messaging system | **Complete** |
| ✅ | Support ticket system | **Complete** |
| ✅ | Skill assessments with badge system | **Complete** |
| 🔮 | WebRTC native video interview rooms | Planned |
| 🔮 | Real-time WebSocket chat (STOMP / SockJS) | Planned |
| 🔮 | Stripe billing (Free / Pro / Enterprise) | Planned |
| 🔮 | Live code sandbox (Monaco editor) | Planned |
| 🔮 | Mobile native app (React Native) | Planned |

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

```bash
# 1. Fork & clone the repository
git clone https://github.com/<your-username>/HireHub-AI.git

# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Run the full test suite before pushing
cd frontend && npm run test:all

# 4. Submit a Pull Request
```

### Branching Model

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready, CI-verified code only |
| `develop` | Integration branch for active development |
| `feature/*` | New feature branches |
| `fix/*` | Bug fix branches |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, data flow diagrams |
| [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) | AI feature matrix, embeddings, governance |
| [SECURITY.md](SECURITY.md) | Security model, threat analysis, compliance |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment guides for Docker, PaaS, VPS |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines and code standards |
| [ROADMAP.md](ROADMAP.md) | Feature roadmap and development phases |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Detailed REST API reference |
| [DATABASE.md](DATABASE.md) | Database schema and migration guide |
| [docs/SRS.md](docs/SRS.md) | Software Requirements Specification |
| [docs/PROJECT_COMPREHENSIVE_REPORT.md](docs/PROJECT_COMPREHENSIVE_REPORT.md) | Full project analysis report |

---

<div align="center">

**Built with ❤️ by [Dipanshu Raj](https://github.com/RjDipanshu)**

⭐ **Star this repository** if HireHub AI helped or inspired you!

[⬆ Back to Top](#-hirehub-ai)

</div>
