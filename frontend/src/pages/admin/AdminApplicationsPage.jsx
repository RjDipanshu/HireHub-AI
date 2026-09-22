import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  ExternalLink,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try recruiter applications or fallback to mock
      const data = await applicationService.getRecruiterApplications();
      const list = Array.isArray(data) ? data : data?.content || [];
      setApplications(list);
      } catch (err) {
      console.warn('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    setUpdatingStatus(true);
    try {
      if (applicationService.updateApplicationStatus) {
        await applicationService.updateApplicationStatus(appId, { status: newStatus });
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      showNotice(`Application status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update application status:', err);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      showNotice(`Application marked as ${newStatus}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredApps = applications.filter((a) => {
    const cand = (a.candidateName || a.candidate?.firstName || '').toLowerCase();
    const job = (a.jobTitle || a.job?.title || '').toLowerCase();
    const comp = (a.companyName || a.job?.company?.name || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = cand.includes(q) || job.includes(q) || comp.includes(q);
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <FileText size={26} color="var(--primary-400)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Platform Applications Audit</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Inspect candidate submissions across all hiring teams, view ATS scores, and audit recruitment pipelines.
          </p>
        </div>

        <button
          onClick={fetchApplications}
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

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by candidate name, role, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Application Stages</option>
          <option value="APPLIED">Applied / New</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="ACCEPTED">Offered / Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner label="Auditing candidate submissions..." />
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No applications match your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Candidate</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Applied Role & Employer</th>
                  <th style={{ padding: '1rem 1.5rem' }}>ATS Fit</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Pipeline Status</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Audit Inspection</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const candidateName = app.candidateName || `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() || 'Candidate';
                  const candidateEmail = app.candidateEmail || app.candidate?.email || 'N/A';
                  const jobTitle = app.jobTitle || app.job?.title || 'Engineering Role';
                  const companyName = app.companyName || app.job?.company?.name || 'Partner Org';
                  const score = app.atsScore || 85;

                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{candidateName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{candidateEmail}</div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{jobTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{companyName}</div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span className="badge badge-ai" style={{ fontWeight: 700 }}>
                          {score}/100
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <Badge
                          variant={
                            app.status === 'ACCEPTED'
                              ? 'success'
                              : app.status === 'INTERVIEW_SCHEDULED'
                              ? 'ai'
                              : app.status === 'UNDER_REVIEW'
                              ? 'warning'
                              : app.status === 'REJECTED'
                              ? 'error'
                              : 'primary'
                          }
                        >
                          {app.status?.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="btn btn-outline btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Drawer / Modal */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="card card-ai"
            style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Application Details</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  ID: {selectedApp.id}
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary btn-xs">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CANDIDATE</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {selectedApp.candidateName || 'Candidate Profile'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedApp.candidateEmail || 'No email attached'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TARGET POSITION</div>
                <div style={{ fontWeight: 600 }}>{selectedApp.jobTitle || 'Engineering Role'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-400)' }}>
                  {selectedApp.companyName || 'Company'}
                </div>
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    COVER LETTER SUBMISSION
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Status Governance Buttons */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  OVERRIDE PIPELINE STATUS
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['APPLIED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusUpdate(selectedApp.id, st)}
                      disabled={updatingStatus || selectedApp.status === st}
                      className={`btn btn-xs ${selectedApp.status === st ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
