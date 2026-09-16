# Contributing to HireHub AI

Thank you for your interest in contributing to **HireHub AI**! This document outlines our development process, branching model, and code quality standards.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and professional environment. All contributors are expected to uphold respectful, constructive communication and maintain ethical AI standards.

---

## 2. Getting Started

1. **Fork the Repository** to your own GitHub account.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/HireHub-AI.git
   cd HireHub-AI
   ```
3. **Set Up Local Environment**:
   - Backend: Install Java 17+ and verify Maven wrapper (`.\mvnw.cmd clean test-compile`).
   - Frontend: Install Node.js 18+ and install packages (`npm install` inside `frontend/`).

---

## 3. Git Branching Model

- `main`: Production-ready branch. Only merges via approved Pull Requests with 100% CI pass.
- `develop`: Integration branch for ongoing sprint development.
- Feature branches: `feature/<feature-name>` (e.g., `feature/voice-interviewer`).
- Bugfix branches: `fix/<issue-name>` (e.g., `fix/jwt-expiration-handler`).

---

## 4. Coding & Architecture Standards

### Backend (Java / Spring Boot)
- Follow standard Java naming conventions and clean architecture patterns.
- Keep services single-responsibility; isolate AI logic from transactional relational mutations.
- Never hardcode credentials; always use environment variables with sensible defaults.
- Always include automated unit/integration tests using JUnit 5 and AssertJ.

### Frontend (React / Vite)
- Use functional React components with hooks.
- Use Vanilla CSS and Tailwind CSS classes consistent with our Design System.
- Avoid exposing any private API keys or `service_role` secrets in frontend client code.
- Implement responsive design supporting mobile, tablet, and desktop viewports.

### AI Governance & Ethics
- Never create prompts that evaluate protected demographic characteristics (Age, Gender, Religion, Race, Marital Status).
- Always include the mandatory `fairnessDisclaimer` in new AI evaluation response DTOs.
- Provide deterministic local fallback engines for any new AI feature to prevent offline failures.

---

## 5. Pull Request Verification Checklist

Before submitting a Pull Request, ensure that all automated quality gates pass:

```bash
# 1. Frontend Production Build
cd frontend
npm run build

# 2. Run Complete Test Suite (All 17 suites)
npm run test:all

# 3. Backend Integration Tests
cd ../backend/hirehub-backend/hirehub-backend
.\mvnw.cmd test -Dtest=SemanticSearchTest,JobMatchingTest
```

PRs with failing tests or unhandled security warnings will not be merged.
