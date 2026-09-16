/**
 * 2.0 AI Job Match - Comprehensive Automated Verification Suite
 * Validates:
 * 2.0.1 Dedicated JobMatchingService separate from ResumeAnalysisService
 * 2.0.2 POST /api/v1/ai/job-match/{jobId} endpoint deriving candidate from JWT
 * 2.0.3 Anti-hallucination prompt defense & Gemini structured output schema
 * 2.0.4 Five category scores (skills, experience, education, projects, keywords)
 * 2.0.5 AiJobMatchModal component with matching/missing skills and progress bars
 * 2.0.6 Integration on JobDetailsPage with [Check AI Match] button
 * 2.0.7 aiService.matchJob API integration
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
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
console.log(`${colors.bold}${colors.cyan}   HireHub AI — 2.0 AI Job Match Automated Verification Suite      ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 2.0.1 Backend Service Separation & Architecture
// ---------------------------------------------------------
console.log(`${colors.bold}2.0.1 Backend Service Separation & Architecture:${colors.reset}`);

test('2.0.1.1 Verify JobMatchingService exists and is separate from ResumeAnalysisService', () => {
  const servicePath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/JobMatchingService.java');
  assert.ok(fs.existsSync(servicePath), 'JobMatchingService.java must exist');
  const code = fs.readFileSync(servicePath, 'utf8');
  assert.ok(code.includes('public class JobMatchingService'), 'Must define JobMatchingService class');
  assert.ok(code.includes('@Service'), 'Must be marked with @Service');
  assert.ok(code.includes('matchCandidateToJob'), 'Must implement matchCandidateToJob method');
});

test('2.0.1.2 Verify JobMatchResponseDTO contains structured 2.0 fields', () => {
  const dtoPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/dto/ai/JobMatchResponseDTO.java');
  assert.ok(fs.existsSync(dtoPath), 'JobMatchResponseDTO.java must exist');
  const code = fs.readFileSync(dtoPath, 'utf8');
  assert.ok(code.includes('overallMatchScore'), 'Must include overallMatchScore');
  assert.ok(code.includes('matchLevel'), 'Must include matchLevel');
  assert.ok(code.includes('categoryScores'), 'Must include categoryScores map');
  assert.ok(code.includes('matchingSkills'), 'Must include matchingSkills list');
  assert.ok(code.includes('missingSkills'), 'Must include missingSkills list');
  assert.ok(code.includes('strengths'), 'Must include strengths list');
  assert.ok(code.includes('gaps'), 'Must include gaps list');
  assert.ok(code.includes('recommendation'), 'Must include recommendation');
  assert.ok(code.includes('explanation'), 'Must include explanation');
});

test('2.0.1.3 Verify AiController exposes POST /api/v1/ai/job-match/{jobId}', () => {
  const ctrlPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/controller/AiController.java');
  assert.ok(fs.existsSync(ctrlPath), 'AiController.java must exist');
  const code = fs.readFileSync(ctrlPath, 'utf8');
  assert.ok(code.includes('@PostMapping("/job-match/{jobId}")'), 'Must have @PostMapping("/job-match/{jobId}")');
  assert.ok(code.includes('jobMatchingService.matchJob'), 'Must delegate to jobMatchingService.matchJob');
  assert.ok(code.includes('jwt.getSubject()'), 'Must extract candidate identity securely from JWT subject');
});

// ---------------------------------------------------------
// 2.0.2 Anti-Hallucination & Gemini Service
// ---------------------------------------------------------
console.log(`\n${colors.bold}2.0.2 Anti-Hallucination Prompting & Fallback Engine:${colors.reset}`);

test('2.0.2.1 Verify GeminiService enforces zero-hallucination rules', () => {
  const geminiPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/GeminiService.java');
  const code = fs.readFileSync(geminiPath, 'utf8');
  assert.ok(code.includes('DO NOT INVENT, ASSUME, OR HALLUCINATE CANDIDATE SKILLS'), 'Must instruct Gemini against hallucinating candidate skills');
  assert.ok(code.includes('treat it as NOT IDENTIFIED and missing'), 'Must classify unverified skills as missing');
  assert.ok(code.includes('2.0-job-match'), 'Must specify prompt version 2.0-job-match');
  assert.ok(code.includes('matchCandidateToJobHeuristic'), 'Must implement reliable heuristic fallback engine');
});

test('2.0.2.2 Verify backend unit test JobMatchingTest exists and covers status, schema, and fallback', () => {
  const testPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/test/java/com/hirehub/hirehub_backend/service/JobMatchingTest.java');
  assert.ok(fs.existsSync(testPath), 'JobMatchingTest.java must exist');
  const code = fs.readFileSync(testPath, 'utf8');
  assert.ok(code.includes('testJobMatchEndpoint'), 'Must test job-match endpoint');
  assert.ok(code.includes('testJobMatchNotFound'), 'Must test 404 behavior for invalid job');
  assert.ok(code.includes('testJobMatchHeuristicAntiHallucination'), 'Must test anti-hallucination contract');
});

// ---------------------------------------------------------
// 2.0.3 Frontend Client Integration
// ---------------------------------------------------------
console.log(`\n${colors.bold}2.0.3 Frontend Client & Visual Modal:${colors.reset}`);

test('2.0.3.1 Verify aiService.js includes matchJob API call', () => {
  const aiServicePath = path.resolve('src/services/aiService.js');
  const code = fs.readFileSync(aiServicePath, 'utf8');
  assert.ok(code.includes('matchJob(jobId)'), 'Must define matchJob method in aiService');
  assert.ok(code.includes('`/ai/job-match/${jobId}`'), 'Must call POST /ai/job-match/${jobId}');
});

test('2.0.3.2 Verify AiJobMatchModal component displays all 5 category progress bars and badges', () => {
  const modalPath = path.resolve('src/components/ai/AiJobMatchModal.jsx');
  assert.ok(fs.existsSync(modalPath), 'AiJobMatchModal.jsx must exist');
  const code = fs.readFileSync(modalPath, 'utf8');
  assert.ok(code.includes('skills'), 'Must render skills category');
  assert.ok(code.includes('experience'), 'Must render experience category');
  assert.ok(code.includes('education'), 'Must render education category');
  assert.ok(code.includes('projects'), 'Must render projects category');
  assert.ok(code.includes('keywords'), 'Must render keywords category');
  assert.ok(code.includes('matchingSkills'), 'Must render matchingSkills chips');
  assert.ok(code.includes('missingSkills'), 'Must render missingSkills chips');
  assert.ok(code.includes('overallMatchScore'), 'Must display overall match score gauge');
});

test('2.0.3.3 Verify JobDetailsPage mounts [Check AI Match] button and opens AiJobMatchModal', () => {
  const jobDetailsPath = path.resolve('src/pages/public/JobDetailsPage.jsx');
  const code = fs.readFileSync(jobDetailsPath, 'utf8');
  assert.ok(code.includes('check-ai-job-match-btn'), 'Must include check-ai-job-match-btn button');
  assert.ok(code.includes('handleOpenAiMatch'), 'Must call handleOpenAiMatch');
  assert.ok(code.includes('<AiJobMatchModal'), 'Must mount AiJobMatchModal');
  assert.ok(code.includes('aiService.matchJob'), 'Must trigger aiService.matchJob');
});

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n${colors.bold}-------------------------------------------------------------------${colors.reset}`);
console.log(`${colors.bold}Results: ${passed} passed, ${failed} failed${colors.reset}`);
console.log(`${colors.bold}-------------------------------------------------------------------${colors.reset}\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}All 2.0 AI Job Match tests passed successfully! 🚀${colors.reset}\n`);
}
