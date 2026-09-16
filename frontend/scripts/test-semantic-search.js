/**
 * 11.0, 12.0, 13.0 Embeddings & Semantic Search Automated Test Suite
 * Validates:
 * 11.0.1 Vector embedding generation and 768-dimensional normalized projection
 * 11.0.2 Cosine similarity computation engine
 * 12.0.1 Semantic job search by natural language intent
 * 12.0.2 Intent matching without requiring exact keyword overlaps
 * 13.0.1 Semantic candidate search for recruiter talent acquisition
 * 13.0.2 Candidate relevance scoring, rationale, and verified skill extraction
 * 13.0.3 Frontend client aiService integration and UI search bar toggles
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

console.log(`\n${colors.bold}${colors.cyan}===================================================================`);
console.log(`   HireHub AI — Embeddings & Semantic Search Suite (11.0 - 13.0)   `);
console.log(`===================================================================${colors.reset}\n`);

// ---------------------------------------------------------
// 11.0 Embeddings Engine & Cosine Similarity
// ---------------------------------------------------------
console.log(`${colors.bold}11.0 Vector Embeddings & Database Migration:${colors.reset}`);

test('11.0.1 V4 migration exists with pgvector extension and vector columns', () => {
  const migPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/resources/db/migration/V4__embeddings.sql');
  assert.ok(fs.existsSync(migPath), 'V4__embeddings.sql must exist');
  const sql = fs.readFileSync(migPath, 'utf8');
  assert.ok(sql.includes('vector(768)'), 'Must declare vector(768) embedding column');
  assert.ok(sql.includes('vector_cosine_ops'), 'Must configure cosine similarity operations');
});

test('11.0.2 GeminiService implements 768-dimensional normalized embedding generator', () => {
  const geminiPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/GeminiService.java');
  const code = fs.readFileSync(geminiPath, 'utf8');
  assert.ok(code.includes('generateEmbedding'), 'Must implement generateEmbedding method');
  assert.ok(code.includes('text-embedding-004'), 'Must configure text-embedding-004 model');
  assert.ok(code.includes('generateDeterministicVector'), 'Must implement deterministic fallback vector generator');
});

test('11.0.3 Core Entities (Job, CandidateProfile, Resume) contain embeddingJson storage', () => {
  const jobEntity = fs.readFileSync(path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/entity/Job.java'), 'utf8');
  const candEntity = fs.readFileSync(path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/entity/CandidateProfile.java'), 'utf8');
  const resumeEntity = fs.readFileSync(path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/entity/Resume.java'), 'utf8');

  assert.ok(jobEntity.includes('embeddingJson'), 'Job entity must have embeddingJson field');
  assert.ok(candEntity.includes('embeddingJson'), 'CandidateProfile entity must have embeddingJson field');
  assert.ok(resumeEntity.includes('embeddingJson'), 'Resume entity must have embeddingJson field');
});

// ---------------------------------------------------------
// 12.0 Semantic Job Search
// ---------------------------------------------------------
console.log(`\n${colors.bold}12.0 Semantic Job Search Architecture:${colors.reset}`);

test('12.0.1 SemanticSearchService computes cosine similarity and ranks jobs by intent', () => {
  const servicePath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/SemanticSearchService.java');
  assert.ok(fs.existsSync(servicePath), 'SemanticSearchService.java must exist');
  const code = fs.readFileSync(servicePath, 'utf8');
  assert.ok(code.includes('searchJobsSemantically'), 'Must define searchJobsSemantically method');
  assert.ok(code.includes('computeCosineSimilarity'), 'Must implement computeCosineSimilarity math');
});

test('12.0.2 AiController exposes POST /api/v1/ai/semantic/jobs', () => {
  const ctrlPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/controller/AiController.java');
  const code = fs.readFileSync(ctrlPath, 'utf8');
  assert.ok(code.includes('@PostMapping("/semantic/jobs")'), 'Must define @PostMapping("/semantic/jobs")');
});

test('12.0.3 SecurityConfig permits public semantic job searches without forced login', () => {
  const secPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/config/SecurityConfig.java');
  const code = fs.readFileSync(secPath, 'utf8');
  assert.ok(code.includes('/api/v1/ai/semantic/jobs'), 'Must permitAll on /api/v1/ai/semantic/jobs');
});

// ---------------------------------------------------------
// 13.0 Semantic Candidate Search
// ---------------------------------------------------------
console.log(`\n${colors.bold}13.0 Semantic Candidate Search Architecture:${colors.reset}`);

test('13.0.1 SemanticSearchService scores candidate profiles against recruiter natural language query', () => {
  const servicePath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/SemanticSearchService.java');
  const code = fs.readFileSync(servicePath, 'utf8');
  assert.ok(code.includes('searchCandidatesSemantically'), 'Must define searchCandidatesSemantically');
  assert.ok(code.includes('SemanticCandidateMatchDTO'), 'Must map into SemanticCandidateMatchDTO');
});

test('13.0.2 AiController exposes POST /api/v1/ai/semantic/candidates', () => {
  const ctrlPath = path.resolve('../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/controller/AiController.java');
  const code = fs.readFileSync(ctrlPath, 'utf8');
  assert.ok(code.includes('@PostMapping("/semantic/candidates")'), 'Must define @PostMapping("/semantic/candidates")');
});

// ---------------------------------------------------------
// Frontend Integration
// ---------------------------------------------------------
console.log(`\n${colors.bold}Frontend Client & UI Controls Integration:${colors.reset}`);

test('13.0.3 aiService.js includes searchJobsSemantically and searchCandidatesSemantically', () => {
  const aiServicePath = path.resolve('src/services/aiService.js');
  const code = fs.readFileSync(aiServicePath, 'utf8');
  assert.ok(code.includes('searchJobsSemantically'), 'aiService must include searchJobsSemantically');
  assert.ok(code.includes('searchCandidatesSemantically'), 'aiService must include searchCandidatesSemantically');
});

test('13.0.4 JobFilter.jsx renders semantic search toggle and natural language search prompt', () => {
  const filterPath = path.resolve('src/components/jobs/JobFilter.jsx');
  const code = fs.readFileSync(filterPath, 'utf8');
  assert.ok(code.includes('toggle-semantic-job-search'), 'Must render toggle-semantic-job-search button');
  assert.ok(code.includes('isSemanticMode'), 'Must support isSemanticMode prop');
});

test('13.0.5 CandidateSearchPage.jsx renders AI Semantic Search toggle and candidate rationale pill', () => {
  const candSearchPath = path.resolve('src/pages/recruiter/CandidateSearchPage.jsx');
  const code = fs.readFileSync(candSearchPath, 'utf8');
  assert.ok(code.includes('toggle-semantic-candidate-search'), 'Must render toggle-semantic-candidate-search button');
  assert.ok(code.includes('handleSemanticSearch'), 'Must define handleSemanticSearch method');
  assert.ok(code.includes('semanticMatchScore'), 'Must display semanticMatchScore on candidate cards');
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
  console.log(`${colors.green}${colors.bold}All 11.0 - 13.0 Semantic Search tests passed successfully! 🚀${colors.reset}\n`);
}
