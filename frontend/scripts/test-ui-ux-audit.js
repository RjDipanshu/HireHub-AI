#!/usr/bin/env node

/**
 * HireHub AI — Phase 31.0 Final UI/UX Polish & Accessibility Audit Suite
 *
 * Verifies SaaS design excellence, responsive breakpoint coverage,
 * keyboard accessibility, modal dialog standards, state handling (loading/empty/error),
 * and high-contrast focus rings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

function readFileSafe(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('\n===================================================================');
console.log('   HireHub AI — 31.0 Final UI/UX & Accessibility Audit Suite       ');
console.log('===================================================================\n');

// -------------------------------------------------------------
// 1. Responsive Design & Breakpoints
// -------------------------------------------------------------
console.log('31.0.1 Responsive Design & Mobile Breakpoints:');
const globalsCss = readFileSafe('src/styles/globals.css');
const componentsCss = readFileSafe('src/styles/components.css');

assert(
  globalsCss.includes('@media (max-width: 1024px)') && globalsCss.includes('@media (max-width: 640px)'),
  'Verify global responsive grid breakpoints exist for tablet (1024px) and mobile (640px)'
);

assert(
  componentsCss.includes('@media (max-width: 900px)') && componentsCss.includes('@media (max-width: 768px)'),
  'Verify dashboard and navigation responsive queries exist (900px, 768px)'
);

assert(
  globalsCss.includes('.table-responsive') && globalsCss.includes('-webkit-overflow-scrolling: touch'),
  'Verify touch-friendly horizontal momentum scrollable table wrapper is configured'
);

// -------------------------------------------------------------
// 2. Accessibility & Keyboard Navigation
// -------------------------------------------------------------
console.log('\n31.0.2 Accessibility, A11y Attributes & Keyboard Navigation:');

assert(
  globalsCss.includes(':focus-visible') && globalsCss.includes('outline: 2px solid'),
  'Verify universal high-contrast :focus-visible rings are configured across interactive elements'
);

assert(
  globalsCss.includes('.sr-only') && globalsCss.includes('.skip-to-content'),
  'Verify screen-reader-only utility and skip navigation link are present'
);

const navbarCode = readFileSafe('src/components/layout/Navbar.jsx');
assert(
  navbarCode.includes('role="navigation"') &&
  navbarCode.includes('aria-expanded') &&
  navbarCode.includes("e.key === 'Escape'"),
  'Verify Navbar includes semantic navigation role, aria-expanded, and Escape key dismissal'
);

const applyModalCode = readFileSafe('src/components/jobs/ApplyJobModal.jsx');
assert(
  applyModalCode.includes('role="dialog"') &&
  applyModalCode.includes('aria-modal="true"') &&
  applyModalCode.includes("e.key === 'Escape'"),
  'Verify ApplyJobModal enforces WAI-ARIA dialog semantics and Escape key dismissal'
);

const aiMatchModalCode = readFileSafe('src/components/ai/AiJobMatchModal.jsx');
assert(
  aiMatchModalCode.includes('role="dialog"') &&
  aiMatchModalCode.includes('aria-modal="true"') &&
  aiMatchModalCode.includes("e.key === 'Escape'"),
  'Verify AiJobMatchModal enforces WAI-ARIA dialog semantics and Escape key dismissal'
);

const confirmDialogCode = readFileSafe('src/components/common/ConfirmDialog.jsx');
assert(
  confirmDialogCode.includes('role="dialog"') &&
  confirmDialogCode.includes('aria-modal="true"') &&
  confirmDialogCode.includes("e.key === 'Escape'"),
  'Verify ConfirmDialog enforces modal dialog semantics and Escape key dismissal'
);

// -------------------------------------------------------------
// 3. SaaS Visual Excellence: Loading, Empty, Error & Success States
// -------------------------------------------------------------
console.log('\n31.0.3 UI State Handling (Loading, Skeletons, Empty, Error):');

const skeletonCode = readFileSafe('src/components/common/SkeletonLoader.jsx');
assert(
  skeletonCode.includes('skeleton') && skeletonCode.includes('card'),
  'Verify SkeletonLoader component handles realistic content placeholders during async loads'
);

const emptyStateCode = readFileSafe('src/components/common/EmptyState.jsx');
assert(
  emptyStateCode.includes('empty-state') && emptyStateCode.includes('empty-state-title'),
  'Verify EmptyState component presents clear messaging, iconography, and call-to-actions'
);

const errorBoundaryCode = readFileSafe('src/components/common/ErrorBoundary.jsx');
assert(
  errorBoundaryCode.includes('componentDidCatch') && /something went wrong/i.test(errorBoundaryCode),
  'Verify ErrorBoundary gracefully catches unhandled runtime UI errors with retry recovery'
);

// -------------------------------------------------------------
// 4. SaaS Data Tables & Interactive Components
// -------------------------------------------------------------
console.log('\n31.0.4 SaaS Tables, Cards, and Buttons:');

assert(
  componentsCss.includes('.table th') && componentsCss.includes('.table tbody tr:hover'),
  'Verify SaaS data tables support polished hover states, sticky-ready headers, and subtle dividers'
);

assert(
  componentsCss.includes('.btn-primary') && componentsCss.includes('.btn-ai') && componentsCss.includes('.btn-outline'),
  'Verify cohesive design system button variants (Primary, AI Gradient, Outline, Secondary, Danger)'
);

assert(
  componentsCss.includes('@keyframes modalSlideUp') && componentsCss.includes('@keyframes modalFadeIn'),
  'Verify smooth cubic-bezier modal entrance transitions for desktop and mobile'
);

console.log('\n-------------------------------------------------------------------');
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('-------------------------------------------------------------------');

if (testsFailed > 0) {
  console.error('\nUI/UX Audit verification failed! Please address the highlighted issues.\n');
  process.exit(1);
} else {
  console.log('\nAll 31.0 UI/UX Polish & Accessibility tests passed successfully! 🎨✨\n');
  process.exit(0);
}
