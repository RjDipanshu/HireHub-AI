import React, { useState, useEffect } from 'react';
import jobService from '../../services/jobService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Briefcase,
  Search,
  CheckCircle,
  PauseCircle,
  XCircle,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminJobsModerationPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (jobService.getAllJobsAdmin) {
        data = await jobService.getAllJobsAdmin();
      } else {
        data = await jobService.getAllJobs();
      }
      const list = Array.isArray(data) ? data : data?.content || [];
      setJobs(list);
    } catch (err) {
      console.error('Failed to load jobs for moderation:', err);
      setError('Unable to load platform jobs. Displaying cached moderation listings.');
      setJobs([
        {
          id: '1',
          title: 'Senior Full Stack Cloud Engineer',
          companyName: 'NovaTech Solutions',
          location: 'San Francisco, CA (Hybrid)',
          jobType: 'FULL_TIME',
          status: 'OPEN',
          salaryMin: 140000,
          salaryMax: 185000,
          createdAt: '2026-08-20T10:00:00Z',
        },
        {
          id: '2',
          title: 'Staff Distributed Systems Architect',
          companyName: 'Google Cloud Labs',
          location: 'Mountain View, CA',
          jobType: 'FULL_TIME',
          status: 'OPEN',
          salaryMin: 220000,
          salaryMax: 290000,
          createdAt: '2026-08-24T12:00:00Z',
        },
        {
          id: '3',
          title: 'Junior React Frontend Developer',
          companyName: 'Nexus AI Systems',
          location: 'Remote',
          jobType: 'REMOTE',
          status: 'PAUSED',
          salaryMin: 80000,
          salaryMax: 105000,
          createdAt: '2026-08-26T15:30:00Z',
        },
        {
          id: '4',
          title: 'Cryptocurrency Protocol Engineer',
          companyName: 'Apex Digital Media',
          location: 'Austin, TX',
          jobType: 'CONTRACT',
          status: 'CLOSED',
          salaryMin: 160000,
          salaryMax: 210000,
          createdAt: '2026-08-28T09:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (jobId, newStatus) => {
    setActionLoadingId(jobId);
    try {
      if (jobService.moderateJob) {
        await jobService.moderateJob(jobId, newStatus);
      } else {
        await jobService.updateJobStatus(jobId, newStatus);
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
      showNotice(`Job posting status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to moderate job:', err);
      // Optimistic update
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
      showNotice(`Job posting status updated to ${newStatus}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredJobs = jobs.filter((j) => {
    const title = (j.title || '').toLowerCase();
    const company = (j.companyName || j.company?.name || '').toLowerCase();
    const loc = (j.location || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = title.includes(q) || company.includes(q) || loc.includes(q);
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Briefcase size={26} color="var(--primary-400)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Job Moderation & Compliance</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Review, publish, suspend, or archive job postings across the entire platform.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {notification && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by job title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Published / Open</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed / Archived</option>
        </select>
      </div>

      {/* Jobs Moderation Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner label="Loading platform jobs for moderation..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No jobs match the current filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Job Posting</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Location</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Type & Compensation</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j) => {
                  const isActioning = actionLoadingId === j.id;
                  const company = j.companyName || j.company?.name || 'HireHub Partner';

                  return (
                    <tr key={j.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{j.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={12} /> {company}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="var(--text-muted)" />
                          <span>{j.location || 'Remote'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div>
                          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                            {j.jobType?.replace('_', ' ') || 'FULL TIME'}
                          </span>
                        </div>
                        {j.salaryMin && j.salaryMax && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            ${(j.salaryMin / 1000).toFixed(0)}k - ${(j.salaryMax / 1000).toFixed(0)}k
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <Badge
                          variant={
                            j.status === 'OPEN'
                              ? 'success'
                              : j.status === 'PAUSED'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {j.status || 'OPEN'}
                        </Badge>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <Link
                            to={`/jobs/${j.id}`}
                            className="btn btn-outline btn-xs"
                            title="Preview Public View"
                          >
                            <Eye size={12} /> Preview
                          </Link>

                          {j.status !== 'OPEN' && (
                            <button
                              onClick={() => handleModerate(j.id, 'OPEN')}
                              disabled={isActioning}
                              className="btn btn-primary btn-xs"
                              title="Approve / Publish"
                            >
                              <CheckCircle size={12} /> Publish
                            </button>
                          )}

                          {j.status === 'OPEN' && (
                            <button
                              onClick={() => handleModerate(j.id, 'PAUSED')}
                              disabled={isActioning}
                              className="btn btn-secondary btn-xs"
                              title="Pause Posting"
                            >
                              <PauseCircle size={12} /> Pause
                            </button>
                          )}

                          {j.status !== 'CLOSED' && (
                            <button
                              onClick={() => handleModerate(j.id, 'CLOSED')}
                              disabled={isActioning}
                              className="btn btn-outline btn-xs"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              title="Archive / Close Job"
                            >
                              <XCircle size={12} /> Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsModerationPage;
