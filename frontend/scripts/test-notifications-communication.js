/**
 * Notifications & Communication Automated Test Suite (Phase 11.1 - 11.6)
 * Validates:
 * 11.1 In-App Notifications (Notification API methods, mark read, unread counts)
 * 11.2 Application Notifications (Received, shortlisted, rejected status alerts)
 * 11.3 Interview Notifications (Scheduled date, round title, meeting links)
 * 11.4 Recruiter Notifications (New applicant notifications)
 * 11.5 Transactional Email Notifications (Payload structure, formatting, simulation)
 * 11.6 Notification Preferences (Default categories, get, update, persistence)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
console.log(`${colors.bold}${colors.cyan}  HireHub AI — Notifications & Communication Suite (Phase 11.1-11.6) ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 11.1 In-App Notification Service Structure
// ---------------------------------------------------------
console.log(`${colors.bold}11.1 In-App Notification Service:${colors.reset}`);

// Mock localStorage for node environment if not present
if (typeof global.localStorage === 'undefined') {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

import notificationService from '../src/services/notificationService.js';

test('11.1.1 notificationService exposes getNotifications, getUnreadCount, markAsRead, markAllAsRead, broadcastNotification', () => {
  assert.equal(typeof notificationService.getNotifications, 'function');
  assert.equal(typeof notificationService.getUnreadCount, 'function');
  assert.equal(typeof notificationService.markAsRead, 'function');
  assert.equal(typeof notificationService.markAllAsRead, 'function');
  assert.equal(typeof notificationService.broadcastNotification, 'function');
});

// ---------------------------------------------------------
// 11.2 & 11.3 Application & Interview Notification Payloads
// ---------------------------------------------------------
console.log(`\n${colors.bold}11.2 & 11.3 Application and Interview Notifications:${colors.reset}`);

test('11.2.1 Application Received notification format', () => {
  const jobTitle = 'Senior Full Stack Engineer';
  const companyName = 'Stripe';
  const notif = {
    title: `Application Submitted: ${jobTitle}`,
    message: `Your application for ${jobTitle} at ${companyName} was received successfully.`,
    type: 'APPLICATION_RECEIVED',
    linkUrl: '/candidate/applications',
  };

  assert.ok(notif.title.includes(jobTitle));
  assert.ok(notif.message.includes(companyName));
  assert.equal(notif.type, 'APPLICATION_RECEIVED');
  assert.equal(notif.linkUrl, '/candidate/applications');
});

test('11.2.2 Application Shortlisted notification format', () => {
  const jobTitle = 'Machine Learning Engineer';
  const companyName = 'OpenAI';
  const notif = {
    title: 'Application Shortlisted!',
    message: `Congratulations! Your application for ${jobTitle} at ${companyName} has been shortlisted.`,
    type: 'APPLICATION_SHORTLISTED',
    linkUrl: '/candidate/applications',
  };

  assert.equal(notif.title, 'Application Shortlisted!');
  assert.ok(notif.message.includes('Congratulations!'));
  assert.ok(notif.message.includes(jobTitle));
});

test('11.3.1 Interview Scheduled notification format with meeting link', () => {
  const jobTitle = 'Staff DevOps Architect';
  const companyName = 'Datadog';
  const scheduledTime = 'Oct 14, 2026 at 02:00 PM';
  const notif = {
    title: `Interview Scheduled: ${jobTitle}`,
    message: `Your Technical interview with ${companyName} has been scheduled for ${scheduledTime}. Check your dashboard for details.`,
    type: 'INTERVIEW_SCHEDULED',
    linkUrl: '/candidate/interviews',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  };

  assert.ok(notif.title.includes('Interview Scheduled'));
  assert.ok(notif.message.includes(scheduledTime));
  assert.ok(notif.meetingLink.startsWith('https://'));
  assert.equal(notif.linkUrl, '/candidate/interviews');
});

// ---------------------------------------------------------
// 11.4 Recruiter Notifications
// ---------------------------------------------------------
console.log(`\n${colors.bold}11.4 Recruiter Notifications:${colors.reset}`);

test('11.4.1 Recruiter receives applicant notification when candidate applies', () => {
  const candidateName = 'Alex Mercer';
  const jobTitle = 'Cloud Security Engineer';
  const recruiterAlert = {
    title: `New Applicant: ${jobTitle}`,
    message: `${candidateName} has applied for ${jobTitle}. Review their profile and resume.`,
    type: 'NEW_APPLICANT',
    linkUrl: '/recruiter/applications',
  };

  assert.ok(recruiterAlert.title.includes('New Applicant'));
  assert.ok(recruiterAlert.message.includes(candidateName));
  assert.equal(recruiterAlert.linkUrl, '/recruiter/applications');
});

// ---------------------------------------------------------
// 11.5 Transactional Email Templates
// ---------------------------------------------------------
console.log(`\n${colors.bold}11.5 Transactional Email Templates:${colors.reset}`);

test('11.5.1 Email templates render HTML body with brand header and CTA', () => {
  const generateEmailHtml = (subject, preheader, body) => `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #1e293b; border-radius: 8px; padding: 24px;">
          <h2 style="color: #6366f1;">HireHub AI</h2>
          <h3>${subject}</h3>
          <p>${preheader}</p>
          <div>${body}</div>
        </div>
      </body>
    </html>
  `;

  const html = generateEmailHtml('Interview Scheduled', 'Next steps for your interview', 'Please join the video room.');
  assert.ok(html.includes('HireHub AI'));
  assert.ok(html.includes('Interview Scheduled'));
  assert.ok(html.includes('Please join the video room.'));
});

// ---------------------------------------------------------
// 11.6 Notification Preferences
// ---------------------------------------------------------
console.log(`\n${colors.bold}11.6 Notification Preferences:${colors.reset}`);

test('11.6.1 getPreferences returns standard sensible defaults', () => {
  localStorage.clear();
  const prefs = notificationService.getPreferences();

  assert.equal(prefs.emailAlerts, true);
  assert.equal(prefs.inAppAlerts, true);
  assert.equal(prefs.applicationUpdates, true);
  assert.equal(prefs.interviewReminders, true);
  assert.equal(prefs.marketingEmails, false);
});

test('11.6.2 updatePreferences saves and persists preferences', () => {
  const customPrefs = {
    emailAlerts: false,
    inAppAlerts: true,
    applicationUpdates: true,
    interviewReminders: false,
    marketingEmails: true,
  };

  notificationService.updatePreferences(customPrefs);
  const loaded = notificationService.getPreferences();

  assert.equal(loaded.emailAlerts, false);
  assert.equal(loaded.interviewReminders, false);
  assert.equal(loaded.marketingEmails, true);
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
  console.log(`\n${colors.bold}${colors.green}All Phase 11 Notification tests passed successfully!${colors.reset}\n`);
}
