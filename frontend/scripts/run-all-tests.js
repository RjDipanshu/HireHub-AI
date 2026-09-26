/**
 * HireHub AI — Master Test Suite Orchestrator
 * Executes all 22 automated test suites sequentially with live streaming logs,
 * timing benchmarks, and a consolidated pass/fail executive summary.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const suites = [
  { name: 'API Integration (Phase 3)', file: 'scripts/test-api-integration.js' },
  { name: 'RBAC & Routing Matrix (Phase 4)', file: 'scripts/test-rbac-routing.js' },
  { name: 'Candidate Profile (Phase 6.3)', file: 'scripts/test-candidate-profile.js' },
  { name: 'Candidate Flow (Phase 6)', file: 'scripts/test-candidate-flow.js' },
  { name: 'Recruiter Portal (Phase 7)', file: 'scripts/test-recruiter-portal.js' },
  { name: 'Admin Portal (Phase 8)', file: 'scripts/test-admin-portal.js' },
  { name: 'AI Career Intelligence (Phase 9)', file: 'scripts/test-ai-career-intelligence.js' },
  { name: 'AI Resume Analyzer (1.0)', file: 'scripts/test-ai-resume-analyzer.js' },
  { name: 'AI Job Match (2.0)', file: 'scripts/test-ai-job-match.js' },
  { name: 'File Storage Infrastructure (Phase 10)', file: 'scripts/test-file-storage.js' },
  { name: 'Notifications & Communications (Phase 11)', file: 'scripts/test-notifications-communication.js' },
  { name: 'End-to-End Recruitment Lifecycle (Phase 14)', file: 'scripts/test-e2e-flows.js' },
  { name: 'Dockerization & CI/CD Pipeline (Phases 16-18)', file: 'scripts/test-docker-ci.js' },
  { name: 'Production Security Audit (Phase 20)', file: 'scripts/security-audit.js' },
  { name: 'Semantic Search Engine (Phases 12-13)', file: 'scripts/test-semantic-search.js' },
  { name: 'AI Quality & Fairness Benchmarks (Phases 28-29)', file: 'scripts/evaluate-ai-quality.js' },
  { name: 'User Journeys Simulation (Phase 23)', file: 'scripts/test-e2e-journeys.js' },
  { name: 'UI/UX Accessibility & Design Audit (Phase 31)', file: 'scripts/test-ui-ux-audit.js' },
  { name: 'Forgot Password Authentication Flow', file: 'scripts/test-forgot-password.js' },
  { name: 'Reset Password Security Flow', file: 'scripts/test-reset-password.js' },
  { name: 'Signup & Welcome Verification Flow', file: 'scripts/test-signup-verification.js' },
  { name: 'Enterprise Help & Support Flow', file: 'scripts/test-support-frontend.js' },
];

console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   HireHub AI — Master Automated Quality Gate Execution (22 Suites)   ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

const results = [];
let totalStartTime = Date.now();

for (let i = 0; i < suites.length; i++) {
  const suite = suites[i];
  const suitePath = path.resolve(frontendDir, suite.file);
  const suiteStartTime = Date.now();

  console.log(`\n${colors.bold}[${i + 1}/${suites.length}] Running ${suite.name}...${colors.reset}`);

  const proc = spawnSync(process.execPath, [suitePath], {
    cwd: frontendDir,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' },
  });

  const duration = ((Date.now() - suiteStartTime) / 1000).toFixed(2);
  const success = proc.status === 0;

  results.push({
    name: suite.name,
    file: suite.file,
    duration,
    status: success ? 'PASSED' : 'FAILED',
    exitCode: proc.status,
  });

  if (!success) {
    console.error(`\n${colors.red}${colors.bold}❌ ${suite.name} FAILED with exit code ${proc.status}${colors.reset}\n`);
    // Print summary immediately and exit
    break;
  }
}

const totalDuration = ((Date.now() - totalStartTime) / 1000).toFixed(2);
const failedSuites = results.filter((r) => r.status === 'FAILED');
const passedSuites = results.filter((r) => r.status === 'PASSED');

console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`${colors.bold}                   Automated Quality Gate Summary                     ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}`);

for (const r of results) {
  const statusColor = r.status === 'PASSED' ? colors.green : colors.red;
  const mark = r.status === 'PASSED' ? '✓' : '✗';
  console.log(`  ${statusColor}${mark} ${r.name.padEnd(52)} [${r.status}] (${r.duration}s)${colors.reset}`);
}

console.log(`${colors.bold}${colors.cyan}----------------------------------------------------------------------${colors.reset}`);
console.log(`Total Suites Executed: ${results.length}/${suites.length}`);
console.log(`Passed: ${colors.green}${passedSuites.length}${colors.reset} | Failed: ${failedSuites.length > 0 ? colors.red + failedSuites.length : colors.green + '0'}${colors.reset}`);
console.log(`Total Execution Time: ${totalDuration}s`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

if (failedSuites.length > 0 || results.length < suites.length) {
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}🎉 All 22 HireHub AI automated test suites passed successfully!${colors.reset}\n`);
  process.exit(0);
}
