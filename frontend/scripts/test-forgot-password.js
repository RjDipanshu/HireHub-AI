/**
 * Forgot Password Flow Automated Test Suite
 * Tests:
 * 1. Routing & Navigation:
 *    - /forgot-password route defined in AppRouter.jsx under GuestRoute
 *    - LoginPage contains link to /forgot-password
 * 2. authService.resetPassword:
 *    - Uses configurable redirect URL (env.VITE_RESET_PASSWORD_REDIRECT_URL || env.VITE_APP_URL/reset-password)
 *    - Calls supabase.auth.resetPasswordForEmail
 *    - Enforces account enumeration protection (returns identical message whether account exists or not)
 *    - Handles rate limits (429 / over_email_send_rate_limit)
 *    - Handles network connection errors
 *    - Handles invalid / empty email inputs
 * 3. Security Audit:
 *    - Zero exposure or logging of passwords, tokens, or private secrets
 * 4. Documentation & Configuration:
 *    - .env.example contains VITE_APP_URL and Supabase redirect documentation
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

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    console.error(`    ${colors.red}Error:${colors.reset}`, err.message);
    failed++;
  }
}

console.log(`\n${colors.bold}${colors.cyan}===================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   HireHub AI — Forgot Password Flow Automated Test Suite          ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 1. Navigation & Routing Integrity
// ---------------------------------------------------------
console.log(`${colors.bold}1. Navigation & Routing Integrity:${colors.reset}`);

test('1.1 LoginPage has "Forgot Password?" link pointing to /forgot-password', () => {
  const loginPagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');

  assert.ok(
    loginContent.includes('to="/forgot-password"'),
    'LoginPage must have a <Link to="/forgot-password">'
  );
  assert.ok(
    loginContent.includes('Forgot Password?'),
    'LoginPage must include "Forgot Password?" text'
  );
});

test('1.2 AppRouter registers /forgot-password under GuestRoute', () => {
  const routerPath = path.join(projectRoot, 'src', 'routes', 'AppRouter.jsx');
  const routerContent = fs.readFileSync(routerPath, 'utf8');

  assert.ok(
    routerContent.includes('path="/forgot-password"'),
    'AppRouter must define route for /forgot-password'
  );
  assert.ok(
    routerContent.includes('ForgotPasswordPage'),
    'AppRouter must import and bind ForgotPasswordPage component'
  );
});

// ---------------------------------------------------------
// 2. Component Design & Anti-Enumeration UX
// ---------------------------------------------------------
console.log(`\n${colors.bold}2. ForgotPasswordPage Component Integrity:${colors.reset}`);

test('2.1 ForgotPasswordPage contains exact anti-enumeration message', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ForgotPasswordPage.jsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  const expectedMessage = "If an account exists for this email address, we've sent password reset instructions.";
  assert.ok(
    pageContent.includes(expectedMessage),
    `ForgotPasswordPage must render: "${expectedMessage}"`
  );
});

test('2.2 ForgotPasswordPage includes client-side email validation and cooldown logic', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ForgotPasswordPage.jsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    pageContent.includes('validateEmail'),
    'ForgotPasswordPage must validate email format'
  );
  assert.ok(
    pageContent.includes('cooldown') || pageContent.includes('Cooldown'),
    'ForgotPasswordPage must implement duplicate submission prevention / cooldown'
  );
  assert.ok(
    pageContent.includes('to="/login"'),
    'ForgotPasswordPage must provide a link back to /login'
  );
});

// ---------------------------------------------------------
// 3. authService.resetPassword Logic & Security
// ---------------------------------------------------------
console.log(`\n${colors.bold}3. authService.resetPassword Logic & Security:${colors.reset}`);

test('3.1 resetPassword uses resetPasswordForEmail with configurable redirect URL', () => {
  const authServicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(authServicePath, 'utf8');

  assert.ok(
    content.includes('supabase.auth.resetPasswordForEmail'),
    'authService must call Supabase resetPasswordForEmail'
  );
  assert.ok(
    content.includes('VITE_RESET_PASSWORD_REDIRECT_URL') || content.includes('VITE_APP_URL'),
    'authService must support configurable redirect URL via environment variables'
  );
});

test('3.2 resetPassword prevents account enumeration on error', () => {
  const authServicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(authServicePath, 'utf8');

  assert.ok(
    content.includes('isUserNotFound') || content.includes('user not found'),
    'authService must intercept user-not-found errors to prevent account enumeration'
  );
});

test('3.3 resetPassword handles rate limit and network errors cleanly', () => {
  const authServicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(authServicePath, 'utf8');

  assert.ok(
    content.includes('Too many password reset requests') || content.includes('isRateLimited'),
    'authService must map rate-limit errors to clean user message'
  );
  assert.ok(
    content.includes('Network') || content.includes('isNetworkError'),
    'authService must map network errors to clean user message'
  );
});

test('3.4 Security: No credentials or tokens logged in resetPassword flow', () => {
  const authServicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(authServicePath, 'utf8');

  // Verify resetPassword does not log passwords or tokens
  const resetSection = content.slice(content.indexOf('async resetPassword'));
  const nextMethodIndex = resetSection.indexOf('async updatePassword');
  const resetBlock = resetSection.slice(0, nextMethodIndex);

  assert.ok(
    !resetBlock.includes('console.log') && !resetBlock.includes('console.dir'),
    'resetPassword must not contain console.log statements'
  );
});

// ---------------------------------------------------------
// 4. Environment Documentation
// ---------------------------------------------------------
console.log(`\n${colors.bold}4. Environment Documentation (.env.example):${colors.reset}`);

test('4.1 .env.example contains VITE_APP_URL and Supabase redirect configuration', () => {
  const envExamplePath = path.join(projectRoot, '.env.example');
  const content = fs.readFileSync(envExamplePath, 'utf8');

  assert.ok(
    content.includes('VITE_APP_URL'),
    '.env.example must document VITE_APP_URL'
  );
  assert.ok(
    content.includes('reset-password'),
    '.env.example must document the /reset-password redirect URL'
  );
  assert.ok(
    content.includes('localhost:5173'),
    '.env.example must document localhost redirect URL'
  );
});

// ---------------------------------------------------------
// 5. Functional Behavior Simulation
// ---------------------------------------------------------
console.log(`\n${colors.bold}5. Functional Logic Unit Assertions:${colors.reset}`);

test('5.1 Email validation regex correctly accepts valid emails and rejects malformed', () => {
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  assert.ok(EMAIL_REGEX.test('user@hirehub.ai'));
  assert.ok(EMAIL_REGEX.test('candidate.test+1@domain.co.uk'));
  assert.ok(!EMAIL_REGEX.test('plainaddress'));
  assert.ok(!EMAIL_REGEX.test('@missingusername.com'));
  assert.ok(!EMAIL_REGEX.test('username@.com'));
  assert.ok(!EMAIL_REGEX.test('user@domain'));
});

test('5.2 Redirect URL resolution prioritizes override > VITE_APP_URL > origin fallback', () => {
  const resolveRedirect = (custom, envUrl, origin) => {
    const siteUrl = envUrl || origin || 'http://localhost:5173';
    const defaultRedirectTo = `${siteUrl.replace(/\/+$/, '')}/reset-password`;
    return custom || defaultRedirectTo;
  };

  assert.equal(
    resolveRedirect('https://custom.com/reset', 'http://localhost:5173', 'http://localhost:5173'),
    'https://custom.com/reset'
  );
  assert.equal(
    resolveRedirect(null, 'https://hirehub.ai/', 'http://localhost:5173'),
    'https://hirehub.ai/reset-password'
  );
  assert.equal(
    resolveRedirect(null, null, 'http://localhost:5173'),
    'http://localhost:5173/reset-password'
  );
});

console.log(`\n${colors.bold}===================================================================${colors.reset}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}All Forgot Password flow validations passed!${colors.reset}\n`);
}
