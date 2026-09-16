# AI Architecture & Governance — HireHub AI

HireHub AI integrates the **Google Gemini Generative AI Platform** with PostgreSQL **`pgvector`** to deliver production-grade recruitment intelligence, semantic discovery, and automated evaluation.

---

## 1. AI Feature Matrix

```
┌─────────────────────────┬──────────────────────┬──────────────────────────────────┐
│ Feature                 │ Model Used           │ Primary Output / Dimension       │
├─────────────────────────┼──────────────────────┼──────────────────────────────────┤
│ AI Resume Analyzer (1.0)│ gemini-1.5-flash     │ 5-category ATS Score (0-100)     │
│ AI Job Match (2.0)      │ gemini-1.5-flash     │ Fit percentage + 5 category bars │
│ Semantic Search (11-13) │ text-embedding-004   │ 768-dim normalized vector space  │
│ Cover Letter Generator  │ gemini-1.5-flash     │ Multi-tone personalized letter   │
│ Interview Prep Coach    │ gemini-1.5-flash     │ STAR-method behavioral coaching  │
└─────────────────────────┴──────────────────────┴──────────────────────────────────┘
```

---

## 2. Vector Embeddings & Semantic Search Architecture

### 2.1 Embedding Generation Pipeline
1. Candidate or recruiter enters free-form natural language query (e.g. *"Find backend roles involving scalable distributed systems and cloud technologies"*).
2. Input is scrubbed of PII and demographic attributes.
3. `GeminiService.generateEmbedding` calls `text-embedding-004:embedContent`, returning a 768-dimensional float array.
4. If the Gemini API is offline or quota-limited, the system seamlessly triggers `generateDeterministicVector`, performing localized token-hash projections.
5. All vectors undergo L2 normalization such that $\sum v_i^2 \approx 1.0$.

### 2.2 Cosine Distance Computation
Cosine similarity between query vector $Q$ and corpus vector $C$ is computed in normalized space:
$$\text{Similarity}(Q, C) = \frac{Q \cdot C}{\|Q\| \|C\|}$$
Results are filtered by threshold ($\ge 0.20$), sorted descending, and returned with custom semantic match rationales.

---

## 3. Strict Anti-Hallucination Guardrails

To prevent LLM confabulation, all Gemini prompts are bound by strict negative constraints:

```
CRITICAL ANTI-HALLUCINATION RULE:
DO NOT INVENT, ASSUME, OR HALLUCINATE CANDIDATE SKILLS, WORK EXPERIENCE, OR METRICS.
If a required technology or qualification is not explicitly mentioned in the candidate context,
treat it as NOT IDENTIFIED and missing. Do not claim the candidate has experience unless documented.
```

If a technology is not present in the candidate's resume or verified profile, it is strictly placed in `missingSkills` rather than hallucinated.

---

## 4. AI Quality & Evaluation Benchmark Suite (Phase 28.0)

HireHub AI features an automated continuous evaluation test suite (`npm run test:ai-evaluation`) running against `ai-evaluation-dataset.json`:
- **10 Realistic Evaluation Scenarios**: Full-stack, DevOps, Frontend, Python-to-Java cross-stack, Junior vs Staff mismatch, Data vs Mobile domain mismatch, Flutter, DevSecOps, Engineering Leadership, and QA Automation.
- **Automated Assertions**:
  - **Accuracy & Tier Adherence**: Asserts candidate match scores land within expected boundaries.
  - **Zero-Hallucination Verification**: Asserts $100\%$ of detected matching skills exist in the candidate's profile.
  - **Score Stability**: Proves zero variance across repeated runs.
  - **Fairness Compliance**: Confirms presence of mandatory responsible hiring disclaimers.

---

## 5. Responsible Hiring & AI Fairness Charter (Phase 29.0)

HireHub AI strictly adheres to fair hiring practices and the EU AI Act High-Risk AI Employment guidelines:
1. **No Protected Characteristics**: The AI evaluation pipeline explicitly strips and never evaluates candidates based on Age, Gender, Religion, Race, Disability, or Marital Status.
2. **Merit-Based Assessment**: Ranking algorithms evaluate solely documented skills, technical experience, projects, and educational requirements.
3. **Assistive Decision-Support**: AI output is explicitly labeled as assistive intelligence to empower human recruiters, rather than automated decision-making.
