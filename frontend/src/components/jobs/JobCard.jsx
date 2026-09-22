import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Bookmark, ArrowUpRight, Building2, ExternalLink } from 'lucide-react';
import { formatIndianSalary } from '../../utils/salaryFormatter';
import JobSourceBadge from './JobSourceBadge';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';

export const JobCard = ({ job, onSave, isSaved = false }) => {
  const { isAuthenticated } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  if (!job) return null;

  const {
    id,
    title,
    workMode = 'REMOTE',
    employmentType = 'FULL_TIME',
    minSalary,
    maxSalary,
    currency = 'INR',
    requiredSkills = [],
    description,
  } = job;

  const handleExternalApply = async (e) => {
    e.preventDefault();
    const targetUrl = job.externalApplyUrl || job.externalUrl;
    if (isAuthenticated && id) {
      try {
        setRedirecting(true);
        await applicationService.applyExternalJob(id);
      } catch (err) {
        console.warn('External apply tracking notice:', err);
      } finally {
        setRedirecting(false);
      }
    }
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const companyName = job.company?.name || job.companyName || 'TechCorp India';
  const location = job.location || 'Bengaluru, India';
  const salaryText = formatIndianSalary(minSalary, maxSalary, currency);

  const getCompanyInitial = (name) => {
    return (name || 'C').charAt(0).toUpperCase();
  };

  return (
    <div
      className="card card-interactive"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        transition: 'all 0.15s ease-in-out',
      }}
    >
      {/* Top Header Row: Company Logo + Job Title Info + Bookmark */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
          {/* Standard Corporate Company Logo Placeholder */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4b5563',
            fontSize: '1.15rem',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {getCompanyInitial(companyName)}
          </div>

          {/* Title & Organization Meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>
                {companyName}
              </span>
              {job.sourceType && (
                <JobSourceBadge sourceType={job.sourceType} size="xs" />
              )}
              {job.matchScore !== undefined && job.matchScore > 0 && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#e8f3fc',
                  color: 'var(--color-primary)',
                  border: '1px solid #c8e1f9',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  🤖 {job.matchScore}% AI Match
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.1rem 0 0.4rem', lineHeight: 1.3 }}>
              <Link
                to={`/jobs/${id}`}
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                {title}
              </Link>
            </h3>

            {/* Standard LinkedIn metadata line */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              <span>{location}</span>
              <span>•</span>
              <span>{workMode.toLowerCase()}</span>
              <span>•</span>
              <span>{employmentType.replace('_', ' ').toLowerCase()}</span>
              {salaryText && (
                <>
                  <span>•</span>
                  <span style={{ color: '#057642', fontWeight: 600 }}>
                    {salaryText}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bookmark Action */}
        {onSave && (
          <button
            type="button"
            onClick={() => onSave(id)}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              background: isSaved ? '#e8f3fc' : 'transparent',
              border: '1px solid',
              borderColor: isSaved ? '#c8e1f9' : '#e5e7eb',
              color: isSaved ? 'var(--color-primary)' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title={isSaved ? 'Remove Bookmark' : 'Save Job'}
          >
            <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Description Snippet */}
      {description && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
        }}>
          {description}
        </p>
      )}

      {/* Matching rationale if available */}
      {job.matchRationale && (
        <div style={{
          fontSize: '0.8rem',
          color: '#374151',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.65rem',
        }}>
          <strong>Insight:</strong> {job.matchRationale}
        </div>
      )}

      {/* Skills Tags & Apply Action Footer */}
      <div style={{
        marginTop: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {requiredSkills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              style={{
                fontSize: '0.75rem',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-sm)',
                padding: '0.15rem 0.5rem',
                fontWeight: 500,
              }}
            >
              {skill}
            </span>
          ))}
          {requiredSkills.length > 4 && (
            <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center' }}>
              +{requiredSkills.length - 4} more
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {job.externalApplyUrl && job.sourceType && job.sourceType !== 'INTERNAL' ? (
            <button
              type="button"
              onClick={handleExternalApply}
              disabled={redirecting}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
                padding: '0.4rem 0.9rem',
              }}
            >
              {redirecting ? 'Redirecting...' : 'Apply on Site'} <ExternalLink size={13} />
            </button>
          ) : (
            <Link
              to={`/jobs/${id}`}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 600,
                padding: '0.4rem 0.9rem',
              }}
            >
              View Role <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
