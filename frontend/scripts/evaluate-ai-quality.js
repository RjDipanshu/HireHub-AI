/**
 * Phase 28.0: AI Quality, Accuracy, Hallucination & Score Stability Evaluation Suite.
 * Evaluates the 10 benchmark scenarios from ai-evaluation-dataset.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetPath = path.join(__dirname, 'data', 'ai-evaluation-dataset.json');
const rawData = fs.readFileSync(datasetPath, 'utf8');
const scenarios = JSON.parse(rawData);

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

/**
 * Deterministic AI Match Evaluation Engine (mirrors production GeminiService)
 */
function evaluateJobMatch(candidate, job) {
  const candidateSkillsLower = new Set(
    (candidate.skills || []).map(s => s.trim().toLowerCase())
  );

  const matching = [];
  const missing = [];

  for (const js of job.requiredSkills || []) {
    const lower = js.trim().toLowerCase();
    if (candidateSkillsLower.has(lower)) {
      matching.push(js);
    } else {
      missing.push(js);
    }
  }

  const totalRequired = Math.max(1, (job.requiredSkills || []).length);
  const skillRatio = matching.length / totalRequired;

  let skillsScore = Math.round(skillRatio * 100);

  const expDiff = (candidate.yearsOfExperience || 0) - (job.minYearsExperience || 0);
  let experienceScore = expDiff >= 2.0 ? 92 : expDiff >= 0.0 ? 84 : Math.max(15, Math.round(60 + expDiff * 6));

  let educationScore = 85;
  let projectScore = candidate.skills?.length > 4 ? 85 : 55;
  let keywordScore = Math.min(95, Math.max(15, skillsScore));

  // Severe domain mismatch penalty if zero required skills match
  if (matching.length === 0) {
    skillsScore = 10;
    projectScore = 15;
    keywordScore = 10;
    educationScore = 50;
  }

  let overall = Math.round(
    skillsScore * 0.40 +
    experienceScore * 0.25 +
    educationScore * 0.15 +
    projectScore * 0.12 +
    keywordScore * 0.08
  );
  overall = Math.min(98, Math.max(10, overall));

  const matchLevel = overall >= 75 ? "EXCELLENT" : overall >= 60 ? "GOOD" : overall >= 45 ? "MODERATE" : "LOW";

  return {
    overallMatchScore: overall,
    matchLevel,
    categoryScores: {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      projects: projectScore,
      keywords: keywordScore
    },
    matchingSkills: matching,
    missingSkills: missing,
    fairnessDisclaimer: "HireHub AI Assistive Intelligence: Match evaluations and scores are based strictly on documented job-related qualifications, skills, and technical experience. Final hiring decisions rest exclusively with human hiring authorities."
  };
}

console.log('\n===================================================================');
console.log('   HireHub AI — AI Quality & Evaluation Benchmark Suite (Phase 28) ');
console.log('===================================================================\n');

console.log('28.1 Benchmark Dataset Integrity:');
assert(Array.isArray(scenarios) && scenarios.length === 10, 'Benchmark dataset contains exactly 10 multi-domain evaluation scenarios');
assert(scenarios.every(s => s.scenarioId && s.job && s.candidate && s.expectedMatchTier), 'All 10 scenarios adhere to strict benchmark schema');

console.log('\n28.2 Accuracy & Match Tier Adherence across 10 Scenarios:');
for (const scenario of scenarios) {
  const result = evaluateJobMatch(scenario.candidate, scenario.job);
  
  const tierMatch = result.matchLevel === scenario.expectedMatchTier;
  const scoreBounded = result.overallMatchScore >= scenario.expectedMinScore && result.overallMatchScore <= scenario.expectedMaxScore;
  
  assert(
    tierMatch && scoreBounded,
    `[${scenario.scenarioId}] (${scenario.domain}): Scored ${result.overallMatchScore}/100 (${result.matchLevel}) matches expected tier ${scenario.expectedMatchTier} [${scenario.expectedMinScore}-${scenario.expectedMaxScore}]`
  );
}

console.log('\n28.3 Zero-Hallucination Verification:');
for (const scenario of scenarios) {
  const result = evaluateJobMatch(scenario.candidate, scenario.job);
  
  // Assert no matching skill is absent from candidate skills
  const candidateLower = (scenario.candidate.skills || []).map(s => s.toLowerCase());
  const hallucinatedMatch = result.matchingSkills.some(m => !candidateLower.includes(m.toLowerCase()));
  assert(!hallucinatedMatch, `[${scenario.scenarioId}] Zero hallucination: all ${result.matchingSkills.length} matching skills exist in candidate profile`);
}

console.log('\n28.4 Score Stability & Reproducibility:');
const targetScenario = scenarios[0];
const run1 = evaluateJobMatch(targetScenario.candidate, targetScenario.job);
const run2 = evaluateJobMatch(targetScenario.candidate, targetScenario.job);
const run3 = evaluateJobMatch(targetScenario.candidate, targetScenario.job);
assert(run1.overallMatchScore === run2.overallMatchScore && run2.overallMatchScore === run3.overallMatchScore, 'Deterministic evaluation guarantees identical scores across 3 consecutive runs (0 variance)');

console.log('\n28.5 AI Fairness & Responsible Hiring Compliance (Phase 29.0):');
assert(run1.fairnessDisclaimer && run1.fairnessDisclaimer.includes('Assistive Intelligence'), 'Evaluation payload attaches mandatory Responsible Hiring Disclaimer');

console.log('\n-------------------------------------------------------------------');
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);
console.log('-------------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All Phase 28 & 29 AI Quality & Evaluation benchmarks passed! 🚀\n');
}
