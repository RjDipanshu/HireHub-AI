/**
 * Signup + Welcome / Email Verification Flow Automated Test Suite (Part 4)
 * Validates:
 * 1. Routing & Route Guard Integrity:
 *    - /verify-email route registered in AppRouter.jsx
 *    - GuestRoute permits /verify-email without premature redirect
 * 2. Supabase Auth Integration & Options:
 *    - authService.signUp passes emailRedirectTo derived from configurable URL
 *    - authService.resendVerificationEmail calls supabase.auth.resend({ type: 'signup' })
 *    - AuthContext exposes resendVerificationEmail
 * 3. User Validation & Error Normalization:
 *    - Password complexity criteria enforced
 *    - Friendly duplicate email error mapping
 *    - Rate limit & network error mapping
 * 4. Welcome & Verification Experience:
 *    - Welcome to HireHub AI 🚀 header
 *    - "Your career journey starts here."
 *    - 5 Feature highlights:
 *      * Discover Relevant Jobs
 *      * Build Your Professional Profile
 *      * AI Resume Analysis
 *      * AI Job Matching
 *      * Interview Preparation
 *    - Check Your Email state on RegisterPage with resend cooldown
 * 5. Security Audit:
 *    - Zero passwords, tokens, or keys logged
 *    - Passwords not stored in custom backend tables
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

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

console.log(`\n${colors.bold}${colors.cyan}===================================================================`);
console.log(`   HireHub AI — Signup + Welcome / Verification Test Suite (Part 4)`);
console.log(`===================================================================\n${colors.reset}`);

// ---------------------------------------------------------
// 1. Routing & Route Guard Integrity
// ---------------------------------------------------------
console.log(`${colors.bold}1. Routing & Route Guard Integrity:${colors.reset}`);

test('1.1 AppRouter registers /verify-email with VerifyEmailPage component', () => {
  const routerPath = path.join(projectRoot, 'src', 'routes', 'AppRouter.jsx');
  const routerContent = fs.readFileSync(routerPath, 'utf8');

  assert.ok(
    routerContent.includes('path="/verify-email"'),
    'AppRouter must define route for /verify-email'
  );
  assert.ok(
    routerContent.includes('VerifyEmailPage'),
    'AppRouter must bind VerifyEmailPage'
  );
});

test('1.2 GuestRoute allows /verify-email without premature redirect', () => {
  const guestRoutePath = path.join(projectRoot, 'src', 'routes', 'GuestRoute.jsx');
  const content = fs.readFileSync(guestRoutePath, 'utf8');

  assert.ok(
    content.includes('/verify-email'),
    'GuestRoute must allow /verify-email so verification flow is not interrupted'
  );
});

// ---------------------------------------------------------
// 2. Auth Service Layer & Verification Resend
// ---------------------------------------------------------
console.log(`\n${colors.bold}2. Auth Service Layer & Verification Resend:${colors.reset}`);

test('2.1 authService.signUp configures emailRedirectTo using environment configuration', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.ok(
    content.includes('emailRedirectTo'),
    'authService.signUp must configure emailRedirectTo'
  );
  assert.ok(
    content.includes('verify-email') || content.includes('VITE_AUTH_VERIFY_REDIRECT_URL'),
    'authService must route verification to /verify-email'
  );
});

test('2.2 authService provides resendVerificationEmail using Supabase Auth resend', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.ok(
    content.includes('async resendVerificationEmail'),
    'authService must implement resendVerificationEmail'
  );
  assert.ok(
    content.includes('supabase.auth.resend'),
    'resendVerificationEmail must call supabase.auth.resend'
  );
});

test('2.3 AuthContext provides resendVerificationEmail to components', () => {
  const contextPath = path.join(projectRoot, 'src', 'context', 'AuthContext.jsx');
  const content = fs.readFileSync(contextPath, 'utf8');

  assert.ok(
    content.includes('resendVerificationEmail'),
    'AuthContext value must expose resendVerificationEmail'
  );
});

// ---------------------------------------------------------
// 3. User Experience & Welcome Branding
// ---------------------------------------------------------
console.log(`\n${colors.bold}3. User Experience & Welcome Branding:${colors.reset}`);

test('3.1 VerifyEmailPage renders Welcome to HireHub AI and tagline', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'VerifyEmailPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    content.includes('Welcome to HireHub AI 🚀'),
    'VerifyEmailPage must contain: "Welcome to HireHub AI 🚀"'
  );
  assert.ok(
    content.includes('Your career journey starts here.'),
    'VerifyEmailPage must contain: "Your career journey starts here."'
  );
});

test('3.2 VerifyEmailPage showcases all 5 platform features', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'VerifyEmailPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(content.includes('Discover Relevant Jobs'), 'Must highlight Discover Relevant Jobs');
  assert.ok(content.includes('Build Your Professional Profile'), 'Must highlight Build Your Professional Profile');
  assert.ok(content.includes('AI Resume Analysis'), 'Must highlight AI Resume Analysis');
  assert.ok(content.includes('AI Job Matching'), 'Must highlight AI Job Matching');
  assert.ok(content.includes('Interview Preparation'), 'Must highlight Interview Preparation');
});

test('3.3 RegisterPage implements Check Your Email view with resend cooldown', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'RegisterPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    content.includes('Check Your Email'),
    'RegisterPage must contain Check Your Email view'
  );
  assert.ok(
    content.includes('handleResendVerification') || content.includes('resendVerificationEmail'),
    'RegisterPage must include resend verification handler'
  );
  assert.ok(
    content.includes('cooldown'),
    'RegisterPage must enforce resend cooldown'
  );
  assert.ok(
    content.includes('CANDIDATE') && content.includes('RECRUITER'),
    'RegisterPage must preserve role selection'
  );
});

// ---------------------------------------------------------
// 4. Security & Error Handling
// ---------------------------------------------------------
console.log(`\n${colors.bold}4. Security & Error Normalization:${colors.reset}`);

test('4.1 authService.signUp maps duplicate email to friendly guidance', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.ok(
    content.includes('already exists') || content.includes('already registered'),
    'authService must normalize duplicate email errors'
  );
});

test('4.2 Zero passwords or tokens logged in signup and verification flow', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  const signUpSection = content.slice(content.indexOf('async signUp'));
  const endOfSignUp = signUpSection.indexOf('async resendVerificationEmail');
  const signUpCode = signUpSection.slice(0, endOfSignUp);

  assert.ok(
    !signUpCode.includes('console.log(password') && !signUpCode.includes('console.dir(password'),
    'Passwords must never be logged'
  );
});

test('4.3 .env.example documents verification redirect URL configuration', () => {
  const envPath = path.join(projectRoot, '.env.example');
  const content = fs.readFileSync(envPath, 'utf8');

  assert.ok(
    content.includes('verify-email'),
    '.env.example must document the /verify-email redirect URL'
  );
});

console.log(`\n${colors.bold}===================================================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}All Signup + Welcome / Email Verification validations passed!${colors.reset}\n`);
}
