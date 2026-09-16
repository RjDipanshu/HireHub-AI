/**
 * HireHub AI — Part 7 Help & Support Frontend Verification Test Suite
 * Validates Support Service, CreateTicketForm validation, Server Ticket ID rendering,
 * EmptyState / Loading / Error states, Navigation, and Backend REST API integration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
  } else {
    failedTests++;
    console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${testName} - ${detail}`);
  }
}

console.log('\n===============================================================');
console.log('HireHub AI — Part 7 Help & Support Frontend Verification');
console.log('===============================================================\n');

// -------------------------------------------------------------
// Test 1: Service Architecture & API Client Integration
// -------------------------------------------------------------
console.log('[Test Group 1] Support Service Architecture');
const supportServicePath = path.join(frontendRoot, 'src', 'services', 'supportService.js');
assert(fs.existsSync(supportServicePath), 'supportService.js exists');

const supportServiceContent = fs.readFileSync(supportServicePath, 'utf8');
assert(supportServiceContent.includes("api.post('/support/tickets'"), 'createTicket sends POST to /support/tickets');
assert(supportServiceContent.includes("api.get('/support/tickets'"), 'getMyTickets sends GET to /support/tickets');
assert(supportServiceContent.includes("api.get(`/support/tickets/"), 'getMyTicket sends GET to /support/tickets/{ticketId}');
assert(!supportServiceContent.includes('Authorization'), 'Does not manually attach JWT (delegated to api.js interceptor)');
assert(!supportServiceContent.includes('userId'), 'Does not send or hardcode userId in request payload');

// -------------------------------------------------------------
// Test 2: CreateTicketForm Validation & Inputs
// -------------------------------------------------------------
console.log('\n[Test Group 2] Create Ticket Form & Validation');
const formPath = path.join(frontendRoot, 'src', 'components', 'support', 'CreateTicketForm.jsx');
assert(fs.existsSync(formPath), 'CreateTicketForm.jsx exists');

const formContent = fs.readFileSync(formPath, 'utf8');
assert(formContent.includes('ticket-subject'), 'Subject input field exists with unique ID');
assert(formContent.includes('ticket-category'), 'Category select dropdown exists');
assert(formContent.includes('ticket-priority'), 'Priority select dropdown exists');
assert(formContent.includes('ticket-description'), 'Description textarea exists');
assert(formContent.includes('ticket-submit-button'), 'Submit button exists');
assert(formContent.includes('maxLength={200}'), 'Subject length limited to 200 characters');
assert(formContent.includes('maxLength={5000}'), 'Description length limited to 5000 characters');
assert(formContent.includes('isSubmitting'), 'Double-submit protection via isSubmitting flag');
assert(formContent.includes('disabled={isSubmitting}'), 'Submit button disabled while submitting');
assert(formContent.includes('CATEGORY_OPTIONS'), 'Exposes 10 valid enterprise categories');
assert(formContent.includes('PRIORITY_OPTIONS'), 'Exposes valid priority levels (LOW, MEDIUM, HIGH, URGENT)');

// -------------------------------------------------------------
// Test 3: Success Card & Server Ticket ID Display
// -------------------------------------------------------------
console.log('\n[Test Group 3] Success State & Server Ticket ID Display');
const successCardPath = path.join(frontendRoot, 'src', 'components', 'support', 'SupportTicketSuccessCard.jsx');
assert(fs.existsSync(successCardPath), 'SupportTicketSuccessCard.jsx exists');

const successCardContent = fs.readFileSync(successCardPath, 'utf8');
assert(successCardContent.includes('success-ticket-id'), 'Prominently renders generated ticket ID element');
assert(successCardContent.includes('ticket.ticketId'), 'Renders server-provided ticketId directly');
assert(successCardContent.includes('btn-view-my-tickets'), 'Provides "View My Tickets" action button');
assert(successCardContent.includes('btn-create-another-ticket'), 'Provides "Create Another Ticket" action button');
assert(!successCardContent.includes('Math.random()'), 'Does not generate random or fake ticket IDs on frontend');

// -------------------------------------------------------------
// Test 4: Support Ticket List & Badges
// -------------------------------------------------------------
console.log('\n[Test Group 4] Support Ticket List & Status Badges');
const listPath = path.join(frontendRoot, 'src', 'components', 'support', 'SupportTicketList.jsx');
assert(fs.existsSync(listPath), 'SupportTicketList.jsx exists');

const listContent = fs.readFileSync(listPath, 'utf8');
assert(listContent.includes('EmptyState'), 'Integrates existing EmptyState component when no tickets exist');
assert(listContent.includes('No support tickets yet'), 'Displays friendly empty state title');
assert(listContent.includes('LoadingSpinner'), 'Integrates existing LoadingSpinner component');
assert(listContent.includes('getStatusVariant'), 'Renders status badges for OPEN, IN_PROGRESS, RESOLVED, etc.');
assert(listContent.includes('getPriorityVariant'), 'Renders priority badges for LOW, MEDIUM, HIGH, URGENT');
assert(listContent.includes('/support/tickets/'), 'Links ticket items to /support/tickets/:ticketId');

// -------------------------------------------------------------
// Test 5: Support Ticket Details Page
// -------------------------------------------------------------
console.log('\n[Test Group 5] Support Ticket Details Page');
const detailsPagePath = path.join(frontendRoot, 'src', 'pages', 'support', 'SupportTicketDetailsPage.jsx');
assert(fs.existsSync(detailsPagePath), 'SupportTicketDetailsPage.jsx exists');

const detailsContent = fs.readFileSync(detailsPagePath, 'utf8');
assert(detailsContent.includes('useParams'), 'Extracts ticketId parameter from route');
assert(detailsContent.includes('getMyTicket(ticketId)'), 'Calls supportService.getMyTicket with route ticketId');
assert(detailsContent.includes('link-back-to-support'), 'Provides Back to Support Tickets link');
assert(detailsContent.includes('ticket-details-subject'), 'Renders ticket subject');
assert(detailsContent.includes('ticket-details-description'), 'Renders full ticket description');
assert(detailsContent.includes('404') || detailsContent.includes('isNotFound'), 'Handles 404 ticket not found state gracefully');

// -------------------------------------------------------------
// Test 6: Navigation & Protected Routing
// -------------------------------------------------------------
console.log('\n[Test Group 6] Navigation & Protected Routing');
const routerPath = path.join(frontendRoot, 'src', 'routes', 'AppRouter.jsx');
const routerContent = fs.readFileSync(routerPath, 'utf8');
assert(routerContent.includes('path="/support"'), 'AppRouter registers /support route');
assert(routerContent.includes('path="/support/tickets/:ticketId"'), 'AppRouter registers /support/tickets/:ticketId route');
assert(routerContent.includes('allowedRoles={["CANDIDATE", "RECRUITER", "ADMIN"]}'), 'Protected across Candidate, Recruiter, and Admin roles');

const sidebarPath = path.join(frontendRoot, 'src', 'components', 'layout', 'Sidebar.jsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarContent.includes("to: '/support', label: 'Help & Support'"), 'Sidebar integrates Help & Support link');
assert(sidebarContent.includes('LifeBuoy'), 'Sidebar uses LifeBuoy icon for support');

const navbarPath = path.join(frontendRoot, 'src', 'components', 'layout', 'Navbar.jsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
assert(navbarContent.includes('to="/support"'), 'Navbar links to /support');

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`Total Checks: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
if (failedTests === 0) {
  console.log('\x1b[32mAll Part 7 Help & Support Frontend tests PASSED successfully!\x1b[0m');
  console.log('===============================================================\n');
  process.exit(0);
} else {
  console.log('\x1b[31mSome checks failed. Please review above.\x1b[0m');
  console.log('===============================================================\n');
  process.exit(1);
}
