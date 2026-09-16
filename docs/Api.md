# HireHub AI - API Documentation

## Base URL
- **Local:** `http://localhost:8080`
- **Prefix:** `/api/v1`

---

## Authentication Header
Protected endpoints require a valid Supabase Bearer JWT token in the `Authorization` header:
```http
Authorization: Bearer <SUPABASE_JWT_ACCESS_TOKEN>
```

---

## 1. Test & Health Endpoints

### 1.1 Public Test Endpoint
- **URL:** `/api/v1/test/public`
- **Method:** `GET`
- **Access:** Public (No token required)
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Public endpoint is accessible without authentication."
}
```

### 1.2 Protected Test Endpoint
- **URL:** `/api/v1/test/protected`
- **Method:** `GET`
- **Access:** Authenticated (Supabase JWT required)
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Access granted to protected endpoint! Supabase JWT is valid.",
  "supabaseUserId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "issuer": "https://<supabase-project>.supabase.co/auth/v1",
  "expiresAt": "2026-09-03T18:00:00Z"
}
```
- **Error Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-09-03T18:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized"
}
```

---

## 2. Role Management Endpoints (`/api/v1/roles`)

### 2.1 Get All Roles
- **URL:** `/api/v1/roles`
- **Method:** `GET`
- **Access:** Authenticated
- **Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "ADMIN",
    "description": "System Administrator with full access"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "RECRUITER",
    "description": "Recruiter responsible for job postings and candidate management"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "CANDIDATE",
    "description": "Candidate looking for job opportunities"
  }
]
```

### 2.2 Get Role by ID
- **URL:** `/api/v1/roles/{id}`
- **Method:** `GET`
- **Access:** Authenticated
- **Path Parameter:** `id` (UUID)

### 2.3 Get Role by Name
- **URL:** `/api/v1/roles/name/{name}`
- **Method:** `GET`
- **Access:** Authenticated
- **Path Parameter:** `name` (`ADMIN` | `RECRUITER` | `CANDIDATE`)

### 2.4 Create Role
- **URL:** `/api/v1/roles`
- **Method:** `POST`
- **Access:** Authenticated (Admin)
- **Request Body:**
```json
{
  "name": "CANDIDATE",
  "description": "Candidate looking for job opportunities"
}
```

---

## 3. User Management Endpoints (`/api/v1/users`)

### 3.1 Get All Users
- **URL:** `/api/v1/users`
- **Method:** `GET`
- **Access:** Authenticated
- **Response (200 OK):**
```json
[
  {
    "id": "b3f3b9c6-1111-2222-3333-444455556666",
    "supabaseUserId": "7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "profileImageUrl": "https://supabase.co/storage/v1/avatar.png",
    "role": "CANDIDATE",
    "status": "ACTIVE",
    "emailVerified": true,
    "createdAt": "2026-09-03T12:00:00",
    "updatedAt": "2026-09-03T12:00:00"
  }
]
```

### 3.2 Get User by ID
- **URL:** `/api/v1/users/{id}`
- **Method:** `GET`
- **Path Parameter:** `id` (UUID)

### 3.3 Get User by Email
- **URL:** `/api/v1/users/email/{email}`
- **Method:** `GET`
- **Path Parameter:** `email` (String)

### 3.4 Get User by Supabase User ID
- **URL:** `/api/v1/users/supabase/{supabaseUserId}`
- **Method:** `GET`
- **Path Parameter:** `supabaseUserId` (UUID)

### 3.5 Create / Sync User from Supabase Auth
- **URL:** `/api/v1/users`
- **Method:** `POST`
- **Request Body:**
```json
{
  "supabaseUserId": "7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "profileImageUrl": "https://...",
  "role": "CANDIDATE",
  "status": "ACTIVE",
  "emailVerified": true
}
```
- **Response (201 Created):** Returns the created `UserResponseDTO`.

### 3.6 Update User
- **URL:** `/api/v1/users/{id}`
- **Method:** `PUT`
- **Path Parameter:** `id` (UUID)
- **Request Body:** Same schema as `UserRequestDTO`
- **Response (200 OK):** Returns updated `UserResponseDTO`.

### 3.7 Soft-Delete User
- **URL:** `/api/v1/users/{id}`
- **Method:** `DELETE`
- **Path Parameter:** `id` (UUID)
- **Response (204 No Content)**

---

## 4. Skills Catalog Endpoints (`/api/v1/skills`)

### 4.1 Get / Search Skills
- **URL:** `/api/v1/skills`
- **Method:** `GET`
- **Query Parameter (Optional):** `search` (String)
- **Response (200 OK):**
```json
[
  {
    "id": "11111111-2222-3333-4444-555566667777",
    "name": "Java",
    "category": "Programming Language"
  },
  {
    "id": "11111111-2222-3333-4444-555566667778",
    "name": "Spring Boot",
    "category": "Backend Framework"
  }
]
```

### 4.2 Get Skills by Category
- **URL:** `/api/v1/skills/category/{category}`
- **Method:** `GET`
- **Path Parameter:** `category` (e.g., `Programming Language`)

### 4.3 Create Skill
- **URL:** `/api/v1/skills`
- **Method:** `POST`
- **Request Body:**
```json
{
  "name": "Kubernetes",
  "category": "DevOps & Cloud"
}
```

---

## 5. Candidate Profile Endpoints (`/api/v1/candidates`)

### 5.1 Get My Profile (Authenticated User)
- **URL:** `/api/v1/candidates/me`
- **Method:** `GET`
- **Access:** Authenticated (Candidate)
- **Response (200 OK):**
```json
{
  "id": "22222222-3333-4444-5555-666677778888",
  "userId": "b3f3b9c6-1111-2222-3333-444455556666",
  "supabaseUserId": "7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
  "firstName": "Alice",
  "lastName": "Candidate",
  "email": "alice@example.com",
  "profileImageUrl": null,
  "headline": "Full Stack Java & React Developer",
  "bio": "Passionate software engineer building scalable web applications.",
  "phone": "+1234567890",
  "currentLocation": "San Francisco, CA",
  "yearsOfExperience": 3.5,
  "websiteUrl": "https://alice.dev",
  "githubUrl": "https://github.com/alice",
  "linkedinUrl": "https://linkedin.com/in/alice",
  "portfolioUrl": "https://alice.dev/portfolio",
  "educations": [],
  "experiences": [],
  "skills": [],
  "resumes": [],
  "createdAt": "2026-09-03T19:50:00",
  "updatedAt": "2026-09-03T19:50:00"
}
```

### 5.2 Get Profile by ID
- **URL:** `/api/v1/candidates/{id}`
- **Method:** `GET`
- **Path Parameter:** `id` (UUID)

### 5.3 Create Candidate Profile
- **URL:** `/api/v1/candidates`
- **Method:** `POST`
- **Request Body:**
```json
{
  "headline": "Full Stack Java & React Developer",
  "bio": "Passionate software engineer building scalable web applications.",
  "phone": "+1234567890",
  "currentLocation": "San Francisco, CA",
  "yearsOfExperience": 3.5,
  "websiteUrl": "https://alice.dev",
  "githubUrl": "https://github.com/alice",
  "linkedinUrl": "https://linkedin.com/in/alice",
  "portfolioUrl": "https://alice.dev/portfolio"
}
```
- **Response (201 Created)**

### 5.4 Update Candidate Profile
- **URL:** `/api/v1/candidates/{id}`
- **Method:** `PUT`
- **Path Parameter:** `id` (UUID)

### 5.5 Education Endpoints
- **Add Education:** `POST /api/v1/candidates/{id}/education`
  ```json
  {
    "institution": "Stanford University",
    "degree": "Bachelor of Science",
    "fieldOfStudy": "Computer Science",
    "startDate": "2019-09-01",
    "endDate": "2023-06-15",
    "isCurrent": false,
    "grade": "3.9 GPA",
    "description": "Focused on Distributed Systems and Software Engineering."
  }
  ```
- **Update Education:** `PUT /api/v1/candidates/{id}/education/{educationId}`
- **Delete Education:** `DELETE /api/v1/candidates/{id}/education/{educationId}`

### 5.6 Experience Endpoints
- **Add Experience:** `POST /api/v1/candidates/{id}/experience`
  ```json
  {
    "companyName": "Tech Corp",
    "jobTitle": "Software Engineer",
    "employmentType": "FULL_TIME",
    "location": "Remote",
    "startDate": "2023-07-01",
    "endDate": null,
    "isCurrent": true,
    "description": "Building microservices using Spring Boot and PostgreSQL."
  }
  ```
- **Update Experience:** `PUT /api/v1/candidates/{id}/experience/{experienceId}`
- **Delete Experience:** `DELETE /api/v1/candidates/{id}/experience/{experienceId}`

### 5.7 Skill Endpoints
- **Attach Skill to Candidate:** `POST /api/v1/candidates/{id}/skills`
  ```json
  {
    "skillId": "11111111-2222-3333-4444-555566667777",
    "proficiencyLevel": "ADVANCED",
    "yearsOfExperience": 3.0
  }
  ```
- **Remove Skill:** `DELETE /api/v1/candidates/{id}/skills/{candidateSkillId}`

### 5.8 Resume Endpoints
- **Register Uploaded Resume:** `POST /api/v1/candidates/{id}/resumes`
  ```json
  {
    "fileName": "Alice_Resume.pdf",
    "fileUrl": "https://qbdcvnkomdzqfxevlhhj.supabase.co/storage/v1/object/public/resumes/candidate/usr-123/Alice_Resume.pdf",
    "fileType": "application/pdf",
    "fileSize": 204800,
    "isPrimary": true,
    "atsScore": 85.0
  }
  ```
- **Delete Resume:** `DELETE /api/v1/candidates/{id}/resumes/{resumeId}`

---

## 6. Job Management Endpoints (`/api/v1/jobs`)

- **Search Jobs (Public):** `GET /api/v1/jobs?keyword=java&location=remote&workMode=REMOTE&page=0&size=10`
- **Get Job Details (Public):** `GET /api/v1/jobs/{id}`
- **Create Job (Recruiter):** `POST /api/v1/jobs`
  ```json
  {
    "title": "Senior Backend Engineer",
    "description": "Develop high-scale cloud microservices.",
    "requirements": "5+ years Java and Spring Boot experience.",
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "workMode": "REMOTE",
    "location": "San Francisco, CA",
    "minSalary": 140000,
    "maxSalary": 190000,
    "currency": "USD"
  }
  ```
- **Update Job (Recruiter):** `PUT /api/v1/jobs/{id}`
- **Update Job Status (Recruiter):** `PATCH /api/v1/jobs/{id}/status?status=CLOSED`
- **Delete Job (Recruiter):** `DELETE /api/v1/jobs/{id}`
- **Save Job Bookmark (Candidate):** `POST /api/v1/jobs/{id}/save`
- **Remove Bookmark (Candidate):** `DELETE /api/v1/jobs/{id}/save`
- **Get Candidate Saved Jobs:** `GET /api/v1/jobs/saved`
- **Moderate Job (Admin):** `PATCH /api/v1/jobs/{id}/moderate?status=PUBLISHED`

---

## 7. Job Application Endpoints (`/api/v1/applications`)

- **Submit Application (Candidate):** `POST /api/v1/applications/apply`
  ```json
  {
    "jobId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "resumeId": "2fa85f64-5717-4562-b3fc-2c963f66afa7",
    "coverLetter": "I am eager to contribute to HireHub AI..."
  }
  ```
- **Get My Applications (Candidate):** `GET /api/v1/applications/candidate/me`
- **Get Job Applicants (Recruiter):** `GET /api/v1/applications/job/{jobId}`
- **Update Application Status (Recruiter):** `PATCH /api/v1/applications/{id}/status`
  ```json
  {
    "status": "SHORTLISTED",
    "rejectionReason": null
  }
  ```

---

## 8. Interview Coordination Endpoints (`/api/v1/interviews`)

- **Schedule Interview (Recruiter):** `POST /api/v1/interviews/schedule`
  ```json
  {
    "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "scheduledAt": "2026-10-15T14:30:00",
    "durationMinutes": 60,
    "interviewType": "TECHNICAL",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "notes": "System Design Round"
  }
  ```
- **Get Candidate Interviews:** `GET /api/v1/interviews/candidate/my-interviews`
- **Get Recruiter Interviews:** `GET /api/v1/interviews/recruiter/my-interviews`
- **Update Interview Status:** `PATCH /api/v1/interviews/{id}/status?status=COMPLETED`
- **Cancel Interview:** `DELETE /api/v1/interviews/{id}`

---

## 9. Notification & Communication Endpoints (`/api/v1/notifications`)

- **Get My Notifications:** `GET /api/v1/notifications`
- **Get Unread Count:** `GET /api/v1/notifications/unread-count`
- **Mark as Read:** `PATCH /api/v1/notifications/{id}/read`
- **Mark All Read:** `PATCH /api/v1/notifications/read-all`
- **Broadcast Notification (Admin):** `POST /api/v1/notifications/broadcast`
  ```json
  {
    "title": "Platform Maintenance",
    "message": "Scheduled maintenance on Sunday at 02:00 UTC",
    "targetRole": "ALL"
  }
  ```

---

## 10. AI Career Intelligence Endpoints (`/api/v1/ai`)

- **Analyze Resume (Candidate):** `POST /api/v1/ai/analyze-resume`
- **Target Job Matcher:** `POST /api/v1/ai/job-match`
- **Generate Cover Letter:** `POST /api/v1/ai/cover-letter`
- **Interview Preparation Simulator:** `POST /api/v1/ai/interview-prep`
- **AI Job Description Generator (Recruiter):** `POST /api/v1/ai/generate-job-description`
- **AI Applicant Ranking (Recruiter):** `POST /api/v1/ai/rank-applicants`

---

## 11. Monitoring & Health Endpoints

- **Public Healthz Probe:** `GET /healthz` (Nginx container probe &rarr; `200 healthy`)
- **Spring Boot Actuator Health:** `GET /actuator/health` (Database & Liveness &rarr; `{"status":"UP"}`)
- **Spring Boot Metrics:** `GET /actuator/metrics`
- **OpenAPI 3.0 Documentation:** `GET /v3/api-docs`
- **Interactive Swagger UI:** `GET /swagger-ui.html`

