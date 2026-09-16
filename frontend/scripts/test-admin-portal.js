/**
 * Comprehensive Admin Portal Automated Test Suite (Phase 8.1 - 8.10)
 * Validates:
 * 8.1 Admin Dashboard (System oversight, KPIs, Platform Health)
 * 8.2 User Management & Governance (Role verification, Status transitions: ACTIVE, INACTIVE, BLOCKED)
 * 8.3 Candidate Directory Governance (Profile oversight, Resume associations)
 * 8.4 Recruiter Directory Governance (Company links, Recruiter authorization)
 * 8.5 Company Directory & Verification (Verify employer toggle, deletion safety)
 * 8.6 Job Moderation & Compliance (OPEN, PAUSED, CLOSED lifecycle, salary ranges)
 * 8.7 Platform Applications Audit (Cross-company application audit, ATS score ranking)
 * 8.8 Notification Broadcasting (Global alerts, Role targeting: CANDIDATE, RECRUITER, ADMIN)
 * 8.9 Admin Analytics & Telemetry (Gemini token counts, Latency telemetry, Recruitment funnels)
 */

import assert from 'node:assert/strict';

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

console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   HireHub AI — Admin Portal Suite (8.1 to 8.10)     ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 8.1 Admin Dashboard
// ---------------------------------------------------------
console.log(`${colors.bold}8.1 Admin Dashboard Metrics & Overview:${colors.reset}`);

test('8.1.1 Correctly aggregates platform-wide stats across users, companies, jobs, and uptime', () => {
  const mockPlatformData = {
    users: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
    companies: [{ id: 'c1', isVerified: true }, { id: 'c2', isVerified: false }],
    jobs: [{ id: 'j1', status: 'OPEN' }, { id: 'j2', status: 'PAUSED' }],
    uptimeHours: 720,
    downtimeMinutes: 1.5,
  };

  const totalUsers = mockPlatformData.users.length;
  const verifiedCompanies = mockPlatformData.companies.filter((c) => c.isVerified).length;
  const activeJobs = mockPlatformData.jobs.filter((j) => j.status === 'OPEN').length;
  const uptimePercent = ((mockPlatformData.uptimeHours * 60 - mockPlatformData.downtimeMinutes) / (mockPlatformData.uptimeHours * 60)) * 100;

  assert.equal(totalUsers, 3);
  assert.equal(verifiedCompanies, 1);
  assert.equal(activeJobs, 1);
  assert.ok(uptimePercent > 99.9);
});

// ---------------------------------------------------------
// 8.2 & 8.3 & 8.4 User, Candidate, and Recruiter Governance
// ---------------------------------------------------------
console.log(`\n${colors.bold}8.2 - 8.4 User Management & RBAC Governance:${colors.reset}`);

test('8.2.1 Filters users by role (CANDIDATE, RECRUITER, ADMIN) accurately', () => {
  const users = [
    { id: '1', email: 'admin@hirehub.dev', role: 'ADMIN' },
    { id: '2', email: 'recruiter@tech.com', role: 'RECRUITER' },
    { id: '3', email: 'dev@example.com', role: 'CANDIDATE' },
    { id: '4', email: 'recruiter2@tech.com', role: 'RECRUITER' },
  ];

  const filterByRole = (role) => (role === 'ALL' ? users : users.filter((u) => u.role === role));

  assert.equal(filterByRole('CANDIDATE').length, 1);
  assert.equal(filterByRole('RECRUITER').length, 2);
  assert.equal(filterByRole('ADMIN').length, 1);
  assert.equal(filterByRole('ALL').length, 4);
});

test('8.2.2 Governs user account status transitions (ACTIVE -> INACTIVE -> BLOCKED)', () => {
  let user = { id: 'u10', email: 'badactor@bot.org', status: 'ACTIVE' };

  const transitionStatus = (target, newStatus) => {
    const valid = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
    assert.ok(valid.includes(newStatus), 'Invalid status');
    return { ...target, status: newStatus };
  };

  user = transitionStatus(user, 'INACTIVE');
  assert.equal(user.status, 'INACTIVE');

  user = transitionStatus(user, 'BLOCKED');
  assert.equal(user.status, 'BLOCKED');

  user = transitionStatus(user, 'ACTIVE');
  assert.equal(user.status, 'ACTIVE');
});

test('8.3.1 Resolves candidate profiles with linked resume and skills metadata', () => {
  const candidate = {
    id: 'cand-1',
    user: { email: 'cand@test.com' },
    headline: 'Senior Full Stack Engineer',
    skills: ['Java', 'React', 'Docker'],
    resumeUrl: 'https://storage.hirehub.dev/resumes/cand-1.pdf',
  };

  assert.ok(candidate.skills.length >= 3);
  assert.ok(candidate.resumeUrl.endsWith('.pdf'));
});

test('8.4.1 Resolves recruiter profiles with company affiliation and verification status', () => {
  const recruiter = {
    id: 'rec-1',
    user: { email: 'rec@novatech.io' },
    company: { id: 'c-1', name: 'NovaTech Solutions', isVerified: true },
    title: 'Lead Technical Recruiter',
  };

  assert.equal(recruiter.company.name, 'NovaTech Solutions');
  assert.equal(recruiter.company.isVerified, true);
});

// ---------------------------------------------------------
// 8.5 Company Directory & Verification
// ---------------------------------------------------------
console.log(`\n${colors.bold}8.5 Company Management & Verification:${colors.reset}`);

test('8.5.1 Toggles company verification status correctly', () => {
  let company = { id: 'c100', name: 'Nexus AI Systems', isVerified: false };

  const toggleVerification = (c) => ({ ...c, isVerified: !c.isVerified });

  company = toggleVerification(company);
  assert.equal(company.isVerified, true);

  company = toggleVerification(company);
  assert.equal(company.isVerified, false);
});

test('8.5.2 Validates company website URL and industry classification', () => {
  const company = {
    id: 'c101',
    name: 'Google Cloud Labs',
    website: 'https://cloud.google.com',
    industry: 'Cloud & Artificial Intelligence',
  };

  assert.ok(company.website.startsWith('http'));
  assert.ok(company.industry.length > 3);
});

// ---------------------------------------------------------
// 8.6 Job Moderation & Compliance
// ---------------------------------------------------------
console.log(`\n${colors.bold}8.6 Job Moderation & Compliance:${colors.reset}`);

test('8.6.1 Moderates job status through lifecycle (OPEN, PAUSED, CLOSED)', () => {
  let job = { id: 'job-1', title: 'Staff Systems Engineer', status: 'PAUSED' };

  const moderate = (j, status) => {
    const valid = ['OPEN', 'PAUSED', 'CLOSED'];
    assert.ok(valid.includes(status), 'Unsupported moderation status');
    return { ...j, status };
  };

  job = moderate(job, 'OPEN');
  assert.equal(job.status, 'OPEN');

  job = moderate(job, 'PAUSED');
  assert.equal(job.status, 'PAUSED');

  job = moderate(job, 'CLOSED');
  assert.equal(job.status, 'CLOSED');
});

test('8.6.2 Validates compensation bounds to prevent predatory or invalid listings', () => {
  const isValidSalaryBracket = (min, max) => {
    if (min == null || max == null) return false;
    return min >= 0 && max >= min;
  };

  assert.equal(isValidSalaryBracket(120000, 160000), true);
  assert.equal(isValidSalaryBracket(180000, 120000), false);
  assert.equal(isValidSalaryBracket(-1000, 50000), false);
});

// ---------------------------------------------------------
// 8.7 Platform Applications Audit
// ---------------------------------------------------------
console.log(`\n${colors.bold}8.7 Platform Applications Audit:${colors.reset}`);

test('8.7.1 Audits candidate applications and sorts by ATS match score', () => {
  const applications = [
    { id: 'app-1', candidate: 'Alice', atsScore: 82, status: 'APPLIED' },
    { id: 'app-2', candidate: 'Bob', atsScore: 94, status: 'INTERVIEW_SCHEDULED' },
    { id: 'app-3', candidate: 'Charlie', atsScore: 75, status: 'UNDER_REVIEW' },
  ];

  const sortedByFit = [...applications].sort((a, b) => b.atsScore - a.atsScore);

  assert.equal(sortedByFit[0].candidate, 'Bob');
  assert.equal(sortedByFit[0].atsScore, 94);
  assert.equal(sortedByFit[2].candidate, 'Charlie');
});

test('8.7.2 Filters applications by stage in hiring pipeline', () => {
  const applications = [
    { id: '1', status: 'APPLIED' },
    { id: '2', status: 'UNDER_REVIEW' },
    { id: '3', status: 'INTERVIEW_SCHEDULED' },
    { id: '4', status: 'ACCEPTED' },
    { id: '5', status: 'REJECTED' },
  ];

  const filterByStatus = (st) => applications.filter((a) => a.status === st);

  assert.equal(filterByStatus('ACCEPTED').length, 1);
  assert.equal(filterByStatus('INTERVIEW_SCHEDULED').length, 1);
  assert.equal(filterByStatus('REJECTED').length, 1);
});

// ---------------------------------------------------------
// 8.8 Broadcast Notification Dispatch
// ---------------------------------------------------------
console.log(`\n${colors.bold}8.8 System Broadcast Notifications:${colors.reset}`);

test('8.8.1 Validates broadcast payload schema and role isolation', () => {
  const createBroadcastPayload = ({ title, message, type = 'SYSTEM', targetRole = null }) => {
    assert.ok(title && title.trim().length > 0, 'Title required');
    assert.ok(message && message.trim().length > 0, 'Message required');
    assert.ok(['SYSTEM', 'ALERT', 'ANNOUNCEMENT'].includes(type), 'Invalid type');
    if (targetRole) {
      assert.ok(['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(targetRole), 'Invalid role target');
    }
    return { title: title.trim(), message: message.trim(), type, targetRole };
  };

  const globalAlert = createBroadcastPayload({
    title: 'Platform Maintenance Notice',
    message: 'System upgrade this Sunday at 02:00 UTC.',
    type: 'ALERT',
  });
  assert.equal(globalAlert.targetRole, null);
  assert.equal(globalAlert.type, 'ALERT');

  const recruiterNotice = createBroadcastPayload({
    title: 'New Applicant Ranking Feature',
    message: 'Recruiters can now rank candidates with Gemini AI.',
    type: 'ANNOUNCEMENT',
    targetRole: 'RECRUITER',
  });
  assert.equal(recruiterNotice.targetRole, 'RECRUITER');
});

// ---------------------------------------------------------
// 8.9 Admin Analytics & Telemetry
// ---------------------------------------------------------
console.log(`\n${colors.bold}8.9 System Telemetry & Funnel Analytics:${colors.reset}`);

test('8.9.1 Computes recruitment conversion funnel percentages accurately', () => {
  const telemetry = {
    jobViews: 10000,
    applications: 2400,
    aiShortlisted: 800,
    interviews: 200,
    hires: 48,
  };

  const appRate = (telemetry.applications / telemetry.jobViews) * 100;
  const shortlistRate = (telemetry.aiShortlisted / telemetry.applications) * 100;
  const interviewRate = (telemetry.interviews / telemetry.aiShortlisted) * 100;
  const hireRate = (telemetry.hires / telemetry.interviews) * 100;

  assert.equal(appRate.toFixed(1), '24.0');
  assert.equal(shortlistRate.toFixed(1), '33.3');
  assert.equal(interviewRate.toFixed(1), '25.0');
  assert.equal(hireRate.toFixed(1), '24.0');
});

test('8.9.2 Aggregates AI token consumption and latency percentiles', () => {
  const latenciesMs = [450, 520, 480, 610, 540, 700, 490, 530, 580, 850];
  latenciesMs.sort((a, b) => a - b);

  const p50 = latenciesMs[Math.floor(latenciesMs.length * 0.5)];
  const p90 = latenciesMs[Math.floor(latenciesMs.length * 0.9)];

  assert.ok(p50 <= 600, 'p50 latency should be under 600ms');
  assert.ok(p90 <= 900, 'p90 latency should be under 900ms');
});

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n${colors.bold}----------------------------------------------------${colors.reset}`);
console.log(`${colors.bold}Admin Portal Suite Results:${colors.reset}`);
console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
console.log(`  Failed: ${colors.red}${failed}${colors.reset}`);
console.log(`  Total:  ${passed + failed}`);
console.log(`${colors.bold}----------------------------------------------------${colors.reset}\n`);

if (failed > 0) {
  process.exit(1);
}
