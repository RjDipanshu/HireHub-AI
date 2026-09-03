# HireHub AI - Modern Recruitment Platform

HireHub AI is an AI-powered job board and recruitment platform built with **Spring Boot 3**, **Supabase (PostgreSQL & Auth)**, and **React**.

---

## 🏗️ Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security, OAuth2 Resource Server
- **Authentication**: Supabase Auth (JWT with ES256 / JWKS)
- **Database**: PostgreSQL (Supabase)
- **Frontend**: React (Vite) *(in development)*

---

## 🚀 Getting Started

### Backend Setup

1. **Prerequisites**:
   - Java 17+
   - Supabase project credentials

2. **Run Backend**:
   ```bash
   cd backend/hirehub-backend/hirehub-backend
   ./mvnw spring-boot:run
   ```

3. **Verify Auth Endpoints**:
   - `GET /api/v1/test/public` → Public test endpoint
   - `GET /api/v1/test/protected` → Protected endpoint (requires `Authorization: Bearer <SUPABASE_JWT>`)
