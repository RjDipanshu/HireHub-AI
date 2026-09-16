# REST API Documentation — HireHub AI

HireHub AI exposes a comprehensive RESTful API built on **Spring Boot 3**, structured around domain-driven resource endpoints. All protected endpoints expect a Supabase JWT bearer token in the `Authorization: Bearer <token>` header.

Interactive Swagger UI documentation is available at:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI 3.0 Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 1. Authentication & Users (`/api/v1/auth`, `/api/v1/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/users` | Authenticated | Synchronize or initialize user profile from Supabase JWT |
| `GET` | `/api/v1/users/me` | Authenticated | Retrieve profile and role metadata for authenticated user |
| `PUT` | `/api/v1/users/me` | Authenticated | Update user first name, last name, or phone number |

---

## 2. Candidate Services (`/api/v1/candidate`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/candidate/profile` | Candidate / Admin | Retrieve current candidate profile, skills, education, and experience |
| `PUT` | `/api/v1/candidate/profile` | Candidate | Update candidate profile headline, bio, location, and links |
| `POST` | `/api/v1/candidate/skills` | Candidate | Add a verified skill with proficiency level (`BEGINNER`, `INTERMEDIATE`, `EXPERT`) |
| `DELETE` | `/api/v1/candidate/skills/{id}` | Candidate | Remove candidate skill |
| `POST` | `/api/v1/candidate/resumes` | Candidate | Register uploaded resume from Supabase Storage |
| `GET` | `/api/v1/candidate/resumes` | Candidate | List all candidate resumes |
| `DELETE` | `/api/v1/candidate/resumes/{id}` | Candidate | Soft-delete resume |

---

## 3. Recruiter & Company Services (`/api/v1/recruiter`, `/api/v1/companies`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/recruiter/profile` | Recruiter / Admin | Retrieve recruiter designation and associated company |
| `PUT` | `/api/v1/recruiter/profile` | Recruiter | Update recruiter profile |
| `POST` | `/api/v1/companies` | Recruiter / Admin | Create enterprise company profile with logo, size, and website |
| `GET` | `/api/v1/companies/{id}` | Public | Retrieve public company profile and active listings |
| `PUT` | `/api/v1/companies/{id}` | Recruiter / Admin | Update company details (ownership verified) |

---

## 4. Job Management (`/api/v1/jobs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/jobs` | Public | Paginated job search with multi-faceted filtering |
| `GET` | `/api/v1/jobs/{id}` | Public | Retrieve complete job details, requirements, and company info |
| `POST` | `/api/v1/jobs` | Recruiter / Admin | Publish new job opening with skills and salary range |
| `PUT` | `/api/v1/jobs/{id}` | Recruiter / Admin | Update existing job posting (ownership verified) |
| `DELETE` | `/api/v1/jobs/{id}` | Recruiter / Admin | Soft-delete job posting |

---

## 5. Job Applications (`/api/v1/applications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/applications` | Candidate | Apply for job with attached resume and cover letter |
| `GET` | `/api/v1/applications/me` | Candidate | List all applications submitted by candidate |
| `GET` | `/api/v1/applications/recruiter` | Recruiter | List all applications received for recruiter's company |
| `GET` | `/api/v1/applications/{id}` | Object Owner / Admin | Retrieve single application (Object-level authorized) |
| `PATCH` | `/api/v1/applications/{id}/status`| Recruiter / Admin | Advance applicant pipeline stage (`SHORTLISTED`, `REJECTED`) |
| `DELETE` | `/api/v1/applications/{id}` | Candidate | Withdraw active job application |

---

## 6. AI Intelligence Services (`/api/v1/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/ai/analyze-resume` | Candidate | Full ATS scorecard, technical skills, gaps, and suggestions |
| `POST` | `/api/v1/ai/job-match/{jobId}` | Candidate | Structured candidate-job fit analysis (0-100 score + 5 categories) |
| `POST` | `/api/v1/ai/semantic/jobs` | Public | Natural-language semantic job search powered by 768-dim embeddings |
| `POST` | `/api/v1/ai/semantic/candidates` | Recruiter | Natural-language recruiter candidate scouting |
| `POST` | `/api/v1/ai/cover-letter` | Candidate | Generates tailored cover letter with 4 selectable tone presets |
| `POST` | `/api/v1/ai/interview-prep` | Candidate | Technical, behavioral, and situational question generator |
| `GET` | `/api/v1/ai/metrics` | Admin | Real-time AI request count, token usage, latency, and cost telemetry |

---

## 7. Standard HTTP Status Codes & Error Responses

All API errors return standard RFC-7807 compliant JSON:
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Job posting with ID 'd3b07384-d113-4f93-b467-33fa81309d47' does not exist.",
  "timestamp": "2026-09-09T19:50:00"
}
```

- `200 OK`: Successful operation.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure on request body.
- `401 Unauthorized`: Missing or invalid Bearer JWT.
- `403 Forbidden`: Insufficient role permissions or object-level ownership violation.
- `404 Not Found`: Resource does not exist or has been soft-deleted.
- `429 Too Many Requests`: Rate limit exceeded (Retry-After header present).
- `500 Internal Server Error`: Server error (SQL stack traces sanitized).
