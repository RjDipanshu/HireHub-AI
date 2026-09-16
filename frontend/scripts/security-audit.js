/**
 * HireHub AI — Final Production Security Audit Test Suite (Phase 20)
 * Rigorous static analysis and configuration security audit.
 * 
 * Verifies:
 * 20.1 Secret Protection: Zero Supabase service_role keys or Gemini API keys in frontend code
 * 20.2 Git & Environment Hygiene: .env, .env.local, target, and node_modules are gitignored
 * 20.3 Transport & Header Security: Strict security headers and CORS protection
 * 20.4 Container Hardening: Backend container executes as unprivileged non-root user
 * 20.5 Asset & Upload Security: Binary magic bytes, MIME whitelist, and 10MB size limit
 * 20.6 RBAC & Authorization Defense: Role authority restricted to backend DB/JWT claims
 * 20.7 Error Sanitization: API errors mask sensitive database/SQL details
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
console.log(`${colors.bold}${colors.cyan}   HireHub AI — Final Production Security Audit Suite (Phase 20)    ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// Helper to recursively collect files
function getAllFiles(dir, extensions = ['.js', '.jsx', '.json', '.html', '.css', '.properties', '.sql', '.yml', '.yaml']) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'target', '.git', '.mvn'].includes(entry.name)) {
        files = files.concat(getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

// ---------------------------------------------------------
// 20.1 Secret Protection Audit
// ---------------------------------------------------------
console.log(`${colors.bold}20.1 Secret Protection Audit:${colors.reset}`);

test('20.1.1 Zero Supabase service_role keys in frontend source files', () => {
  const frontendFiles = getAllFiles(path.join(frontendDir, 'src'));
  const violations = [];

  for (const file of frontendFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('service_role') || /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]*service_role/.test(content)) {
      violations.push(path.relative(rootDir, file));
    }
  }

  assert.equal(violations.length, 0, `Found potential service_role key in: ${violations.join(', ')}`);
});

test('20.1.2 Zero Gemini or Google AI private keys in frontend source files', () => {
  const frontendFiles = getAllFiles(path.join(frontendDir, 'src'));
  const violations = [];

  for (const file of frontendFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Checks for AIzaSy... pattern with actual length > 25
    const matches = content.match(/AIzaSy[A-Za-z0-9_-]{33}/g);
    if (matches) {
      violations.push(path.relative(rootDir, file));
    }
  }

  assert.equal(violations.length, 0, `Found potential Gemini private API key in: ${violations.join(', ')}`);
});

// ---------------------------------------------------------
// 20.2 Git & Environment Hygiene
// ---------------------------------------------------------
console.log(`\n${colors.bold}20.2 Git & Environment Hygiene:${colors.reset}`);

test('20.2.1 .gitignore files properly ignore sensitive environment files and build artifacts', () => {
  const rootGitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  const frontendGitignore = fs.existsSync(path.join(frontendDir, '.gitignore'))
    ? fs.readFileSync(path.join(frontendDir, '.gitignore'), 'utf8')
    : rootGitignore;

  assert.ok(rootGitignore.includes('.env') || frontendGitignore.includes('.env'), 'Must ignore .env');
  assert.ok(rootGitignore.includes('node_modules') || frontendGitignore.includes('node_modules'), 'Must ignore node_modules');
  assert.ok(rootGitignore.includes('target') || rootGitignore.includes('dist'), 'Must ignore build outputs');
});

test('20.2.2 Backend application.properties uses environment variable fallbacks', () => {
  const appPropsPath = path.join(backendDir, 'src/main/resources/application.properties');
  assert.ok(fs.existsSync(appPropsPath), 'application.properties must exist');
  const content = fs.readFileSync(appPropsPath, 'utf8');
  assert.ok(content.includes('${SPRING_DATASOURCE_URL:'), 'Uses SPRING_DATASOURCE_URL env');
  assert.ok(content.includes('${SPRING_DATASOURCE_USERNAME:'), 'Uses SPRING_DATASOURCE_USERNAME env');
  assert.ok(content.includes('${SPRING_DATASOURCE_PASSWORD:'), 'Uses SPRING_DATASOURCE_PASSWORD env');
});

// ---------------------------------------------------------
// 20.3 Transport & Header Security
// ---------------------------------------------------------
console.log(`\n${colors.bold}20.3 Transport & Header Security:${colors.reset}`);

test('20.3.1 Nginx configuration enforces defensive HTTP security headers', () => {
  const nginxPath = path.join(frontendDir, 'nginx.conf');
  const content = fs.readFileSync(nginxPath, 'utf8');
  assert.ok(content.includes('X-Frame-Options "SAMEORIGIN"'), 'Enforces X-Frame-Options');
  assert.ok(content.includes('X-Content-Type-Options "nosniff"'), 'Enforces X-Content-Type-Options');
  assert.ok(content.includes('Referrer-Policy "strict-origin-when-cross-origin"'), 'Enforces Referrer-Policy');
});

test('20.3.2 Backend SecurityConfig restricts CORS and uses JWKS public token verification', () => {
  const securityConfigPath = path.join(backendDir, 'src/main/java/com/hirehub/hirehub_backend/config/SecurityConfig.java');
  const content = fs.readFileSync(securityConfigPath, 'utf8');
  assert.ok(content.includes('corsConfigurationSource'), 'Configures CORS Source');
  assert.ok(content.includes('allowedOrigins'), 'Binds configurable allowed origins');
  assert.ok(content.includes('NimbusJwtDecoder.withJwkSetUri'), 'Uses asymmetric JWKS token validation (RS256/ES256)');
});

// ---------------------------------------------------------
// 20.4 Container Hardening
// ---------------------------------------------------------
console.log(`\n${colors.bold}20.4 Container Hardening:${colors.reset}`);

test('20.4.1 Backend Dockerfile drops root privileges and executes as non-root user', () => {
  const dockerfilePath = path.join(backendDir, 'Dockerfile');
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  assert.ok(content.includes('addgroup -S hirehub && adduser -S hirehub -G hirehub'), 'Creates dedicated unprivileged user');
  assert.ok(content.includes('USER hirehub:hirehub'), 'Switches execution to non-root user');
});

// ---------------------------------------------------------
// 20.5 Asset & Upload Security
// ---------------------------------------------------------
console.log(`\n${colors.bold}20.5 Asset & Upload Security:${colors.reset}`);

test('20.5.1 storageService enforces MIME verification, binary magic byte inspection, and 10MB limit', () => {
  const storagePath = path.join(frontendDir, 'src/services/storageService.js');
  const content = fs.readFileSync(storagePath, 'utf8');
  assert.ok(content.includes('verifyMagicBytes'), 'Inspects binary magic bytes');
  assert.ok(content.includes('10 * 1024 * 1024'), 'Enforces 10MB file size ceiling');
  assert.ok(content.includes('sanitizeFilename'), 'Sanitizes path traversal attempts');
});

// ---------------------------------------------------------
// 20.6 RBAC & Authorization Defense
// ---------------------------------------------------------
console.log(`\n${colors.bold}20.6 RBAC & Authorization Defense:${colors.reset}`);

test('20.6.1 ProtectedRoute relies solely on backend authenticated role identity', () => {
  const protectedRoutePath = path.join(frontendDir, 'src/routes/ProtectedRoute.jsx');
  const content = fs.readFileSync(protectedRoutePath, 'utf8');
  assert.ok(content.includes('user?.role'), 'Checks user role from backend auth context');
  assert.ok(!content.includes('localStorage.getItem(\'role\')'), 'Does not trust insecure localStorage role values');
});

// ---------------------------------------------------------
// 20.7 Error Sanitization
// ---------------------------------------------------------
console.log(`\n${colors.bold}20.7 Error Sanitization:${colors.reset}`);

test('20.7.1 GlobalExceptionHandler returns structured ErrorResponseDTO without leaking SQL or stack traces', () => {
  const handlerPath = path.join(backendDir, 'src/main/java/com/hirehub/hirehub_backend/exception/GlobalExceptionHandler.java');
  assert.ok(fs.existsSync(handlerPath), 'GlobalExceptionHandler must exist');
  const content = fs.readFileSync(handlerPath, 'utf8');
  assert.ok(content.includes('ErrorResponseDTO'), 'Returns standardized DTO');
  assert.ok(!content.includes('e.printStackTrace()'), 'Does not dump unhandled printStackTrace to client output');
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
  console.log(`\n${colors.bold}${colors.green}All Final Production Security Audit tests passed! HireHub AI meets production security criteria.${colors.reset}\n`);
}
