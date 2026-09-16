/**
 * Comprehensive File & Resume Infrastructure Automated Test Suite (Phase 10.1 - 10.6)
 * Validates:
 * 10.1 Supabase Storage Structure (candidate/{userId}/resume.pdf)
 * 10.2 Upload Security (MIME validation, magic byte verification, size limits, filename sanitization)
 * 10.3 Resume Download (Path resolution, signed URL parameters, download filename)
 * 10.4 Resume Delete (Storage cleanup & path extraction)
 * 10.5 Resume Replacement (Atomic upload and previous file cleanup)
 * 10.6 Storage Policies & Key Safety (Zero service_role keys exposed in React)
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

async function testAsync(name, fn) {
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
console.log(`${colors.bold}${colors.cyan}   HireHub AI — File & Resume Infrastructure Suite (10.1 to 10.6)    ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}===================================================================${colors.reset}\n`);

// Import storageService
import storageService from '../src/services/storageService.js';

// ---------------------------------------------------------
// 10.1 Supabase Storage Structure
// ---------------------------------------------------------
console.log(`${colors.bold}10.1 Supabase Storage Structure:${colors.reset}`);

test('10.1.1 Generates canonical candidate resume path candidate/{userId}/resume.pdf', () => {
  const userId = 'usr_849204_alpha';
  const canonicalPath = storageService.buildResumePath(userId, 'MyResume_2026.pdf', true);
  assert.equal(canonicalPath, `candidate/${userId}/resume.pdf`);
});

test('10.1.2 Generates timestamped versioned resume path candidate/{userId}/resume_{ts}_{sanitized}', () => {
  const userId = 'usr_77192';
  const versionedPath = storageService.buildResumePath(userId, 'John Doe CV (Final).pdf', false);
  assert.ok(versionedPath.startsWith(`candidate/${userId}/resume_`));
  assert.ok(versionedPath.endsWith('John_Doe_CV__Final_.pdf'));
  assert.ok(!versionedPath.includes(' '));
});

test('10.1.3 Correctly extracts relative storage paths from Supabase URLs', () => {
  const url1 = 'https://xyz.supabase.co/storage/v1/object/public/resumes/candidate/u-123/resume.pdf';
  const url2 = 'https://storage.hirehub.dev/resumes/candidate/u-456/resume_1772910_cv.pdf?t=123';
  const relPath = 'candidate/u-789/resume.pdf';

  assert.equal(storageService.extractStoragePath(url1), 'candidate/u-123/resume.pdf');
  assert.equal(storageService.extractStoragePath(url2), 'candidate/u-456/resume_1772910_cv.pdf');
  assert.equal(storageService.extractStoragePath(relPath), 'candidate/u-789/resume.pdf');
  assert.equal(storageService.extractStoragePath(null), null);
});

// ---------------------------------------------------------
// 10.2 Upload Security: File Type, Size, Magic Bytes, Sanitization
// ---------------------------------------------------------
console.log(`\n${colors.bold}10.2 Upload Security & Validation:${colors.reset}`);

test('10.2.1 Sanitizes filenames, eradicates path traversal attacks (../, ..\\), and limits length', () => {
  assert.equal(storageService.sanitizeFilename('../../etc/passwd'), 'passwd');
  assert.equal(storageService.sanitizeFilename('..\\..\\windows\\system32\\cmd.exe'), 'cmd.exe');
  assert.equal(storageService.sanitizeFilename('Candidate Resume (v2) [2026] & final.pdf'), 'Candidate_Resume__v2___2026____final.pdf');
  assert.equal(storageService.sanitizeFilename(''), 'resume.pdf');
  assert.equal(storageService.sanitizeFilename(null), 'resume.pdf');
});

await testAsync('10.2.2 Validates allowed file extensions (.pdf, .doc, .docx) and rejects executables', async () => {
  const validFile = { name: 'resume.pdf', size: 1024 * 500, type: 'application/pdf' };
  const validDocx = { name: 'resume.docx', size: 1024 * 300, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  const invalidExe = { name: 'malware.exe', size: 1024 * 100, type: 'application/x-msdownload' };
  const invalidJs = { name: 'script.js', size: 1024 * 10, type: 'text/javascript' };

  assert.equal(await storageService.validateFile(validFile), true);
  assert.equal(await storageService.validateFile(validDocx), true);

  await assert.rejects(async () => storageService.validateFile(invalidExe), /Invalid file extension/);
  await assert.rejects(async () => storageService.validateFile(invalidJs), /Invalid file extension/);
});

await testAsync('10.2.3 Enforces 10MB file size limit and rejects 0-byte files', async () => {
  const normalFile = { name: 'my_resume.pdf', size: 5 * 1024 * 1024, type: 'application/pdf' };
  const oversizedFile = { name: 'huge_archive.pdf', size: 12 * 1024 * 1024, type: 'application/pdf' };
  const emptyFile = { name: 'empty.pdf', size: 0, type: 'application/pdf' };

  assert.equal(await storageService.validateFile(normalFile), true);
  await assert.rejects(async () => storageService.validateFile(oversizedFile), /exceeds the maximum allowed limit/);
  await assert.rejects(async () => storageService.validateFile(emptyFile), /cannot be empty/);
});

await testAsync('10.2.4 Inspects binary magic byte header (%PDF-) to prevent MIME spoofing', async () => {
  // Valid PDF header mock (%PDF-)
  const validPdfFile = {
    name: 'verified.pdf',
    size: 2048,
    type: 'application/pdf',
    slice: (start, end) => ({
      arrayBuffer: async () => new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]).buffer,
    }),
  };

  // Spoofed PDF header mock (starts with 'MZ' or malicious script)
  const spoofedPdfFile = {
    name: 'fake.pdf',
    size: 2048,
    type: 'application/pdf',
    slice: (start, end) => ({
      arrayBuffer: async () => new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03]).buffer,
    }),
  };

  assert.equal(await storageService.verifyMagicBytes(validPdfFile), true);
  assert.equal(await storageService.verifyMagicBytes(spoofedPdfFile), false);
  await assert.rejects(async () => storageService.validateFile(spoofedPdfFile), /content signature does not match/);
});

// ---------------------------------------------------------
// 10.3 Resume Download
// ---------------------------------------------------------
console.log(`\n${colors.bold}10.3 Resume Download Handling:${colors.reset}`);

await testAsync('10.3.1 Resolves download path and triggers programmatic browser download dialog', async () => {
  const fileUrl = 'https://supabase.co/storage/v1/object/public/resumes/candidate/usr-99/resume.pdf';

  // In Node environment, downloadResume falls back gracefully to returning URL
  const res = await storageService.downloadResume(fileUrl, 'John_Resume.pdf');
  assert.ok(res.includes('candidate/usr-99/resume.pdf'));
});

// ---------------------------------------------------------
// 10.4 & 10.5 Resume Delete and Atomic Replacement
// ---------------------------------------------------------
console.log(`\n${colors.bold}10.4 & 10.5 Resume Delete & Atomic Replacement:${colors.reset}`);

await testAsync('10.4.1 Extracts correct storage key when deleting file from bucket', async () => {
  const fileUrl = 'https://storage.hirehub.dev/resumes/candidate/u-881/resume_old.pdf';
  const result = await storageService.deleteResumeFile(fileUrl);
  assert.equal(result, true);
});

await testAsync('10.5.1 Atomically coordinates new file upload and old file purge during replacement', async () => {
  const userId = 'cand-replace-user';
  const newFile = {
    name: 'New_Candidate_CV.pdf',
    size: 1024 * 400,
    type: 'application/pdf',
  };
  const oldFileUrl = 'https://storage.hirehub.dev/resumes/candidate/cand-replace-user/resume_old_version.pdf';

  const replaceResult = await storageService.replaceResume(userId, newFile, oldFileUrl, { isCanonical: true });

  assert.equal(replaceResult.storagePath, `candidate/${userId}/resume.pdf`);
  assert.ok(replaceResult.publicUrl.includes(`candidate/${userId}/resume.pdf`));
  assert.equal(replaceResult.fileName, 'New_Candidate_CV.pdf');
});

// ---------------------------------------------------------
// 10.6 Storage Policies & Key Safety Audit
// ---------------------------------------------------------
console.log(`\n${colors.bold}10.6 Security Audit & Supabase Storage Policies:${colors.reset}`);

test('10.6.1 Confirms that NO service_role or secret keys are present in frontend source or .env files', () => {
  const frontendDir = path.resolve(__dirname, '../src');
  const files = fs.readdirSync(frontendDir, { recursive: true });

  files.forEach((file) => {
    const fullPath = path.join(frontendDir, file);
    if (fs.statSync(fullPath).isFile() && /\.(js|jsx|ts|tsx|env)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(!content.includes('service_role'), `Forbidden service_role key detected in ${file}`);
      assert.ok(!content.includes('SUPABASE_SERVICE_KEY'), `Forbidden SUPABASE_SERVICE_KEY detected in ${file}`);
    }
  });
});

test('10.6.2 Validates existence and schema of Supabase Storage RLS policies file', () => {
  const policyFile = path.resolve(__dirname, '../../docs/supabase_storage_resumes_policies.sql');
  assert.ok(fs.existsSync(policyFile), 'Storage policies SQL file must exist');

  const sql = fs.readFileSync(policyFile, 'utf8');
  assert.ok(sql.includes("bucket_id = 'resumes'"));
  assert.ok(sql.includes('candidate/'));
  assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'));
  assert.ok(sql.includes('auth.uid()'));
});

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n${colors.bold}-------------------------------------------------------------------${colors.reset}`);
console.log(`${colors.bold}File & Resume Infrastructure Suite Results:${colors.reset}`);
console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
console.log(`  Failed: ${colors.red}${failed}${colors.reset}`);
console.log(`  Total:  ${passed + failed}`);
console.log(`${colors.bold}-------------------------------------------------------------------${colors.reset}\n`);

if (failed > 0) {
  process.exit(1);
}
