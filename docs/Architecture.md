# System Architecture

## Overview

HireHub AI follows a modern three-tier architecture with React as the frontend, Spring Boot as the backend, Supabase for cloud database, authentication and storage, and Google Gemini AI for intelligent features.

The architecture is designed to be scalable, secure, and maintainable following enterprise software development practices.

---

# High-Level Architecture

```

+-------------------------------------------------------+
\|                   React Frontend                      |
\|-------------------------------------------------------|
\| Login | Dashboard | Jobs | Resume | AI Assistant     |
+-------------------------+-----------------------------+
|
| REST API (HTTPS)
|
v
+-------------------------------------------------------+
\|              Spring Boot Backend (Java 17)            |
\|-------------------------------------------------------|
\| Controllers                                           |
\| Services                                              |
\| Business Logic                                        |
\| Security (JWT Validation)                             |
\| Exception Handling                                    |
+-------------------------+-----------------------------+
|
|
+----------------+-------------------+
| |
v v
+-------------------+ +----------------------+
| Supabase | | Google Gemini AI |
| PostgreSQL | | Resume Analysis |
| Authentication | | ATS Scoring |
| Storage | | Cover Letter |
+-------------------+ +----------------------+
