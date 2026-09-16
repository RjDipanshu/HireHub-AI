import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Calendar,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Video,
  CheckCircle2,
  MapPin,
  Building,
} from 'lucide-react';
import jobService from '../../services/jobService';
import interviewService from '../../services/interviewService';
import applicationService from '../../services/applicationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';

export const RecruiterDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecruiterData = async () => {
      setLoading(true);
      try {
        const [jobsRes, intsRes, appsRes] = await Promise.allSettled([
          jobService.getMyJobs(),
          interviewService.getRecruiterInterviews(),
          applicationService.getRecruiterApplications(),
        ]);

        if (jobsRes.status === 'fulfilled') setJobs(Array.isArray(jobsRes.value) ? jobsRes.value : []);
        if (intsRes.status === 'fulfilled') setInterviews(Array.isArray(intsRes.value) ? intsRes.value : []);
        if (appsRes.status === 'fulfilled') setApplications(Array.isArray(appsRes.value) ? appsRes.value : []);
      } finally {
        setLoading(false);
      }
    };

    loadRecruiterData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading recruiter management dashboard..." size="lg" />;
  }

  // Pipeline funnel statistics
  const pipelineCounts = {
    applied: applications.filter((a) => a.status === 'APPLIED').length,
    screening: applications.filter((a) => a.status === 'SCREENING').length,
    shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
    interview: applications.filter((a) => a.status === 'INTERVIEW').length,
    selected: applications.filter((a) => a.status === 'SELECTED' || a.status === 'HIRED' || a.status === 'OFFERED').length,
  };

  const totalApplicants = applications.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="card card-ai" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>Talent Acquisition Command Center</span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.25rem 0' }}>Employer Hiring Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Track active roles, manage candidate progression through your pipeline, and leverage Gemini AI tools.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/recruiter/candidates" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} /> Search Talent Pool
          </Link>
          <Link to="/recruiter/jobs/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={16} /> Post a New Job
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-md)' }}>
              <Briefcase size={24} color="var(--primary-400)" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{jobs.length}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Job Openings</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {totalApplicants || jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Applicants</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md)' }}>
              <Calendar size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{interviews.length}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interviews Scheduled</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(236, 72, 153, 0.15)', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={24} color="#ec4899" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>88%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg AI Match Quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hiring Pipeline Funnel Section */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Hiring Pipeline Funnel</h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Overall applicant progress across all current recruitment stages
            </p>
          </div>
          <Link to="/recruiter/applications" style={{ fontSize: '0.85rem', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Open Interactive Pipeline <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { stage: 'Applied', count: pipelineCounts.applied, color: '#6366f1', pct: totalApplicants ? Math.round((pipelineCounts.applied / totalApplicants) * 100) : 0 },
            { stage: 'Screening', count: pipelineCounts.screening, color: '#8b5cf6', pct: totalApplicants ? Math.round((pipelineCounts.screening / totalApplicants) * 100) : 0 },
            { stage: 'Shortlisted', count: pipelineCounts.shortlisted, color: '#3b82f6', pct: totalApplicants ? Math.round((pipelineCounts.shortlisted / totalApplicants) * 100) : 0 },
            { stage: 'Interview', count: pipelineCounts.interview, color: '#f59e0b', pct: totalApplicants ? Math.round((pipelineCounts.interview / totalApplicants) * 100) : 0 },
            { stage: 'Selected / Hired', count: pipelineCounts.selected, color: '#10b981', pct: totalApplicants ? Math.round((pipelineCounts.selected / totalApplicants) * 100) : 0 },
          ].map((item) => (
            <div
              key={item.stage}
              style={{
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                borderTop: `3px solid ${item.color}`,
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.stage}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0' }}>{item.count}</div>
              <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(item.pct, 5)}%`, height: '100%', background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Active Job Listings + Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs Table (2 Columns wide) */}
        <div className="card lg:col-span-2" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Active Vacancies</h3>
            <Link to="/recruiter/jobs" style={{ fontSize: '0.85rem', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Manage All Jobs <ArrowRight size={14} />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <p>You haven't posted any jobs yet.</p>
              <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                Create Your First Job
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.15rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>{job.title}</h4>
                    <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.employmentType}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={job.status === 'PUBLISHED' ? 'success' : 'primary'}>
                      {job.status || 'ACTIVE'}
                    </Badge>
                    <Link
                      to={`/recruiter/jobs/${job.id}/applicants`}
                      className="btn btn-ai btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem' }}
                    >
                      <Users size={13} /> Applicants ({job.applicationCount || 0})
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interview Agenda (1 Column wide) */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Upcoming Interviews</h3>
            <Link to="/recruiter/interviews" style={{ fontSize: '0.85rem', color: 'var(--primary-400)' }}>
              Agenda →
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No interviews scheduled for this week.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {interviews.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.85rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.candidateName || 'Candidate'}</span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--primary-400)' }}>{item.roundName || 'Round'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.jobTitle}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : 'Upcoming'}
                    </span>
                    {item.meetingLink && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <Video size={12} /> Join Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
