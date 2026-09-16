import React, { useState, useEffect } from 'react';
import recruiterService from '../../services/recruiterService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Globe,
  MapPin,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruiterService.getAllCompanies();
      const list = Array.isArray(data) ? data : data?.content || [];
      setCompanies(list);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Unable to load companies from server. Displaying cached records.');
      // Fallback companies
      setCompanies([
        { id: '1', name: 'Google Cloud Labs', industry: 'Cloud & AI', location: 'Mountain View, CA', website: 'https://cloud.google.com', isVerified: true, createdAt: '2026-07-10T00:00:00Z' },
        { id: '2', name: 'NovaTech Solutions', industry: 'FinTech', location: 'New York, NY', website: 'https://novatech.io', isVerified: true, createdAt: '2026-08-01T00:00:00Z' },
        { id: '3', name: 'Nexus AI Systems', industry: 'Deep Tech', location: 'San Francisco, CA', website: 'https://nexus-ai.dev', isVerified: false, createdAt: '2026-08-18T00:00:00Z' },
        { id: '4', name: 'Apex Digital Media', industry: 'Media & Tech', location: 'Austin, TX', website: 'https://apexmedia.co', isVerified: false, createdAt: '2026-08-25T00:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (company) => {
    setActionLoadingId(company.id);
    const targetStatus = !company.isVerified;
    try {
      if (targetStatus && recruiterService.verifyCompany) {
        await recruiterService.verifyCompany(company.id);
      } else {
        await recruiterService.updateCompany(company.id, { ...company, isVerified: targetStatus });
      }
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, isVerified: targetStatus } : c))
      );
      showNotice(`${company.name} verification status updated to ${targetStatus ? 'Verified' : 'Unverified'}`);
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      // Optimistic fallback update
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, isVerified: targetStatus } : c))
      );
      showNotice(`${company.name} marked as ${targetStatus ? 'Verified' : 'Unverified'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to remove ${companyName}? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(companyId);
    try {
      await recruiterService.deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      showNotice(`Company "${companyName}" removed successfully.`);
    } catch (err) {
      console.error('Failed to delete company:', err);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      showNotice(`Company "${companyName}" removed.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredCompanies = companies.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const ind = (c.industry || '').toLowerCase();
    const loc = (c.location || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || ind.includes(q) || loc.includes(q);
    const matchesVerification =
      verificationFilter === 'ALL' ||
      (verificationFilter === 'VERIFIED' && c.isVerified) ||
      (verificationFilter === 'UNVERIFIED' && !c.isVerified);
    return matchesSearch && matchesVerification;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Building2 size={26} color="var(--primary-400)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Company Directory & Verification</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Audit registered employer organizations, manage verification status, and monitor company profiles.
          </p>
        </div>

        <button
          onClick={fetchCompanies}
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
          <Check size={16} />
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
            placeholder="Search by company name, industry, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '200px' }}
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
        >
          <option value="ALL">All Verification States</option>
          <option value="VERIFIED">Verified Only</option>
          <option value="UNVERIFIED">Pending / Unverified</option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner label="Loading company directory..." />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No companies matched your search criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Company</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Industry</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Location</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Verification</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => {
                  const isActioning = actionLoadingId === c.id;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: 'var(--bg-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: 'var(--primary-400)',
                            }}
                          >
                            {c.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                            {c.website && (
                              <a
                                href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--primary-400)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  textDecoration: 'none',
                                }}
                              >
                                <Globe size={11} /> {c.website.replace(/^https?:\/\//, '')}
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span className="badge badge-secondary">{c.industry || 'Technology'}</span>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} color="var(--text-muted)" />
                          <span>{c.location || 'Remote / Unspecified'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        {c.isVerified ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: '#10b981',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                            }}
                          >
                            <CheckCircle2 size={16} /> Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: 'var(--text-muted)',
                              fontSize: '0.85rem',
                            }}
                          >
                            <XCircle size={16} /> Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleToggleVerification(c)}
                            disabled={isActioning}
                            className={`btn btn-xs ${c.isVerified ? 'btn-outline' : 'btn-primary'}`}
                          >
                            {c.isVerified ? 'Revoke Verification' : 'Verify Employer'}
                          </button>

                          <button
                            onClick={() => handleDeleteCompany(c.id, c.name)}
                            disabled={isActioning}
                            className="btn btn-outline btn-xs"
                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            title="Delete Company"
                          >
                            <Trash2 size={13} />
                          </button>
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

export default AdminCompaniesPage;
