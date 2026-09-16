# Security & Compliance Guide — HireHub AI

Security is a foundational pillar of HireHub AI. The application implements defense-in-depth across the presentation, network, application, and persistence layers.

---

## 1. Security Architecture & Threat Model

```
[Client Request]
       │
       ▼
1. Nginx Reverse Proxy: Defensive HTTP Security Headers (CSP, HSTS, X-Frame-Options: DENY)
       │
       ▼
2. RateLimitingFilter: Sliding window token bucket (120 req/min general, 20 req/min AI)
       │
       ▼
3. Spring Security OAuth2: RS256 JWT validation against Supabase JWKS public endpoint
       │
       ▼
4. Method & Object-Level Authorization: Data isolation verified before service execution
       │
       ▼
5. Input & File Sanitization: Magic byte header inspection (%PDF-), 10MB limit, PII scrubbing
       │
       ▼
6. Supabase PostgreSQL & Storage: Row-Level Security (RLS) policies enforcing user isolation
```

---

## 2. Authentication & JWT Validation

- **Token Standard**: OpenID Connect / RFC 7519 JSON Web Tokens (JWT) issued by Supabase Auth.
- **Verification**: Spring Security's `NimbusJwtDecoder` validates tokens cryptographically using the Supabase JWKS endpoint (`/.well-known/jwks.json`).
- **Stateless Sessions**: Zero server session storage; state is derived exclusively from claims (`sub`, `role`, `email`).
- **Secret Protection**: Strictly **zero** Supabase `service_role` or secret keys are exposed in frontend code or repository commits.

---

## 3. Resume File Upload Security (5-Layer Defense)

1. **Extension Verification**: Only `.pdf`, `.doc`, `.docx` allowed; all executables (`.exe`, `.sh`, `.bat`) rejected immediately.
2. **MIME-Type Validation**: Validates `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
3. **Binary Magic Byte Inspection**: First 4-5 bytes must match `%PDF-` (hex `25 50 44 46 2D`) to prevent MIME-type spoofing.
4. **File Size Hard Limit**: Strict 10MB upper limit; zero-byte files rejected.
5. **Supabase Storage RLS Isolation**: Files are partitioned by user ID (`resumes/candidate/{userId}/resume.pdf`). Candidates can only read and write to their own folder.

---

## 4. Rate Limiting & DoS Protection

- Implemented via `RateLimitingFilter.java`:
  - **General Endpoints**: 120 requests/minute per client IP.
  - **AI Endpoints (`/api/v1/ai/**`)**: 20 requests/minute per client/token to prevent token quota exhaustion.
  - **Auth Endpoints (`/api/v1/auth/**`)**: 30 requests/minute to prevent brute-force attacks.
  - **Rejection Response**: Standard `429 Too Many Requests` with `Retry-After: 60`.

---

## 5. Responsible AI & Data Privacy (Phase 29.0)

- **PII Scrubbing**: Before transmitting data to Google Gemini or heuristic engines, `GeminiService.scrubSensitiveData` redacts:
  - Social Security Numbers (`[REDACTED_SSN]`)
  - Phone Numbers (`[REDACTED_PHONE]`)
  - Dates of Birth (`[REDACTED_DOB]`)
  - Marital Status (`[REDACTED_STATUS]`)
  - Gender (`[REDACTED_GENDER]`)
  - Religion (`[REDACTED_RELIGION]`)
- **Assistive Decision-Support**: All AI-generated evaluation payloads attach mandatory disclaimers clarifying that scores provide assistive guidance and final employment decisions rest with human hiring authorities.

---

## 6. Vulnerability Reporting

If you discover a security vulnerability in HireHub AI, please email `security@hirehub.ai`. We commit to investigating and resolving reported vulnerabilities within 48 hours.
