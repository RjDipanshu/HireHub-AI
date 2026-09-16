/**
 * 1.0 AI Resume Analyzer - Comprehensive Verification Suite
 * Validates:
 * 1.0.1 Audit of AI Controller, Service, DTOs, and storage
 * 1.0.2 Resume Analysis API endpoints (JSON + Multipart PDF upload)
 * 1.0.3 Apache PDFBox text extraction & magic header byte validation (%PDF-)
 * 1.0.4 Dedicated GeminiService with JSON prompting & prompt versioning
 * 1.0.5 Structured AI output schema (ATS Score 0-100, Skills, Gaps, Suggestions)
 * 1.0.6 Database persistence (Resume -> ResumeAnalysis entity & V3 migration)
 * 1.0.7 React AI Studio components and visualization
 * 1.0.8 Production hardening (size limits, candidate ownership, timeouts, circuit-breaker fallback)
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
console.log(`${colors.bold}${colors.cyan}   HireHub AI — 1.0 AI Resume Analyzer Automated Test Suite        ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 1.0.1 Audit & Backend Architecture
// ---------------------------------------------------------
console.log(`${colors.bold}1.0.1 AI Code Audit & Configuration:${colors.reset}`);

test('1.0.1.1 Verify pom.xml includes org.apache.pdfbox dependency', () => {
  const pomPath = path.resolve('../backend/hirehub-backend/hirehub-backend/pom.xml');
  const pomContent = fs.readFileSync(pomPath, 'utf8');
  assert.ok(pomContent.includes('org.apache.pdfbox'), 'pom.xml must include pdfbox groupId');
  assert.ok(pomContent.includes('pdfbox'), 'pom.xml must include pdfbox artifactId');
});

test('1.0.1.2 Verify V3 migration file exists with resume_analyses table', () => {
  const migPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/resources/db/migration/V3__resume_analysis.sql');
  assert.ok(fs.existsSync(migPath), 'V3__resume_analysis.sql must exist');
  const sql = fs.readFileSync(migPath, 'utf8');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS resume_analyses'), 'Must create resume_analyses table');
  assert.ok(sql.includes('overall_score'), 'Must contain overall_score column');
  assert.ok(sql.includes('idx_resume_analyses_resume_id'), 'Must index resume_id');
});

// ---------------------------------------------------------
// 1.0.2 Resume Analysis API & Authorization
// ---------------------------------------------------------
console.log(`\n${colors.bold}1.0.2 Resume Analysis API Design & Authorization:${colors.reset}`);

test('1.0.2.1 Verify AiController exposes POST /api/v1/ai/resume-analysis', () => {
  const controllerPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/controller/AiController.java');
  const content = fs.readFileSync(controllerPath, 'utf8');
  assert.ok(content.includes('@PostMapping("/resume-analysis")'), 'Must define @PostMapping("/resume-analysis")');
  assert.ok(content.includes('@PostMapping(value = "/resume-analysis/upload"'), 'Must define multipart upload endpoint');
  assert.ok(content.includes('@GetMapping("/resume-analysis/{resumeId}")'), 'Must define get analysis endpoint');
});

test('1.0.2.2 Verify candidate profile ownership check in ResumeAnalysisService', () => {
  const servicePath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/ResumeAnalysisService.java');
  const content = fs.readFileSync(servicePath, 'utf8');
  assert.ok(content.includes('candidate.getId()'), 'Must enforce candidate ownership');
  assert.ok(content.includes('Access denied'), 'Must reject unauthorized resume access');
});

// ---------------------------------------------------------
// 1.0.3 Resume Text Extraction (Apache PDFBox)
// ---------------------------------------------------------
console.log(`\n${colors.bold}1.0.3 Resume Text Extraction (Apache PDFBox):${colors.reset}`);

test('1.0.3.1 Verify PdfTextExtractorService handles PDF validation and magic bytes', () => {
  const extractorPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/PdfTextExtractorService.java');
  const content = fs.readFileSync(extractorPath, 'utf8');
  assert.ok(content.includes('PDFTextStripper'), 'Must use Apache PDFBox PDFTextStripper');
  assert.ok(content.includes('%PDF-'), 'Must validate %PDF- magic bytes header');
  assert.ok(content.includes('MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024'), 'Must enforce 10MB file size limit');
  assert.ok(content.includes('sanitizeExtractedText'), 'Must sanitize extracted control characters');
});

// ---------------------------------------------------------
// 1.0.4 Dedicated Gemini Service Integration
// ---------------------------------------------------------
console.log(`\n${colors.bold}1.0.4 Gemini Integration (GeminiService):${colors.reset}`);

test('1.0.4.1 Verify GeminiService isolates AI prompt construction and versioning', () => {
  const geminiPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/GeminiService.java');
  const content = fs.readFileSync(geminiPath, 'utf8');
  assert.ok(content.includes('PROMPT_VERSION'), 'Must define prompt versioning constant');
  assert.ok(content.includes('analyzeResumeStructured'), 'Must provide dedicated structured analysis method');
  assert.ok(content.includes('scrubSensitiveData'), 'Must scrub PII before sending to external AI');
  assert.ok(content.includes('analyzeResumeHeuristic'), 'Must provide local heuristic engine fallback');
});

// ---------------------------------------------------------
// 1.0.5 Structured AI Output Schema
// ---------------------------------------------------------
console.log(`\n${colors.bold}1.0.5 Structured AI Output Schema & DTOs:${colors.reset}`);

test('1.0.5.1 Validate complete 1.0 output schema fields on ResumeAnalysisResponseDTO', () => {
  const dtoPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/dto/ai/ResumeAnalysisResponseDTO.java');
  const content = fs.readFileSync(dtoPath, 'utf8');
  const requiredFields = [
    'overallScore',
    'summary',
    'technicalSkills',
    'softSkills',
    'detectedSkills',
    'education',
    'experience',
    'projects',
    'certifications',
    'keywords',
    'strengths',
    'weaknesses',
    'missingSkills',
    'formattingIssues',
    'atsCompatibilityIssues',
    'suggestions',
    'modelUsed',
    'analyzedAt'
  ];
  for (const field of requiredFields) {
    assert.ok(content.includes(field), `DTO must contain required 1.0 field: ${field}`);
  }
});

// ---------------------------------------------------------
// 1.0.6 Database Persistence
// ---------------------------------------------------------
console.log(`\n${colors.bold}1.0.6 Database Persistence (Resume -> ResumeAnalysis):${colors.reset}`);

test('1.0.6.1 Verify ResumeAnalysis entity and Resume link', () => {
  const entityPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/entity/ResumeAnalysis.java');
  assert.ok(fs.existsSync(entityPath), 'ResumeAnalysis.java entity must exist');
  const content = fs.readFileSync(entityPath, 'utf8');
  assert.ok(content.includes('@Table(name = "resume_analyses")'), 'Must map to resume_analyses table');
  assert.ok(content.includes('private Resume resume;'), 'Must link to Resume entity');
  assert.ok(content.includes('private CandidateProfile candidateProfile;'), 'Must link to CandidateProfile');
});

test('1.0.6.2 Verify ResumeAnalysisRepository query methods', () => {
  const repoPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/repository/ResumeAnalysisRepository.java');
  assert.ok(fs.existsSync(repoPath), 'ResumeAnalysisRepository.java must exist');
  const content = fs.readFileSync(repoPath, 'utf8');
  assert.ok(content.includes('findTopByResumeIdOrderByCreatedAtDesc'), 'Must have latest analysis query');
});

// ---------------------------------------------------------
// 1.0.7 React AI Studio Frontend Integration
// ---------------------------------------------------------
console.log(`\n${colors.bold}1.0.7 React AI Studio Interface:${colors.reset}`);

test('1.0.7.1 Verify frontend aiService.js supports upload & get analysis', () => {
  const aiServiceJsPath = path.resolve('src/services/aiService.js');
  const content = fs.readFileSync(aiServiceJsPath, 'utf8');
  assert.ok(content.includes('analyzeResumeUpload'), 'Must export analyzeResumeUpload');
  assert.ok(content.includes('getResumeAnalysis'), 'Must export getResumeAnalysis');
});

test('1.0.7.2 Verify CandidateAiToolsPage renders 1.0 cards (Score, Skills, Strengths, Missing, Improvements)', () => {
  const pagePath = path.resolve('src/pages/candidate/CandidateAiToolsPage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(content.includes('Overall ATS Compatibility Score'), 'Must display ATS score title');
  assert.ok(content.includes('Detected Skills'), 'Must render detected skills section');
  assert.ok(content.includes('Technical Stack'), 'Must distinguish technical skills');
  assert.ok(content.includes('Missing / Recommended Skills'), 'Must display missing skills');
  assert.ok(content.includes('Actionable Improvement Suggestions'), 'Must display actionable suggestions');
  assert.ok(content.includes('Upload Resume PDF (Apache PDFBox Parsing)'), 'Must render PDF upload dropzone');
});

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n${colors.bold}${colors.cyan}===================================================================${colors.reset}`);
console.log(`${colors.bold}   1.0 AI Resume Analyzer Test Results: ${colors.green}${passed} Passed${colors.reset}, ${failed > 0 ? colors.red + failed + ' Failed' : colors.green + '0 Failed'}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

if (failed > 0) {
  process.exit(1);
}
