# HireHub AI — Security Policy & Governance

This document outlines the security architecture, threat model, compliance policies, and vulnerability disclosure procedures for HireHub AI.

---

## 1. Security Principles & Architecture

HireHub AI employs a **defense-in-depth** strategy ensuring that security controls exist at the presentation, transport, network, application, and persistence layers:

1. **Principle of Least Privilege**:
   - Backend containers run under an unprivileged non-root user (`hirehub:hirehub`, UID 1001).
   - Database operations use parameterized queries preventing SQL injection.
   - Cloud storage buckets enforce per-candidate folder isolation.
2. **Authority at the Boundary**:
   - Client-side claims and storage values (`localStorage`) are never trusted for authorization.
   - Roles (`CANDIDATE`, `RECRUITER`, `ADMIN`) are determined exclusively by the backend database synchronized via `/api/v1/auth/sync`.
3. **Zero Secret Exposure**:
   - Only public Supabase anonymous keys (`VITE_SUPABASE_ANON_KEY`) are bundled into client code.
   - Supabase `service_role` keys, database passwords, and Gemini API keys reside exclusively in secure backend server environments.

---

## 2. Threat Model & Mitigations

| Threat Vector | Potential Impact | HireHub AI Mitigation |
|---|---|---|
| **SQL Injection** | Unauthorized database access | Spring Data JPA with prepared statements and parameter binding; Hibernate ORM. |
| **Cross-Site Scripting (XSS)** | Token theft or session hijack | React virtual DOM JSX auto-escaping; Nginx header `X-XSS-Protection: 1; mode=block`. |
| **Clickjacking** | UI redress attacks | Nginx defensive header `X-Frame-Options: SAMEORIGIN`. |
| **MIME Type Spoofing** | Executable file upload | Multi-tier file validation: file extension check, MIME type whitelist, and binary magic byte header verification (`%PDF-`). |
| **Path Traversal (`../`)** | Overwriting system files | Filename sanitization stripping relative path specifiers and regex cleanup. |
| **JWT Tampering** | Unauthorized role escalation | Asymmetric cryptographic verification via Supabase JWKS public keys (`RS256` / `ES256`). |
| **CORS Exploitation** | Cross-origin request forgery | Explicit origin whitelisting in Spring Security (`CORS_ALLOWED_ORIGINS`). |
| **Information Disclosure** | Internal stack trace leaks | Centralized `GlobalExceptionHandler` masking database exceptions and returning sanitized `ErrorResponseDTO`. |

---

## 3. Storage Row Level Security (RLS) Policy

Supabase Storage enforces granular partition isolation on the `resumes` bucket:
- **Folder Structure**: `resumes/candidate/{userId}/resume.pdf`
- **Isolation Rule**: Only the authenticated user whose `auth.uid()` matches the subfolder name can insert, update, or read their private resumes.
- **SQL Policy Reference**: [`docs/supabase_storage_resumes_policies.sql`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/supabase_storage_resumes_policies.sql)

---

## 4. Container & Infrastructure Hardening

- **Non-Root Execution**:
  ```dockerfile
  RUN addgroup -S hirehub && adduser -S hirehub -G hirehub
  USER hirehub:hirehub
  ```
- **Minimal Attack Surface**: Uses `eclipse-temurin:17-jre-alpine` without unnecessary tools, compilers, or shells.
- **Healthcheck Probes**: Continuous monitoring via `/healthz` and `/actuator/health`.

---

## 5. Automated Security Audit (Phase 20)

HireHub AI includes an automated security audit test suite (`frontend/scripts/security-audit.js`) verifying:
- ✅ Zero Supabase `service_role` keys committed.
- ✅ Zero Gemini API keys exposed in frontend source.
- ✅ Sensitive `.env` and `.env.local` files strictly gitignored.
- ✅ Defensive HTTP headers configured in Nginx.
- ✅ Non-root container execution.
- ✅ File upload validation (MIME, size, binary magic bytes).
- ✅ Uncaught exceptions masked in `GlobalExceptionHandler`.

Run audit locally:
```bash
cd frontend
npm run test:security-audit
```

---

## 6. Reporting Security Vulnerabilities

If you discover a security vulnerability in HireHub AI, please report it responsibly:
- **Security Team Email**: security@hirehub.ai
- **Response SLA**: Within 48 hours
- **Disclosure Policy**: We ask that you do not publicly disclose vulnerabilities until our engineering team has released a patch.
