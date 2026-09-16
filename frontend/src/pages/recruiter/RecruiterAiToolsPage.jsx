import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Sparkles,
  FileText,
  Users,
  TrendingUp,
  Briefcase,
  Copy,
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  Clock,
  Award,
} from 'lucide-react';

export const RecruiterAiToolsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('JD_GEN');

  // Tool 1: JD Generator State
  const [jdForm, setJdForm] = useState({
    title: 'Senior Full Stack Engineer',
    experienceLevel: 'SENIOR_LEVEL',
    industry: 'Software Development',
    keySkills: 'React, Java, Spring Boot, AWS, PostgreSQL',
  });
  const [jdGenerating, setJdGenerating] = useState(false);
  const [generatedJd, setGeneratedJd] = useState(null);
  const [copiedJd, setCopiedJd] = useState(false);

  // Tool 2: Candidate Matcher State
  const [matchForm, setMatchForm] = useState({
    roleRequirements: 'Looking for a Senior Backend Engineer with 5+ years Java and cloud microservices.',
    candidateBackground: '6 years developing Java / Spring Boot distributed microservices deployed on AWS EC2 & Docker.',
  });
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Tool 3: Market Insights State
  const [insightRole, setInsightRole] = useState('Senior Full Stack Engineer');
  const [insightLocation, setInsightLocation] = useState('Bengaluru, India (Hybrid/Remote)');
  const [insightLoading, setInsightLoading] = useState(false);
  const [marketInsights, setMarketInsights] = useState(null);

  // JD Gen Handler
  const handleGenerateJd = async (e) => {
    e.preventDefault();
    setJdGenerating(true);
    setCopiedJd(false);

    try {
      const skillsArr = jdForm.keySkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await aiService.generateJobDescription({
        title: jdForm.title,
        experienceLevel: jdForm.experienceLevel,
        industry: jdForm.industry,
        keySkills: skillsArr,
      });

      if (res?.description) {
        setGeneratedJd({
          description: res.description,
          suggestedSkills: res.suggestedSkills || skillsArr,
        });
      } else {
        // Fallback JD
        setGeneratedJd({
          description: `About the Role:\nWe are seeking a talented ${jdForm.title} (${jdForm.experienceLevel.replace('_', ' ')}) to architect scalable web systems and mentor engineers.\n\nKey Responsibilities:\n• Deliver clean, test-driven production code across our modern tech stack\n• Partner closely with Product and Design teams to craft intuitive user experiences\n• Optimize latency, throughput, and system security in cloud environments\n\nRequirements:\n• 4+ years of professional engineering experience\n• Proficiency in ${jdForm.keySkills}\n• Strong team collaboration and problem-solving mindset`,
          suggestedSkills: skillsArr,
        });
      }
    } catch (err) {
      setGeneratedJd({
        description: `About the Role:\nWe are seeking a talented ${jdForm.title} (${jdForm.experienceLevel.replace('_', ' ')}) to architect scalable web systems.\n\nKey Responsibilities:\n• Deliver clean, test-driven production code across our modern tech stack\n• Optimize latency, throughput, and system security in cloud environments\n\nRequirements:\n• Proven experience in ${jdForm.keySkills}`,
        suggestedSkills: jdForm.keySkills.split(',').map((s) => s.trim()),
      });
    } finally {
      setJdGenerating(false);
    }
  };

  const handleCopyJd = () => {
    if (!generatedJd?.description) return;
    navigator.clipboard.writeText(generatedJd.description);
    setCopiedJd(true);
    setTimeout(() => setCopiedJd(false), 3000);
  };

  // Matcher Handler
  const handleRunMatch = async (e) => {
    e.preventDefault();
    setMatching(true);
    try {
      const res = await aiService.matchCandidate(matchForm.roleRequirements, matchForm.candidateBackground);
      setMatchResult(res);
    } catch (err) {
      console.warn('Match note:', err);
    } finally {
      setMatching(false);
    }
  };

  // Market Insights Handler
  const handleFetchInsights = async (e) => {
    e.preventDefault();
    setInsightLoading(true);
    try {
      const res = await aiService.getHiringInsights(insightRole, insightLocation);
      setMarketInsights(res);
    } catch (err) {
      console.warn('Insights note:', err);
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card card-ai" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-ai">Gemini AI Intelligence</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)' }}>Enterprise Edition</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', margin: '0.25rem 0' }}>Recruiter AI Talent Studio</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Accelerate your recruitment cycle: synthesize bias-free job descriptions, simulate candidate fit scores, and benchmark market compensation.
        </p>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'JD_GEN', label: 'AI Job Description Studio', icon: FileText },
          { id: 'MATCHER', label: 'Candidate Fit & Scoring', icon: Users },
          { id: 'INSIGHTS', label: 'Hiring Market Insights', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${active ? 'btn-ai' : 'btn-outline'}`}
              style={{
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool 1: AI Job Description Studio */}
      {activeTab === 'JD_GEN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Form */}
          <form onSubmit={handleGenerateJd} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} color="var(--primary-400)" /> Role Specifications
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Target Job Title *</label>
              <input
                type="text"
                className="input"
                required
                value={jdForm.title}
                onChange={(e) => setJdForm({ ...jdForm, title: e.target.value })}
                placeholder="e.g. Lead DevOps & Cloud Architect"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Seniority Level</label>
                <select
                  className="input"
                  value={jdForm.experienceLevel}
                  onChange={(e) => setJdForm({ ...jdForm, experienceLevel: e.target.value })}
                >
                  <option value="ENTRY_LEVEL">Entry Level</option>
                  <option value="MID_LEVEL">Mid Level</option>
                  <option value="SENIOR_LEVEL">Senior Level</option>
                  <option value="LEAD">Staff / Principal / Lead</option>
                  <option value="EXECUTIVE">Executive / VP</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Industry Domain</label>
                <input
                  type="text"
                  className="input"
                  value={jdForm.industry}
                  onChange={(e) => setJdForm({ ...jdForm, industry: e.target.value })}
                  placeholder="e.g. Fintech, SaaS, HealthTech"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Key Required Skills (Comma-separated)</label>
              <input
                type="text"
                className="input"
                value={jdForm.keySkills}
                onChange={(e) => setJdForm({ ...jdForm, keySkills: e.target.value })}
                placeholder="e.g. Kubernetes, Terraform, Go, AWS, CI/CD"
              />
            </div>

            <button
              type="submit"
              disabled={jdGenerating}
              className="btn btn-ai"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <Sparkles size={16} />
              {jdGenerating ? 'Generating Comprehensive JD...' : 'Generate with Gemini AI'}
            </button>
          </form>

          {/* Output Display */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI-Crafted Description</h3>
              {generatedJd && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleCopyJd}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {copiedJd ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                    {copiedJd ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => navigate('/recruiter/jobs/new')}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    Use in New Job <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {jdGenerating ? (
              <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <LoadingSpinner label="Gemini AI is drafting an inclusive, compelling job description..." size="md" />
              </div>
            ) : generatedJd ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {generatedJd.suggestedSkills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {generatedJd.suggestedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.2rem 0.6rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--primary-400)',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {generatedJd.description}
                </div>
              </div>
            ) : (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <p>Fill out the specifications on the left to generate an engaging, market-ready job description.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 2: Candidate Fit & Scoring */}
      {activeTab === 'MATCHER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleRunMatch} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={18} color="var(--primary-400)" /> Role & Candidate Matching
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Job Requirements / Skills Profile</label>
              <textarea
                className="input"
                rows={4}
                required
                value={matchForm.roleRequirements}
                onChange={(e) => setMatchForm({ ...matchForm, roleRequirements: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Candidate Background / Resume Extract</label>
              <textarea
                className="input"
                rows={5}
                required
                value={matchForm.candidateBackground}
                onChange={(e) => setMatchForm({ ...matchForm, candidateBackground: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={matching}
              className="btn btn-ai"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} />
              {matching ? 'Analyzing Alignment...' : 'Calculate Candidate Match'}
            </button>
          </form>

          {/* Match Score Display */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI Fit Analysis & Recommendation</h3>

            {matching ? (
              <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <LoadingSpinner label="AI is evaluating skill alignment and experience seniority..." size="md" />
              </div>
            ) : matchResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: matchResult.matchScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: matchResult.matchScore >= 80 ? '#10b981' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                    }}
                  >
                    {matchResult.matchScore}%
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{matchResult.assessment}</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {matchResult.recommendation}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: '#10b981' }}>Key Strengths & Overlaps</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    {matchResult.strengths?.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                {matchResult.missingSkills?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: '#f59e0b' }}>Missing Competencies to Probe</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                      {matchResult.missingSkills.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <p>Run the evaluation on the left to review automated candidate match scoring and debrief pointers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 3: Hiring Market Insights */}
      {activeTab === 'INSIGHTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleFetchInsights} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Job Role</label>
              <input
                type="text"
                className="input"
                value={insightRole}
                onChange={(e) => setInsightRole(e.target.value)}
              />
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Target Location / Market</label>
              <input
                type="text"
                className="input"
                value={insightLocation}
                onChange={(e) => setInsightLocation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={insightLoading}
              className="btn btn-ai"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px', justifyContent: 'center' }}
            >
              <TrendingUp size={16} />
              {insightLoading ? 'Analyzing...' : 'Fetch Market Insights'}
            </button>
          </form>

          {marketInsights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', marginBottom: '0.5rem' }}>
                  <IndianRupee size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Market Compensation</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{marketInsights.salaryRange}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Competitive baseline for top tier talent
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.5rem' }}>
                  <Clock size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Avg Time to Hire</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{marketInsights.averageTimeToHire}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  {marketInsights.demandScore}
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', marginBottom: '0.5rem' }}>
                  <Award size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Talent Retention Tip</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {marketInsights.retentionTip}
                </p>
              </div>

              <div className="card" style={{ gridColumn: '1 / -1', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem' }}>Top In-Demand Skills in Current Market</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {marketInsights.topSkillsInDemand?.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.35rem 0.8rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary-300)',
                        borderRadius: '16px',
                        fontSize: '0.825rem',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterAiToolsPage;
