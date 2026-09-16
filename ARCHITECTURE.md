# System Architecture — HireHub AI

HireHub AI is engineered using a resilient 3-tier cloud-native architecture combining **Spring Boot 3 (Java 17)**, **React 18 (Vite 6)**, **Supabase PostgreSQL & Storage**, and the **Google Gemini Generative AI Platform**.

---

## 1. High-Level Architecture Topology

```
                              ┌──────────────────────────────────────┐
                              │            Clients / Browser         │
                              │   (Candidate / Recruiter / Admin)    │
                              └───────────────────┬──────────────────┘
                                                  │ HTTPS / WSS
                                                  ▼
                              ┌──────────────────────────────────────┐
                              │            Nginx Reverse Proxy       │
                              │       - Gzip compression             │
                              │       - Defensive Security Headers   │
                              │       - SPA Fallback routing         │
                              └───────┬──────────────────────┬───────┘
                                      │                      │
                       / (Static SPA) │                      │ /api/* (REST API)
                                      ▼                      ▼
                        ┌───────────────────┐  ┌─────────────────────────────┐
                        │   React 18 App    │  │   Spring Boot 3 REST API    │
                        │  (Vite Bundled)   │  │   - RateLimitingFilter      │
                        │  - Tailwind CSS   │  │   - OAuth2 Resource Server  │
                        │  - Lucide Icons   │  │   - Method-Level RBAC       │
                        │  - React Router 7 │  │   - Actuator Metrics        │
                        └─────────┬─────────┘  └──────┬───────────────┬──────┘
                                  │                   │               │
                 Public Key JWKS  │                   │ JDBC / SQL    │ REST / JSON
                                  ▼                   ▼               ▼
                        ┌───────────────────┐  ┌──────────────┐ ┌─────────────┐
                        │ Supabase Auth     │  │ PostgreSQL   │ │ Google      │
                        │ & Storage Bucket  │  │ - pgvector   │ │ Gemini AI   │
                        │ - JWT Tokens      │  │ - 17 Tables  │ │ - Flash 1.5 │
                        │ - Resume Vault    │  │ - Indexes V5 │ │ - Embeddings│
                        └───────────────────┘  └──────────────┘ └─────────────┘
```

---

## 2. Core Architectural Subsystems

### 2.1 Presentation Tier (React 18 + Vite)
- **Framework**: React 18 with modern functional hooks and Context API (`AuthContext`).
- **Styling**: Tailored Design System with glassmorphic cards, emerald/indigo/amber visual state palettes, and responsive grids.
- **Code Splitting**: Route-level dynamic imports (`React.lazy` and `Suspense`) isolating Candidate, Recruiter, and Admin portal chunks.
- **Client Security**: Strictly zero private service keys. Authenticates via Supabase public client and attaches short-lived JWT tokens as `Bearer` headers to backend requests.

### 2.2 Application Tier (Spring Boot 3 & Security)
- **Runtime**: Java 17 LTS on Spring Boot 3.5.16.
- **Security & Authorization**:
  - `RateLimitingFilter`: Sliding-window token bucket preventing DoS and API abuse (120 req/min general, 20 req/min AI).
  - `OAuth2 Resource Server`: Public JWKS verification validating Supabase RS256 JWT tokens.
  - `SpringSecurityAuditorAware`: Populates entity `createdBy`, `updatedBy`, `createdAt`, `updatedAt` timestamps.
  - Object-Level Authorization: Enforces data isolation so users cannot inspect or mutate applications/profiles outside their ownership.
- **Data Persistence**: Spring Data JPA / Hibernate 6 connecting via HikariCP pool with leak detection and connection pooling.

### 2.3 Database Tier (PostgreSQL + pgvector)
- **Database Engine**: PostgreSQL 15+ hosted on Supabase.
- **Vector Search**: `pgvector` extension storing 768-dimensional normalized embedding vectors for jobs and candidates.
- **Migration Pipeline**: Flyway versioned migrations (`V1` to `V5`):
  - `V1`: Core schema (users, roles, profiles, jobs, applications, interviews, notifications).
  - `V2`: Relational composite indexes.
  - `V3`: Resume analysis JSON schemas.
  - `V4`: Vector columns and embedding storage.
  - `V5`: Soft-delete aware partial indexes for low-latency queries.

### 2.4 AI Intelligence & Semantic Tier (Google Gemini)
- **Generative AI Model**: `gemini-1.5-flash` for high-throughput structured resume analysis and job matching.
- **Embeddings Model**: `text-embedding-004` (768 dimensions) with L2 normalization.
- **Anti-Hallucination Guardrails**: Prompts strictly prohibit fabricating skills, experience metrics, or credentials.
- **Heuristic Local Fallback Engine**: Deterministic fallback engine providing 100% operational uptime during network partition or Gemini quota exhaustion.
- **Fairness & PII Sanitizer**: Pre-AI pipeline scrubs SSNs, phone numbers, age, gender, religion, and marital status.

---

## 3. Data Flow Diagrams

### 3.1 Candidate Application Flow
```
Candidate -> Uploads PDF Resume -> Supabase Storage (RLS Protected)
     │
     ▼
Spring Boot PDF Extractor -> Scrapes text via Apache PDFBox
     │
     ▼
Gemini AI Engine -> Evaluates 5-Dimensional ATS Score & Extracts Skills
     │
     ▼
Candidate Applies to Job -> JobApplication Created (Status: APPLIED)
     │
     ▼
Notifications Service -> In-App Alert + Transactional Email to Recruiter
```

### 3.2 Semantic Job Search Flow
```
Candidate Query: "Find scalable backend systems roles using Java"
     │
     ▼
POST /api/v1/ai/semantic/jobs
     │
     ▼
GeminiService -> Generates 768-dim Query Vector
     │
     ▼
SemanticSearchService -> Computes Cosine Similarity across Active Job Corpus
     │
     ▼
Ranked JSON Response with Semantic Match Percentage & Match Rationale
```
