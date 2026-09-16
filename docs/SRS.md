# HireHub AI - Intelligent Recruitment Platform

## 1. Project Description

HireHub AI is a modern AI-powered recruitment platform designed to simplify the hiring process for candidates, recruiters, and administrators. The platform enables candidates to search and apply for jobs, create AI-optimized resumes, and receive personalized career guidance. Recruiters can post job openings, manage applicants, and leverage AI to identify the best candidates efficiently. Administrators oversee platform operations, user management, and analytics.

The application is built using a modern full-stack architecture with React for the frontend, Spring Boot (Java 17) for the backend, Supabase for PostgreSQL, authentication, and storage, and Google Gemini AI for intelligent features.

---

## 2. Objectives

The primary objectives of HireHub AI are:

- Develop a scalable recruitment platform using modern software architecture.
- Simplify the hiring process for candidates and recruiters.
- Integrate AI-powered features to enhance recruitment efficiency.
- Provide secure authentication and authorization using Supabase.
- Build a responsive and user-friendly interface.
- Follow industry-standard coding practices and clean architecture.
- Create a production-ready application suitable for enterprise environments.

---

## 3. Actors

The system consists of three primary user roles.

### Candidate

The candidate can:

- Register and Login
- Manage Profile
- Upload Resume
- Build Resume
- Search Jobs
- Apply for Jobs
- Track Applications
- Save Jobs
- Receive Notifications
- Generate AI Cover Letter
- Analyze Resume using AI
- Practice AI Interview Questions

---

### Recruiter

The recruiter can:

- Register Organization
- Create Company Profile
- Post Jobs
- Update Job Listings
- Delete Job Listings
- View Applicants
- Shortlist Candidates
- Schedule Interviews
- Use AI Resume Ranking
- Generate AI Job Descriptions

---

### Administrator

The administrator can:

- Manage Users
- Manage Recruiters
- Manage Companies
- Manage Jobs
- View Reports
- Monitor System Activity
- Manage Platform Settings
- View Analytics Dashboard

---

## 4. Features

### Authentication

- User Registration
- Login
- Logout
- Forgot Password
- Email Verification
- Role-Based Access Control

### Candidate Module

- Profile Management
- Resume Upload
- Resume Builder
- Job Search
- Job Filters
- Saved Jobs
- Job Application Tracking

### Recruiter Module

- Company Management
- Job Posting
- Applicant Management
- Interview Scheduling

### Admin Module

- User Management
- Recruiter Approval
- Analytics Dashboard
- Reports

### Common Features

- Notifications
- Search
- Pagination
- Filtering
- Dashboard
- Responsive Design

---

## 5. Technology Stack

### Frontend

- React.js
- Tailwind CSS
- Axios
- React Router

### Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Maven

### Database & Cloud

- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage

### AI

- Google Gemini API

### Other Tools

- Git
- GitHub
- Docker
- Swagger
- Postman

---

## 6. AI Features

The application integrates Artificial Intelligence to improve recruitment and job searching.

### Candidate AI Features

- AI Resume Analyzer
- ATS Resume Score
- Resume Improvement Suggestions
- AI Cover Letter Generator
- AI Career Assistant
- AI Interview Question Generator
- AI Skill Gap Analysis

### Recruiter AI Features

- AI Resume Ranking
- AI Candidate Summary
- AI Job Description Generator
- AI Candidate Matching

---

## 8. Specific Functional Requirements (FR)

- **FR-1: User Authentication & Role Assignment**: System must authenticate users via Supabase OAuth2/JWT and synchronize roles (CANDIDATE, RECRUITER, ADMIN) through backend `/auth/sync`. Role spoofing on client-side must be rejected.
- **FR-2: Candidate Profile & Vault**: Candidates must be able to maintain living career details (Education, Experience, Skills, Certifications) and upload resumes up to 10MB validated by MIME and binary magic bytes (`%PDF-`).
- **FR-3: Job Discovery & Multi-Criteria Filtering**: System must provide public job searching with pagination, salary filtering, work mode selection (REMOTE, HYBRID, ONSITE), and keyword matching.
- **FR-4: Job Application Lifecycle**: Candidates must apply with selected resume and cover letter; recruiters must transition application status (`APPLIED` → `SCREENING` → `SHORTLISTED` → `INTERVIEW` → `OFFERED` / `REJECTED`).
- **FR-5: Interview Coordination**: Recruiters must schedule virtual interviews with duration, scheduled datetime, and meeting links; candidates receive automated notifications.
- **FR-6: AI Career Intelligence**: System must invoke Google Gemini API for 5-factor ATS scoring, categorized recommendations, target job gap analysis, and interactive STAR interview evaluation.
- **FR-7: Communication & Alerts**: Platform must provide in-app badge alerts, transactional HTML emails for status updates, and user-configurable alert preferences.
- **FR-8: Administrative Governance**: Admins must moderate job postings, manage user account states (`ACTIVE`, `INACTIVE`, `BLOCKED`), and dispatch system-wide broadcasts.

---

## 9. Non-Functional Requirements (NFR)

- **NFR-1: Security**: Zero sensitive secrets committed to frontend. Symmetric service keys forbidden in client code. Asymmetric JWKS public keys for token validation. Non-root container execution.
- **NFR-2: Performance**: Sub-200ms REST API response times under standard load; static assets cached for 1 year immutable via Nginx; Gzip compression enabled.
- **NFR-3: Reliability & Resilience**: Heuristic fallback circuit-breaker when external AI APIs experience quota limits or timeouts. Non-blocking email notifications.
- **NFR-4: Data Integrity**: Versioned Flyway migrations (`V1`, `V2`) ensuring deterministic database schema management and foreign key constraints.
- **NFR-5: Observability**: Health check probes (`/healthz`, `/actuator/health`), client-side telemetry service, and standardized API error formatting (`ErrorResponseDTO`).

---

## 10. Future Scope

- Real-time WebRTC video interview rooms.
- WebSocket-based direct candidate-recruiter messaging.
- Code execution sandbox for live technical assessments.
- AI-driven salary benchmarking and market intelligence.

