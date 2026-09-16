/**
 * Dockerization & CI/CD Automated Test Suite (Phases 16, 17, and 18)
 * Validates:
 * 16.1 Backend Dockerfile (Multi-stage, Maven builder, Java 17 Temurin, non-root user, healthcheck)
 * 16.2 Frontend Dockerfile (Node 20 builder, Nginx 1.27 runner, build args, EXPOSE 80)
 * 16.3 Nginx Configuration (SPA fallback try_files, API reverse proxy, gzip, security headers, /healthz)
 * 16.4 Docker Compose Orchestration (Services, ports, networking, environment variables, healthchecks)
 * 17.1 GitHub Actions Workflow (Triggers, frontend-ci, backend-ci, docker-build, deploy)
 * 18.1 Production Deployment Guide & Environment Templates
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(rootDir, 'backend/hirehub-backend/hirehub-backend');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    console.error(`    ${colors.red}Error:${colors.reset}`, err.message);
    failed++;
  }
}

console.log(`\n${colors.bold}${colors.cyan}===================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   HireHub AI — Dockerization, CI/CD & Deployment Suite (16-18)     ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 16.1 Backend Dockerfile Validation
// ---------------------------------------------------------
console.log(`${colors.bold}16.1 Backend Dockerfile & Security:${colors.reset}`);

test('16.1.1 Backend Dockerfile exists and implements multi-stage build', () => {
  const dockerfilePath = path.join(backendDir, 'Dockerfile');
  assert.ok(fs.existsSync(dockerfilePath), 'Backend Dockerfile must exist');

  const content = fs.readFileSync(dockerfilePath, 'utf8');
  assert.ok(content.includes('FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder'), 'Uses Maven 3.9 Temurin 17 builder');
  assert.ok(content.includes('FROM eclipse-temurin:17-jre-alpine AS runner'), 'Uses minimal Temurin 17 JRE runner');
  assert.ok(content.includes('EXPOSE 8080'), 'Exposes port 8080');
});

test('16.1.2 Backend Dockerfile enforces non-root execution and healthcheck', () => {
  const content = fs.readFileSync(path.join(backendDir, 'Dockerfile'), 'utf8');
  assert.ok(content.includes('adduser -S hirehub'), 'Creates non-root user');
  assert.ok(content.includes('USER hirehub:hirehub'), 'Switches to non-root user');
  assert.ok(content.includes('HEALTHCHECK'), 'Defines container healthcheck');
  assert.ok(content.includes('-XX:+UseG1GC'), 'Includes JVM memory optimizations');
});

test('16.1.3 Backend .dockerignore excludes target and unnecessary files', () => {
  const ignorePath = path.join(backendDir, '.dockerignore');
  assert.ok(fs.existsSync(ignorePath), 'Backend .dockerignore must exist');
  const content = fs.readFileSync(ignorePath, 'utf8');
  assert.ok(content.includes('target/'));
  assert.ok(content.includes('.git'));
});

// ---------------------------------------------------------
// 16.2 & 16.3 Frontend Dockerfile & Nginx Configuration
// ---------------------------------------------------------
console.log(`\n${colors.bold}16.2 & 16.3 Frontend Dockerfile & Nginx Configuration:${colors.reset}`);

test('16.2.1 Frontend Dockerfile implements multi-stage Node/Nginx build', () => {
  const dockerfilePath = path.join(frontendDir, 'Dockerfile');
  assert.ok(fs.existsSync(dockerfilePath), 'Frontend Dockerfile must exist');

  const content = fs.readFileSync(dockerfilePath, 'utf8');
  assert.ok(content.includes('FROM node:20-alpine AS builder'), 'Uses Node 20 builder');
  assert.ok(content.includes('FROM nginx:1.27-alpine AS runner'), 'Uses Nginx 1.27 Alpine runner');
  assert.ok(content.includes('EXPOSE 80'), 'Exposes port 80');
  assert.ok(content.includes('HEALTHCHECK'), 'Includes health check');
});

test('16.3.1 Nginx configuration includes SPA routing, reverse proxy, gzip, and security headers', () => {
  const nginxPath = path.join(frontendDir, 'nginx.conf');
  assert.ok(fs.existsSync(nginxPath), 'frontend/nginx.conf must exist');

  const content = fs.readFileSync(nginxPath, 'utf8');
  assert.ok(content.includes('try_files $uri $uri/ /index.html;'), 'Configures SPA client-side fallback');
  assert.ok(content.includes('proxy_pass http://backend:8080/api/;'), 'Reverse proxies /api/ to backend container');
  assert.ok(content.includes('gzip on;'), 'Enables Gzip compression');
  assert.ok(content.includes('X-Frame-Options "SAMEORIGIN"'), 'Sets X-Frame-Options');
  assert.ok(content.includes('X-Content-Type-Options "nosniff"'), 'Sets X-Content-Type-Options');
  assert.ok(content.includes('location /healthz'), 'Provides /healthz health check endpoint');
});

test('16.3.2 Frontend .dockerignore excludes node_modules and dist', () => {
  const ignorePath = path.join(frontendDir, '.dockerignore');
  assert.ok(fs.existsSync(ignorePath), 'Frontend .dockerignore must exist');
  const content = fs.readFileSync(ignorePath, 'utf8');
  assert.ok(content.includes('node_modules/'));
  assert.ok(content.includes('dist/'));
});

// ---------------------------------------------------------
// 16.4 Docker Compose Orchestration
// ---------------------------------------------------------
console.log(`\n${colors.bold}16.4 Docker Compose Full-Stack Orchestration:${colors.reset}`);

test('16.4.1 docker-compose.yml defines backend and frontend services with custom network', () => {
  const composePath = path.join(rootDir, 'docker-compose.yml');
  assert.ok(fs.existsSync(composePath), 'Root docker-compose.yml must exist');

  const content = fs.readFileSync(composePath, 'utf8');
  assert.ok(content.includes('backend:'), 'Defines backend service');
  assert.ok(content.includes('frontend:'), 'Defines frontend service');
  assert.ok(content.includes('hirehub-network:'), 'Connects services via bridge network');
  assert.ok(content.includes('depends_on:'), 'Frontend depends on backend');
  assert.ok(content.includes('"80:80"'), 'Maps port 80 for frontend');
  assert.ok(content.includes('"8080:8080"'), 'Maps port 8080 for backend');
});

test('16.4.2 .env.docker.example provides complete environment blueprint', () => {
  const envPath = path.join(rootDir, '.env.docker.example');
  assert.ok(fs.existsSync(envPath), '.env.docker.example must exist');

  const content = fs.readFileSync(envPath, 'utf8');
  assert.ok(content.includes('VITE_SUPABASE_URL='));
  assert.ok(content.includes('SPRING_DATASOURCE_URL='));
  assert.ok(content.includes('GEMINI_API_KEY='));
});

// ---------------------------------------------------------
// 17.1 GitHub Actions CI/CD Pipeline
// ---------------------------------------------------------
console.log(`\n${colors.bold}17.1 GitHub Actions CI/CD Pipeline:${colors.reset}`);

test('17.1.1 ci-cd.yml defines comprehensive automated quality gates', () => {
  const workflowPath = path.join(rootDir, '.github/workflows/ci-cd.yml');
  assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci-cd.yml must exist');

  const content = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(content.includes('frontend-ci:'), 'Includes frontend-ci quality gate');
  assert.ok(content.includes('backend-ci:'), 'Includes backend-ci quality gate');
  assert.ok(content.includes('docker-build:'), 'Includes docker image verification');
  assert.ok(content.includes('deploy:'), 'Includes continuous deployment job');
  assert.ok(content.includes('npm run test:all'), 'Runs full 10 test suites');
  assert.ok(content.includes('npm run build'), 'Verifies Vite build');
  assert.ok(content.includes('mvnw clean test-compile'), 'Compiles Java backend');
});

// ---------------------------------------------------------
// 18.1 Production Deployment Documentation & Configs
// ---------------------------------------------------------
console.log(`\n${colors.bold}18.1 Production Deployment Architecture & Runbook:${colors.reset}`);

test('18.1.1 Production Deployment Guide covers all options and checklists', () => {
  const guidePath = path.join(rootDir, 'docs/Production_Deployment_Guide.md');
  assert.ok(fs.existsSync(guidePath), 'docs/Production_Deployment_Guide.md must exist');

  const content = fs.readFileSync(guidePath, 'utf8');
  assert.ok(content.includes('Production Architecture Overview'));
  assert.ok(content.includes('Environment Variables Matrix'));
  assert.ok(content.includes('Option A: Unified Docker Compose'));
  assert.ok(content.includes('Option B: PaaS Platforms (Render / Railway)'));
  assert.ok(content.includes('Option C: Enterprise Cloud'));
  assert.ok(content.includes('Supabase Setup & Security Checklist'));
  assert.ok(content.includes('Post-Deployment Verification Checklist'));
});

test('18.1.2 .env.production.example provides hardened production template', () => {
  const prodEnvPath = path.join(rootDir, '.env.production.example');
  assert.ok(fs.existsSync(prodEnvPath), '.env.production.example must exist');

  const content = fs.readFileSync(prodEnvPath, 'utf8');
  assert.ok(content.includes('SPRING_PROFILES_ACTIVE=prod'));
  assert.ok(content.includes('CORS_ALLOWED_ORIGINS='));
  assert.ok(content.includes('SPRING_DATASOURCE_URL='));
  assert.ok(content.includes('GEMINI_API_KEY='));
});

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n${colors.bold}Summary:${colors.reset}`);
console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
console.log(`  Failed: ${colors.red}${failed}${colors.reset}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log(`\n${colors.bold}${colors.green}All Dockerization & CI/CD tests passed successfully!${colors.reset}\n`);
}
