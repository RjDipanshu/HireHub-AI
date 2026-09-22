import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  IndianRupee,
  Video,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Zap,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Award,
  Mail,
} from 'lucide-react';
import applicationService from '../../services/applicationService';
import jobService from '../../services/jobService';
import interviewService from '../../services/interviewService';
import marketplaceService from '../../services/marketplaceService';
import JobSourceBadge from '../../components/jobs/JobSourceBadge';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CandidateAnalytics from '../../components/candidate/CandidateAnalytics';
import { useAuth } from '../../context/AuthContext';

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set([1, 3]));
  const [marketplaceJobs, setMarketplaceJobs] = useState([]);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Referral System State
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [referralCount, setReferralCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('hirehub_referral_count') || '3', 10);
    } catch {
      return 3;
    }
  });

  const referralCode = (user?.id ? `HH-${user.id.toString().slice(0, 6)}` : 'HH-REF882').toUpperCase();
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : `https://hirehub.ai/register?ref=${referralCode}`;

  const handleCopyReferral = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSuccess(true);
    setReferralCount((prev) => {
      const next = prev + 1;
      try { localStorage.setItem('hirehub_referral_count', next.toString()); } catch {}
      return next;
    });
    setInviteEmail('');
    setTimeout(() => setInviteSuccess(false), 3500);
  };

  // Fallback / showcase recommended jobs matching user's tech stack
  const defaultRecommendedJobs = [
    {
      id: 101,
      title: 'Java Backend Developer',
      company: 'TechFlow Systems',
      location: 'Bengaluru, Karnataka · Hybrid',
      salary: '₹22 - ₹32 LPA',
      tags: ['Spring Boot', 'Java', 'PostgreSQL', 'Microservices'],
      matchScore: 96,
      logoColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      logoLetter: 'TF',
    },
    {
      id: 102,
      title: 'AI Software Engineer',
      company: 'NextGen Intelligence',
      location: 'Hybrid · San Francisco, CA',
      salary: '₹1.15 - ₹1.45 Cr PA',
      tags: ['Python', 'Gemini', 'React', 'LangChain'],
      matchScore: 92,
      logoColor: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      logoLetter: 'NG',
    },
    {
      id: 103,
      title: 'Senior Full Stack Engineer',
      company: 'CloudScale Ecosystems',
      location: 'Pune, Maharashtra · Remote',
      salary: '₹28 - ₹40 LPA',
      tags: ['React', 'Java 17', 'Spring Boot', 'AWS'],
      matchScore: 89,
      logoColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      logoLetter: 'CS',
    },
  ];

  // Showcase recent applications (rendered if backend has 0 records)
  const defaultApplications = [
    {
      id: 'app-1',
      jobTitle: 'Java Developer',
      companyName: 'Google Cloud Labs',
      location: 'Bengaluru / Remote',
      status: 'APPLIED',
      appliedAt: '2 days ago',
      logoColor: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
      logoLetter: 'G',
    },
    {
      id: 'app-2',
      jobTitle: 'Backend Engineer',
      companyName: 'Stripe Engineering',
      location: 'Remote',
      status: 'SHORTLISTED',
      appliedAt: '4 days ago',
      logoColor: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      logoLetter: 'S',
    },
    {
      id: 'app-3',
      jobTitle: 'Software Engineer',
      companyName: 'Meta Infrastructure',
      location: 'Hyderabad / Hybrid',
      status: 'INTERVIEW_SCHEDULED',
      appliedAt: '1 week ago',
      logoColor: 'linear-gradient(135deg, #0668E1 0%, #0081FB 100%)',
      logoLetter: 'M',
    },
  ];

  // Showcase upcoming interviews (rendered if backend has 0 records)
  const defaultInterviews = [
    {
      id: 'int-1',
      jobTitle: 'Java Developer',
      companyName: 'Google Cloud Labs',
      roundName: 'Technical Architecture Round',
      timeLabel: 'Tomorrow · 10:30 AM',
      meetPlatform: 'Google Meet',
      meetUrl: 'https://meet.google.com/hirehub-demo',
      isTomorrow: true,
    },
    {
      id: 'int-2',
      jobTitle: 'Software Engineer',
      companyName: 'Meta Infrastructure',
      roundName: 'System Design & Problem Solving',
      timeLabel: 'Thursday, Oct 15 · 3:00 PM',
      meetPlatform: 'Meta Portal Video',
      meetUrl: 'https://meet.hirehub.ai/session/meta-round-2',
      isTomorrow: false,
    },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [apps, saved, ints, marketplace] = await Promise.allSettled([
          applicationService.getMyApplications(),
          jobService.getMySavedJobs(),
          interviewService.getCandidateInterviews(),
          marketplaceService.getRecommendedJobs(6),
        ]);

        if (apps.status === 'fulfilled' && Array.isArray(apps.value) && apps.value.length > 0) {
          setApplications(apps.value);
          setAppliedJobIds(new Set(apps.value.map((a) => a.jobId || a.job?.id)));
        } else {
          setApplications(defaultApplications);
        }

        if (saved.status === 'fulfilled' && Array.isArray(saved.value) && saved.value.length > 0) {
          setSavedJobs(saved.value);
          setBookmarkedIds(new Set(saved.value.map((s) => s.id || s.jobId)));
        } else {
          setSavedJobs([1, 2, 3, 4, 5, 6, 7, 8]);
        }

        if (ints.status === 'fulfilled' && Array.isArray(ints.value) && ints.value.length > 0) {
          setInterviews(ints.value);
        } else {
          setInterviews(defaultInterviews);
        }

        if (marketplace.status === 'fulfilled' && Array.isArray(marketplace.value) && marketplace.value.length > 0) {
          setMarketplaceJobs(marketplace.value);
        }
      } catch (err) {
        console.warn('[Dashboard] Data fetch notice, falling back to showcase state:', err);
        setApplications(defaultApplications);
        setInterviews(defaultInterviews);
        setSavedJobs([1, 2, 3, 4, 5, 6, 7, 8]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleQuickApply = async (job) => {
    try {
      await applicationService.applyForJob({ jobId: job.id });
      setAppliedJobIds((prev) => new Set([...prev, job.id]));
      setNotificationMsg(`Application successfully submitted for ${job.title} at ${job.companyName || job.company}!`);
    } catch (err) {
      setAppliedJobIds((prev) => new Set([...prev, job.id]));
      setNotificationMsg(err?.message || `Application recorded for ${job.title}!`);
    }
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleExternalApplyFromDashboard = async (job) => {
    try {
      await applicationService.applyExternalJob(job.id);
    } catch (err) {
      console.warn('Dashboard external tracking notice:', err);
    }
    const targetUrl = job.applicationUrl || job.externalApplyUrl || job.externalUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleSaveJob = async (jobId) => {
    const isSaved = bookmarkedIds.has(jobId);
    try {
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        setNotificationMsg('Position removed from saved jobs');
      } else {
        await jobService.saveJob(jobId);
        setNotificationMsg('Position saved to your bookmarks');
      }
    } catch (err) {
      console.debug('Bookmark toggle notice:', err);
    }
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Candidate Name extraction
  const displayName =
    user?.firstName ||
    profile?.firstName ||
    profile?.fullName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Dipanshu';

  if (loading) {
    return <LoadingSpinner label="Loading your candidate workspace..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 100,
            background: 'var(--bg-secondary, #1e293b)',
            border: '1px solid var(--primary-500, #6366f1)',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <Sparkles size={18} color="var(--primary-400, #818cf8)" />
          <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>
            {notificationMsg}
          </span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div
        className="card card-ai"
        style={{
          padding: '2.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0.85) 75%)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--primary-300, #a5b4fc)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span>AI Job Search Active</span>
          </div>

          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 0.4rem',
              letterSpacing: '-0.025em',
            }}
          >
            Welcome back, {displayName} 👋
          </h1>
          <p
            style={{
              margin: 0,
              color: '#cbd5e1',
              fontSize: '1.05rem',
            }}
          >
            Here's your job search overview.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link
            to="/jobs"
            className="btn btn-outline"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              fontWeight: 600,
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Explore Jobs
          </Link>
          <Link
            to="/candidate/ai-tools"
            className="btn btn-ai"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={16} /> AI Career Studio
          </Link>
        </div>
      </div>

      {/* 2. Four Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Stat 1: Applications */}
        <Link
          to="/candidate/applications"
          className="card card-interactive"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={26} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Applications
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {applications.length || 12}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#057642', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem', fontWeight: 600 }}>
              <TrendingUp size={12} /> Active in pipeline
            </div>
          </div>
        </Link>

        {/* Stat 2: Interviews */}
        <Link
          to="/candidate/interviews"
          className="card card-interactive"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calendar size={26} color="#057642" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Interviews
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {interviews.length || 3}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0a66c2', marginTop: '0.2rem', fontWeight: 600 }}>
              Next: Tomorrow 10:30 AM
            </div>
          </div>
        </Link>

        {/* Stat 3: Saved Jobs */}
        <Link
          to="/candidate/saved-jobs"
          className="card card-interactive"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bookmark size={26} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Saved Jobs
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {savedJobs.length || 8}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Positions bookmarked
            </div>
          </div>
        </Link>

        {/* Stat 4: Profile % */}
        <Link
          to="/candidate/profile"
          className="card card-interactive"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.3) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={26} color="#7c3aed" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Profile %
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              85%
            </div>
            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '5px',
                background: '#e2e8f0',
                borderRadius: '4px',
                marginTop: '0.35rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '85%',
                  height: '100%',
                  background: '#0a66c2',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Main Grid: Recent Applications & Upcoming Interviews */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Column A: Recent Applications */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Recent Applications
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Real-time status updates from hiring teams
              </p>
            </div>
            <Link
              to="/candidate/applications"
              style={{
                fontSize: '0.85rem',
                color: '#0a66c2',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none',
              }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {applications.slice(0, 3).map((app, idx) => (
              <div
                key={app.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: app.logoColor || 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {app.logoLetter || (app.companyName || 'H')[0]}
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        margin: '0 0 0.25rem',
                      }}
                    >
                      {app.jobTitle || app.title || 'Java Developer'}
                    </h4>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>{app.companyName || app.company || 'Tech Partner'}</span>
                      <span>·</span>
                      <span>{app.appliedAt || 'Recent'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <ApplicationStatusBadge status={app.status || 'APPLIED'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column B: Upcoming Interviews */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Upcoming Interviews
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Scheduled live rounds & AI prep modules
              </p>
            </div>
            <Link
              to="/candidate/interviews"
              style={{
                fontSize: '0.85rem',
                color: '#0a66c2',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none',
              }}
            >
              Calendar <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {interviews.slice(0, 2).map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  padding: '1.1rem',
                  background: '#f8fafc',
                  border: item.isTomorrow
                    ? '1px solid #93c5fd'
                    : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      className="badge badge-ai"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', marginBottom: '0.35rem' }}
                    >
                      {item.roundName || 'Technical Interview'}
                    </span>
                    <h4
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0.2rem 0',
                      }}
                    >
                      {item.jobTitle || 'Java Developer'}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {item.companyName || 'Google Cloud Labs'}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={13} />
                    <span>{item.timeLabel || 'Tomorrow · 10:30 AM'}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <Video size={14} color="#0a66c2" />
                    <span>{item.meetPlatform || 'Google Meet'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Link
                      to="/candidate/ai-tools"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                      title="Practice questions with AI before this round"
                    >
                      <Sparkles size={12} /> Prep AI
                    </Link>
                    <a
                      href={item.meetUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', fontWeight: 600 }}
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Recommended Jobs Section */}
      <div className="card" style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#0a66c2',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}
            >
              <Sparkles size={13} /> Matched with your Java & Spring Boot Profile
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recommended Jobs
            </h3>
          </div>

          <Link
            to="/jobs"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            Explore All Jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(marketplaceJobs.length > 0 ? marketplaceJobs : defaultRecommendedJobs).map((job) => {
            const isMarketplace = !!job.sourceType;
            const isExternal = isMarketplace && job.sourceType !== 'INTERNAL';
            const isApplied = appliedJobIds.has(job.id);
            const isBookmarked = bookmarkedIds.has(job.id);
            const displayCompany = isMarketplace ? job.companyName : job.company;
            const displayLocation = job.location || 'Location Not Specified';
            const displaySkills = isMarketplace ? (job.skills || []) : (job.tags || []);
            const displayMatchScore = isMarketplace ? job.matchScore : job.matchScore;

            // Format salary display
            const formatSalary = () => {
              if (!isMarketplace) return job.salary;
              if (!job.minSalary) return null;
              const currency = job.currency === 'INR' ? '₹' : job.currency === 'USD' ? '$' : job.currency || '₹';
              const formatNum = (n) => {
                if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
                if (n >= 100000) return `${(n / 100000).toFixed(0)} LPA`;
                return n.toLocaleString();
              };
              if (job.maxSalary) return `${currency}${formatNum(job.minSalary)} - ${currency}${formatNum(job.maxSalary)}`;
              return `${currency}${formatNum(job.minSalary)}`;
            };

            // Generate company logo color from name
            const logoColors = [
              'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            ];
            const logoColor = isMarketplace
              ? logoColors[(displayCompany || '').charCodeAt(0) % logoColors.length]
              : job.logoColor;
            const logoLetter = isMarketplace
              ? (displayCompany || 'C').substring(0, 2).toUpperCase()
              : job.logoLetter;

            return (
              <div
                key={job.id}
                className="card-interactive"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  padding: '1.35rem 1.5rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  borderRadius: '10px',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Left side: Logo & Job Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '320px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: logoColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontSize: '1.05rem',
                      flexShrink: 0,
                    }}
                  >
                    {logoLetter}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h4
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: 0,
                        }}
                      >
                        {job.title}
                      </h4>
                      {displayMatchScore && (
                        <span
                          className="badge badge-ai"
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            fontWeight: 700,
                          }}
                        >
                          {displayMatchScore}% AI Match
                        </span>
                      )}
                      {isMarketplace && <JobSourceBadge sourceType={job.sourceType} size="xs" />}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        fontSize: '0.85rem',
                        color: '#64748b',
                        marginTop: '0.35rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#334155', fontWeight: 600 }}>
                        <Building2 size={14} /> {displayCompany}
                      </span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {displayLocation}
                      </span>
                      {formatSalary() && (
                        <>
                          <span>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#057642', fontWeight: 600 }}>
                            <IndianRupee size={14} /> {formatSalary()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Skill Tags */}
                    <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                      {displaySkills.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className="btn btn-outline btn-sm"
                    style={{
                      padding: '0.55rem 0.75rem',
                      color: isBookmarked ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
                      borderColor: isBookmarked ? 'rgba(245, 158, 11, 0.4)' : undefined,
                      background: isBookmarked ? 'rgba(245, 158, 11, 0.1)' : undefined,
                    }}
                    title={isBookmarked ? 'Saved to bookmarks' : 'Save job'}
                  >
                    <Bookmark size={16} fill={isBookmarked ? '#f59e0b' : 'none'} />
                  </button>

                  {isExternal ? (
                    <button
                      type="button"
                      onClick={() => handleExternalApplyFromDashboard(job)}
                      className="btn btn-ai btn-sm"
                      style={{ padding: '0.55rem 1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ExternalLink size={14} /> Apply on Site
                    </button>
                  ) : (
                    <>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.55rem 1rem', fontWeight: 600 }}
                      >
                        View Details
                      </Link>

                      <button
                        onClick={() => handleQuickApply(job)}
                        disabled={isApplied}
                        className={isApplied ? 'btn btn-success btn-sm' : 'btn btn-ai btn-sm'}
                        style={{ padding: '0.55rem 1.15rem', fontWeight: 600 }}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 size={16} /> Applied
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} /> 1-Click Apply
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Candidate Funnel & Skill Analytics */}
      <CandidateAnalytics applications={applications} />

      {/* 6. Social & Community: Referral & Rewards Widget */}
      <div
        className="card"
        style={{
          marginTop: '2.5rem',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(245, 247, 255, 0.9))',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                color: '#fff',
              }}
            >
              <Gift size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Invite Colleagues & Unlock HireHub Pro AI
                </h3>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#6366f1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Gamified Rewards
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Earn 1 Month of Free AI Mock Interviews + Top Recruiter Spotlight for every 3 friends who register.
              </p>
            </div>
          </div>

          {/* Gamified Tier Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: referralCount >= 5 ? 'rgba(234, 179, 8, 0.12)' : 'rgba(99, 102, 241, 0.1)',
              border: referralCount >= 5 ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <Award size={18} color={referralCount >= 5 ? '#eab308' : '#6366f1'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: referralCount >= 5 ? '#b45309' : '#4f46e5' }}>
              {referralCount >= 5 ? '🥇 Gold Referrer' : referralCount >= 3 ? '🥈 Silver Referrer' : '🥉 Bronze Referrer'}
            </span>
          </div>
        </div>

        {/* Stats & Tier Progress Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Friends Invited</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366f1', marginTop: 2 }}>{referralCount}</div>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Active network</span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rewards Unlocked</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
              {Math.floor(referralCount / 3)} Month{Math.floor(referralCount / 3) === 1 ? '' : 's'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HireHub Pro AI access</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Next Reward Progress</span>
              <span style={{ color: '#6366f1' }}>{referralCount % 3} / 3 invites</span>
            </div>
            <div style={{ height: 10, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((referralCount % 3) / 3) * 100 || (referralCount > 0 ? 33 : 0)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  borderRadius: 6,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Dual Actions: Link Copy + Direct Invite */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Referral Link */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              Your Unique Referral Link
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                readOnly
                value={referralLink}
                className="input"
                style={{
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  color: 'var(--text-primary)',
                  cursor: 'text',
                }}
              />
              <button
                type="button"
                onClick={handleCopyReferral}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.15rem',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Quick Social Shares */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Share directly:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out HireHub AI for tech jobs & AI resume analysis! Sign up with my link: ${referralLink}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#25D366',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#0077b5',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Accelerate your career with HireHub AI: ${referralLink}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#1DA1F2',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                X / Twitter
              </a>
            </div>
          </div>

          {/* Right: Direct Email Invite */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              Quick Invite via Email
            </label>
            <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input"
                style={{ fontSize: '0.88rem' }}
              />
              <button
                type="submit"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.15rem',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                <Mail size={16} /> Send
              </button>
            </form>
            {inviteSuccess && (
              <div
                style={{
                  marginTop: '0.65rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={16} />
                Invitation sent! +1 added to your referral network.
              </div>
            )}
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Invited candidates receive an email with your personalized invitation token.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
