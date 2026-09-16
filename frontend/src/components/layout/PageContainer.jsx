import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Standardized Page Container Component
 * Provides consistent typography, breadcrumbs, action bars, and responsive margins
 * for all dashboard and public pages.
 */
export const PageContainer = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  children,
  maxWidth = '1400px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`page-container ${className}`}
      style={{
        maxWidth,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        ...style,
      }}
    >
      {/* Optional Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.825rem',
            color: 'var(--text-secondary, #94a3b8)',
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight size={14} color="var(--text-muted, #64748b)" />}
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    style={{
                      color: 'var(--text-secondary, #94a3b8)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast, 0.15s ease)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary, #ffffff)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: isLast ? 'var(--text-primary, #ffffff)' : 'inherit', fontWeight: isLast ? 600 : 400 }}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Header Banner with Title & Actions */}
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary, #ffffff)',
                  }}
                >
                  {title}
                </h1>
                {badge && (
                  <span
                    className="badge badge-ai"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p
                style={{
                  color: 'var(--text-secondary, #94a3b8)',
                  marginTop: '0.4rem',
                  marginBottom: 0,
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  maxWidth: '700px',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
