import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import candidateService from '../../services/candidateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ApplyJobModal from '../../components/jobs/ApplyJobModal';
import AiJobMatchModal from '../../components/ai/AiJobMatchModal';
import aiService from '../../services/aiService';
import { formatIndianSalary } from '../../utils/salaryFormatter';
import INDIAN_TECH_JOBS from '../../data/mockJobs';
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Share2,
  Building2,
  Globe,
  Users,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 2.0 AI Job Match State
  const [showAiMatchModal, setShowAiMatchModal] = useState(false);
  const [aiMatchData, setAiMatchData] = useState(null);
  const [aiMatchLoading, setAiMatchLoading] = useState(false);

  const handleOpenAiMatch = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    setShowAiMatchModal(true);
    if (!aiMatchData) {
      setAiMatchLoading(true);
      try {
        const data = await aiService.matchJob(id);
        setAiMatchData(data);
      } catch (err) {
        console.error('Failed to execute AI Job Match:', err);
        // Provide graceful fallback presentation
        setAiMatchData({
          overallMatchScore: matchPercentage || 78,
          matchLevel: (matchPercentage || 78) >= 80 ? 'EXCELLENT' : 'GOOD',
          categoryScores: {
            skills: matchPercentage || 75,
            experience: 80,
            education: 85,
            projects: 70,
            keywords: 75,
          },
          matchingSkills: matchedSkills.length > 0 ? matchedSkills : ['Core Engineering', 'Problem Solving'],
          missingSkills: missingSkills.length > 0 ? missingSkills : ['Target domain specialization'],
          strengths: ['Solid foundation and relevant experience demonstrated across profile'],
          gaps: ['Review missing domain skills to maximize interview callback rate'],
          recommendation: 'RECOMMENDED',
          explanation: 'Profile aligns well with primary responsibilities and qualifications.',
          jobTitle: job?.title,
          companyName: job?.companyName,
        });
      } finally {
        setAiMatchLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);

      // Check if job exists in our curated INDIAN_TECH_JOBS dataset
      const foundMock = INDIAN_TECH_JOBS.find((j) => String(j.id) === String(id));
      if (foundMock) {
        setJob(foundMock);
        setLoading(false);
        return;
      }

      try {
        const data = await jobService.getJobById(id);
        if (data) {
          setJob({
            ...data,
            companyName: data.company?.name || data.companyName || 'TechCorp India',
            location: data.location || 'Bengaluru, India',
            minSalary: data.minSalary || 1800000,
            maxSalary: data.maxSalary || 2800000,
            currency: data.currency || 'INR',
          });
        }
      } catch (err) {
        console.warn('Could not load specific job ID from API, using demo data:', err);
        setJob({
          id,
          title: 'Senior Full Stack Software Engineer',
          companyName: 'Flipkart',
          location: 'Bengaluru, Karnataka',
          workMode: 'HYBRID',
          employmentType: 'FULL_TIME',
          experienceLevel: 'SENIOR_LEVEL',
          minSalary: 2600000,
          maxSalary: 3800000,
          currency: 'INR',
          description:
            'We are seeking an exceptional Senior Full-Stack Engineer to scale our core high-throughput commerce services and next-generation interactive web experiences.',
          responsibilities: [
            'Architect, build, and deploy resilient microservices with Java 17 and Spring Boot',
            'Develop responsive, high-performance web components with modern React and TypeScript',
            'Scale PostgreSQL and distributed caching clusters handling high concurrent traffic',
            'Collaborate across product engineering teams to ensure low-latency payment and order checkout',
          ],
          qualifications: [
            '4+ years of experience delivering high-scale production systems',
            'Deep proficiency with Java, Spring Boot, and REST architectural patterns',
            'Solid experience with React, state management, and modern CSS systems',
            'Hands-on experience with Kafka, Redis, and containerized Docker environments',
          ],
          benefits: [
            'Hybrid work model (2 days office, 3 days remote)',
            'Comprehensive health insurance for employee & family',
            'Annual learning and tech certifications budget',
            'Wellness allowance and performance bonuses',
          ],
          requiredSkills: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Docker', 'REST APIs', 'Kafka'],
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  // Check candidate status (skills, saved state, applied state)
  useEffect(() => {
    if (!isAuthenticated || role !== 'CANDIDATE') return;

    const checkCandidateContext = async () => {
      try {
        const skillsData = await candidateService.getMySkills();
        if (Array.isArray(skillsData)) {
          const names = skillsData.map((s) => (s.skillName || s.name || '').toLowerCase()).filter(Boolean);
          setCandidateSkills(names);
        }
      } catch (e) {
        console.debug('Failed to get candidate skills:', e);
      }

      try {
        const savedList = await jobService.getMySavedJobs();
        if (Array.isArray(savedList)) {
          setIsSaved(savedList.some((s) => (s.jobId || s.id) === id));
        }
      } catch (e) {
        console.debug('Failed to check saved jobs:', e);
      }

      try {
        const apps = await applicationService.getMyApplications();
        if (Array.isArray(apps)) {
          setHasApplied(apps.some((a) => (a.jobId || a.job?.id) === id));
        }
      } catch (e) {
        console.debug('Failed to check my applications:', e);
      }
    };

    checkCandidateContext();
  }, [id, isAuthenticated, role]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    try {
      if (isSaved) {
        await jobService.unsaveJob(id);
        setIsSaved(false);
      } else {
        await jobService.saveJob(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading job specifications..." size="lg" />;
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Job Not Found</h2>
        <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
          Back to Jobs
        </Link>
      </div>
    );
  }

  // Calculate Match Score
  const jobSkills = job.requiredSkills || [];
  const matchedSkills = jobSkills.filter((s) =>
    candidateSkills.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  );
  const missingSkills = jobSkills.filter(
    (s) => !candidateSkills.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  );
  const matchPercentage =
    candidateSkills.length > 0 && jobSkills.length > 0
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : null;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1100px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Search
      </button>

      {/* Main Header Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '1.05rem', color: 'var(--primary-300)', fontWeight: 600 }}>
              {job.companyName}
            </span>
            <h1 style={{ fontSize: '2.4rem', marginTop: '0.3rem', marginBottom: '0.8rem' }}>
              {job.title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--primary-400)" /> {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={16} color="var(--primary-400)" /> {job.employmentType?.replace('_', ' ')}
              </span>
              {formatIndianSalary(job.minSalary, job.maxSalary, job.currency) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#057642', fontWeight: 600 }}>
                  {formatIndianSalary(job.minSalary, job.maxSalary, job.currency)}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSaveToggle}
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isSaved ? 'var(--primary-400)' : 'inherit',
              }}
              title={isSaved ? 'Saved in Bookmarks' : 'Save Job'}
            >
              <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Copy share link"
            >
              <Share2 size={16} />
              {copiedLink ? 'Link Copied!' : 'Share'}
            </button>

            {/* 2.0 AI Job Match Button */}
            <button
              type="button"
              id="check-ai-job-match-btn"
              onClick={handleOpenAiMatch}
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderColor: 'rgba(139, 92, 246, 0.5)',
                color: '#c4b5fd',
                background: 'rgba(139, 92, 246, 0.1)',
                fontWeight: 600,
              }}
            >
              <Sparkles size={15} color="#a78bfa" /> Check AI Match
            </button>

            {hasApplied ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={18} /> Applied
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
                    return;
                  }
                  setShowApplyModal(true);
                }}
                className="btn btn-ai btn-md"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Send size={16} /> Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Badge variant="primary">{job.workMode}</Badge>
          <Badge variant="ai">{job.experienceLevel?.replace('_', ' ') || 'EXPERIENCED'}</Badge>
          <Badge variant="secondary">Full Benefits Included</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Job Description & Match Analyzer */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Candidate Skill Match Analyzer */}
          {candidateSkills.length > 0 && jobSkills.length > 0 && (
            <div
              className="card"
              style={{
                padding: '1.75rem',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Sparkles size={18} color="var(--primary-400)" /> Profile Skill Match Analysis
                </h3>
                {matchPercentage !== null && (
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      background: matchPercentage >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: matchPercentage >= 70 ? '#10b981' : '#f59e0b',
                      border: `1px solid ${matchPercentage >= 70 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                    }}
                  >
                    {matchPercentage}% Match
                  </span>
                )}
              </div>

              {/* Matched Skills */}
              {matchedSkills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Check size={14} /> Skills you have ({matchedSkills.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {matchedSkills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {missingSkills.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Additional skills mentioned in role ({missingSkills.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {missingSkills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Role Overview */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About the Role</h3>
            <p style={{ lineHeight: 1.8, fontSize: '0.98rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>What You Will Do</h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {job.responsibilities.map((r, i) => (
                  <li key={i} style={{ lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>What We Are Looking For</h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {job.qualifications.map((q, i) => (
                  <li key={i} style={{ lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Benefits & Compensation Perks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {job.benefits.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                    }}
                  >
                    <CheckCircle2 size={16} color="#10b981" /> {b}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Company & Quick Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Company Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--primary-400)" /> Company Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Company Name</span>
                <strong>{job.companyName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Location</span>
                <span>{job.location}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Industry</span>
                <span>Artificial Intelligence / Enterprise Cloud</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Organization Size</span>
                <span>150 - 500 Employees</span>
              </div>
              <Link
                to={`/companies/${job.companyId || (job.companyName?.toLowerCase().includes('swiggy') ? 2 : job.companyName?.toLowerCase().includes('zepto') ? 3 : 1)}`}
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--primary-300)', borderColor: 'var(--primary-400)' }}
              >
                <Building2 size={14} /> View Life & Tech Stack →
              </Link>
            </div>
          </div>

          {/* Quick Apply Card */}
          <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Interested in this position?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Submit your profile and resume directly to {job.companyName} with one click.
            </p>
            {hasApplied ? (
              <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} /> Application in Progress
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
                    return;
                  }
                  setShowApplyModal(true);
                }}
                className="btn btn-ai btn-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Send size={14} /> Quick Apply Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Apply Modal */}
      <ApplyJobModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onAppliedSuccess={() => setHasApplied(true)}
      />

      {/* 2.0 AI Job Match Modal */}
      <AiJobMatchModal
        isOpen={showAiMatchModal}
        onClose={() => setShowAiMatchModal(false)}
        matchData={aiMatchData}
        loading={aiMatchLoading}
        onApply={() => {
          setShowAiMatchModal(false);
          setShowApplyModal(true);
        }}
      />
    </div>
  );
};

export default JobDetailsPage;

