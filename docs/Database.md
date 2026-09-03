# Database Design

# Overview

HireHub AI uses **Supabase PostgreSQL** as the primary relational database and **Supabase Authentication** for user authentication and session management.

The backend is developed using **Spring Boot (Java 17)** with **Spring Data JPA (Hibernate)** as the ORM. Spring Boot handles all business logic while Supabase provides database, authentication, and file storage services.

The database is designed using normalization principles to ensure scalability, maintainability, and high performance.

---

# Database Technology

- Database: PostgreSQL
- Provider: Supabase
- ORM: Hibernate (JPA)
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Migration Tool: Flyway (Future Enhancement)

---

# Database Modules

The system is divided into the following modules:

- Authentication
- Candidate
- Recruiter
- Company
- Job
- Application
- Resume
- Interview
- Notification
- AI
- Audit

---

# Core Tables

## Authentication

Since authentication is managed by Supabase, the application only stores additional user information.

### Users

Stores common information of every user.

Example:

- Supabase User ID
- Name
- Email
- Role
- Status
- Profile Image

---

### Roles

Stores system roles.

Examples:

- Candidate
- Recruiter
- Admin

---

## Candidate Module

### Candidate Profiles

Stores candidate-specific information.

- Bio
- Phone
- Date of Birth
- LinkedIn
- GitHub
- Portfolio
- Current Location

---

### Resumes

Stores uploaded resume information.

- Resume URL
- Resume Name
- Resume Version
- Upload Date

---

### Education

Stores educational qualifications.

---

### Experience

Stores work experience.

---

### Certifications

Stores certifications earned by candidates.

---

### Skills

Master list of skills.

Examples:

- Java
- Spring Boot
- React
- PostgreSQL

---

### Candidate Skills

Junction table connecting candidates with skills.

---

## Recruiter Module

### Recruiter Profiles

Stores recruiter-specific information.

---

### Companies

Stores company details.

- Company Name
- Industry
- Website
- Description
- Logo
- Location

---

## Job Module

### Jobs

Stores job postings.

Fields include:

- Title
- Description
- Experience
- Salary
- Employment Type
- Work Mode
- Location
- Deadline

---

### Job Skills

Required skills for a job.

---

### Applications

Stores candidate job applications.

- Candidate
- Job
- Resume
- Application Status
- Applied Date

---

### Saved Jobs

Stores bookmarked jobs.

---

## Interview Module

### Interviews

Stores interview schedules.

- Interview Date
- Meeting Link
- Interview Status
- Interview Type

---

## Notification Module

### Notifications

Stores application notifications.

Examples:

- Job Applied
- Interview Scheduled
- Application Rejected
- Offer Released

---

## AI Module

### Resume Analysis

Stores AI-generated resume analysis.

- ATS Score
- Strengths
- Weaknesses
- Suggestions

---

### Cover Letters

Stores AI-generated cover letters.

---

### Interview Sessions

Stores AI mock interview sessions.

---

## Audit Module

### Audit Logs

Stores important system activities.

Examples:

- User Login
- Job Posted
- Resume Uploaded
- Interview Scheduled

---

# Entity Relationships

## One-to-One

- User → Candidate Profile
- User → Recruiter Profile

---

## One-to-Many

- Company → Jobs
- Recruiter → Jobs
- Candidate → Applications
- Candidate → Resumes
- Candidate → Notifications
- Job → Applications

---

## Many-to-Many

- Candidate ↔ Skills
- Job ↔ Skills

These relationships will be implemented using junction tables.

---

# Primary Key Strategy

All application tables will use **UUID** as the primary key.

Example:

```
550e8400-e29b-41d4-a716-446655440000
```

Advantages:

- Better security
- Cloud-friendly
- Distributed system support
- Difficult to guess IDs

---

# Common Audit Columns

Every table will contain:

- id
- created_at
- updated_at
- created_by
- updated_by
- is_deleted

These fields will be inherited from a common `BaseEntity` class.

---

# Naming Conventions

## Tables

Use **snake_case**

Examples:

- candidate_profiles
- recruiter_profiles
- job_applications

---

## Columns

Use **snake_case**

Examples:

- created_at
- updated_at
- company_name

---

## Java Classes

Use **PascalCase**

Examples:

- CandidateProfile
- RecruiterProfile

---

## Variables

Use **camelCase**

Examples:

- createdAt
- updatedAt

---

# Database Design Principles

The database follows:

- Third Normal Form (3NF)
- Foreign Key Constraints
- UUID Primary Keys
- Soft Delete Support
- Audit Columns
- Optimized Indexing
- Data Integrity Constraints

---

# Estimated Database Size

| Module | Estimated Tables |
|----------|-----------------:|
| Authentication | 2 |
| Candidate | 7 |
| Recruiter | 2 |
| Job | 4 |
| Interview | 1 |
| Notification | 1 |
| AI | 3 |
| Audit | 1 |

**Estimated Total Tables:** 20+

---

# Future Enhancements

- Redis Caching
- Elasticsearch
- Database Partitioning
- Materialized Views
- Read Replicas
- Query Optimization
- Multi-Tenant Support
- Event-Driven Architecture