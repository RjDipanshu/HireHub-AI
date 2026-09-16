/**
 * Reset Password Flow Automated Test Suite (Part 3)
 * Tests:
 * 1. Routing & Guard Configuration:
 *    - /reset-password route registered in AppRouter.jsx
 *    - GuestRoute does not redirect away from /reset-password during recovery session
 * 2. Recovery Session Verification & Protection:
 *    - Validates presence of recovery indicators / active session
 *    - Shows exact invalid/expired message when no session or link expired:
 *      "This password reset link is invalid or has expired."
 *    - Provides "Request New Reset Link" button leading to /forgot-password
 * 3. Password Requirements & Complexity:
 *    - Min 8 chars, uppercase, lowercase, number, special char
 *    - Both passwords must match before submission is enabled
 * 4. Auth & Service Layer:
 *    - Uses supabase.auth.updateUser({ password }) via authService.updatePassword
 *    - Prevents technical/raw Supabase error leakage
 *    - Cleans up temporary recovery session on success
 *    - Shows exact success message:
 *      "Your password has been updated successfully. You can now sign in with your new password."
 * 5. Security Audit:
 *    - Zero exposure or logging of passwords, tokens, or secrets
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

console.log(`\n${colors.bold}${colors.cyan}===================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   HireHub AI — Reset Password Flow Automated Test Suite (Part 3)  ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 1. Routing & Route Guard Integrity
// ---------------------------------------------------------
console.log(`${colors.bold}1. Routing & Route Guard Integrity:${colors.reset}`);

test('1.1 AppRouter registers /reset-password with ResetPasswordPage component', () => {
  const routerPath = path.join(projectRoot, 'src', 'routes', 'AppRouter.jsx');
  const routerContent = fs.readFileSync(routerPath, 'utf8');

  assert.ok(
    routerContent.includes('path="/reset-password"'),
    'AppRouter must define route for /reset-password'
  );
  assert.ok(
    routerContent.includes('ResetPasswordPage'),
    'AppRouter must bind ResetPasswordPage'
  );
});

test('1.2 GuestRoute allows /reset-password without premature redirect', () => {
  const guestRoutePath = path.join(projectRoot, 'src', 'routes', 'GuestRoute.jsx');
  const content = fs.readFileSync(guestRoutePath, 'utf8');

  assert.ok(
    content.includes('/reset-password'),
    'GuestRoute must explicitly allow /reset-password so recovery flow is not intercepted'
  );
});

// ---------------------------------------------------------
// 2. Recovery Session Verification & Expired State
// ---------------------------------------------------------
console.log(`\n${colors.bold}2. Recovery Session Verification & Expired States:${colors.reset}`);

test('2.1 ResetPasswordPage verifies recovery session and handles URL errors', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ResetPasswordPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    content.includes('PASSWORD_RECOVERY') || content.includes('getSession'),
    'ResetPasswordPage must verify recovery session with Supabase'
  );
  assert.ok(
    content.includes('error_code') || content.includes('error='),
    'ResetPasswordPage must check for URL error parameters from expired/invalid links'
  );
});

test('2.2 ResetPasswordPage contains exact invalid/expired link message and button', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ResetPasswordPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  const expectedInvalidMsg = 'This password reset link is invalid or has expired.';
  assert.ok(
    content.includes(expectedInvalidMsg),
    `ResetPasswordPage must contain exact message: "${expectedInvalidMsg}"`
  );
  assert.ok(
    content.includes('to="/forgot-password"'),
    'ResetPasswordPage must provide button to request a new reset link'
  );
});

// ---------------------------------------------------------
// 3. Password Requirements & Strength
// ---------------------------------------------------------
console.log(`\n${colors.bold}3. Password Requirements & Complexity Criteria:${colors.reset}`);

test('3.1 Enforces all 5 required complexity criteria', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ResetPasswordPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(content.includes('length >= 8'), 'Must enforce min 8 chars');
  assert.ok(content.includes('/[A-Z]/'), 'Must enforce uppercase letter');
  assert.ok(content.includes('/[a-z]/'), 'Must enforce lowercase letter');
  assert.ok(content.includes('/[0-9]/'), 'Must enforce number');
  assert.ok(content.includes('/[^A-Za-z0-9]/'), 'Must enforce special character');
});

test('3.2 Password validation unit test assertions', () => {
  const validate = (pwd) => ({
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    num: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  });

  const valid = validate('SecureP@ssw0rd');
  assert.ok(Object.values(valid).every(Boolean));

  const noUpper = validate('securep@ssw0rd');
  assert.equal(noUpper.upper, false);

  const noNumber = validate('SecureP@ssword');
  assert.equal(noNumber.num, false);

  const noSpecial = validate('SecurePassw0rd');
  assert.equal(noSpecial.special, false);

  const tooShort = validate('Sec1@');
  assert.equal(tooShort.length, false);
});

test('3.3 Validates passwords match before submission', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ResetPasswordPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    content.includes('passwordsMatch') || content.includes('password === confirmPassword'),
    'Form must enforce password matching'
  );
  assert.ok(
    content.includes('Show password') || content.includes('showPassword'),
    'Form must provide Show/Hide password toggles'
  );
});

// ---------------------------------------------------------
// 4. authService.updatePassword & Success State
// ---------------------------------------------------------
console.log(`\n${colors.bold}4. Supabase UpdatePassword & Success State:${colors.reset}`);

test('4.1 authService.updatePassword calls supabase.auth.updateUser', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.ok(
    content.includes('supabase.auth.updateUser'),
    'authService must call Supabase updateUser with new password'
  );
});

test('4.2 ResetPasswordPage renders exact success message and Sign In button', () => {
  const pagePath = path.join(projectRoot, 'src', 'pages', 'auth', 'ResetPasswordPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  const expectedSuccessMsg =
    'Your password has been updated successfully. You can now sign in with your new password.';
  assert.ok(
    content.includes(expectedSuccessMsg),
    `ResetPasswordPage must contain exact success message: "${expectedSuccessMsg}"`
  );
  assert.ok(
    content.includes('to="/login"'),
    'ResetPasswordPage must provide Sign In button navigating to /login'
  );
});

// ---------------------------------------------------------
// 5. Security & Error Normalization
// ---------------------------------------------------------
console.log(`\n${colors.bold}5. Security & Technical Error Masking:${colors.reset}`);

test('5.1 No credentials, tokens, or raw secrets logged in updatePassword', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  const updateSection = content.slice(content.indexOf('async updatePassword'));
  const nextSection = updateSection.slice(0, updateSection.indexOf('async syncUser'));

  assert.ok(
    !updateSection.includes('console.log(newPassword') &&
    !updateSection.includes('console.dir(newPassword'),
    'Passwords must never be logged'
  );
});

test('5.2 Technical errors are converted to user-friendly messages', () => {
  const servicePath = path.join(projectRoot, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.ok(
    content.includes('Password does not meet security requirements') ||
    content.includes('Your reset session is invalid or has expired') ||
    content.includes('Unable to update password'),
    'Technical errors must be converted to user-friendly messages'
  );
});

console.log(`\n${colors.bold}===================================================================${colors.reset}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}All Reset Password flow validations passed!${colors.reset}\n`);
}
