import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  PlusCircle,
  Users,
  Trash2,
  Edit3,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  PauseCircle,
  Archive,
  AlertCircle,
  MapPin,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { formatIndianSalary } from '../../utils/salaryFormatter';

export const RecruiterJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getMyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setUpdatingId(job.id);
    try {
      await jobService.updateJobStatus(job.id, nextStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
      );
      setFeedbackMsg(`Job marked as ${nextStatus}`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update job status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job? New candidates will no longer be able to apply.')) return;
    setUpdatingId(jobId);
    try {
      await jobService.updateJobStatus(jobId, 'CLOSED');
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'CLOSED' } : j))
      );
      setFeedbackMsg('Job successfully closed and archived.');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to close job.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing? This action cannot be undone.')) return;
    try {
      await jobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setFeedbackMsg('Job listing deleted.');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err?.message || 'Failed to delete job.');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      job.status === statusFilter ||
      (!job.status && statusFilter === 'ACTIVE');

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner label="Loading your published and draft jobs..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.35rem' }}>Job Listings Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Review active vacancies, publish/pause openings, and manage incoming candidate applications.
          </p>
        </div>

        <Link to="/recruiter/jobs/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PlusCircle size={16} /> Post New Job
        </Link>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {feedbackMsg}
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="input"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
            placeholder="Search roles by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.775rem' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No matching job listings found</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
            {jobs.length === 0
              ? "You haven't posted any job openings yet. Start attracting top candidates today."
              : 'Try clearing your search query or status filter.'}
          </p>
          <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
            Create Job Posting
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredJobs.map((job) => {
            const isClosed = job.status === 'CLOSED';
            const isPaused = job.status === 'PAUSED';

            return (
              <div
                key={job.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  borderLeft: `4px solid ${isClosed ? '#64748b' : isPaused ? '#f59e0b' : '#10b981'}`,
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{job.title}</h3>
                    <Badge variant={isClosed ? 'default' : isPaused ? 'warning' : 'success'}>
                      {job.status || 'ACTIVE'}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} /> {job.location || 'Remote'}
                    </span>
                    <span>•</span>
                    <span>{job.workMode || 'REMOTE'}</span>
                    <span>•</span>
                    <span>{job.employmentType || 'FULL_TIME'}</span>
                    {job.minSalary && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {formatIndianSalary(job.minSalary, job.maxSalary, job.currency)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {/* Applicants button */}
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="btn btn-ai btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Users size={14} />
                    Applicants ({job.applicationCount || 0})
                  </Link>

                  {/* Status toggle (Pause / Activate) */}
                  {!isClosed && (
                    <button
                      onClick={() => handleToggleStatus(job)}
                      disabled={updatingId === job.id}
                      className="btn btn-outline btn-sm"
                      title={isPaused ? 'Publish / Unpause Job' : 'Pause Job'}
                    >
                      {isPaused ? <CheckCircle2 size={14} color="#10b981" /> : <PauseCircle size={14} color="#f59e0b" />}
                      <span style={{ marginLeft: '0.3rem' }}>{isPaused ? 'Activate' : 'Pause'}</span>
                    </button>
                  )}

                  {/* Edit Job */}
                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="btn btn-outline btn-sm"
                    title="Edit job requirements and compensation"
                  >
                    <Edit3 size={14} />
                    <span style={{ marginLeft: '0.3rem' }}>Edit</span>
                  </Link>

                  {/* Close Job */}
                  {!isClosed && (
                    <button
                      onClick={() => handleCloseJob(job.id)}
                      disabled={updatingId === job.id}
                      className="btn btn-outline btn-sm"
                      title="Close job vacancy"
                    >
                      <Archive size={14} />
                    </button>
                  )}

                  {/* Delete Job */}
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#ef4444' }}
                    title="Delete job permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
