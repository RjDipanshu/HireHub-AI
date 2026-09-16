import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AiSparkleCard = ({
  title,
  description,
  actionLabel = 'Try Feature',
  to,
  onClick,
  icon: Icon = Sparkles,
}) => {
  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        background: '#e8f3fc',
        border: '1px solid #c8e1f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={20} color="var(--color-primary)" />
      </div>

      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {description}
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        {to ? (
          <Link
            to={to}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {actionLabel} <ArrowRight size={14} />
          </Link>
        ) : onClick ? (
          <button
            onClick={onClick}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {actionLabel} <ArrowRight size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AiSparkleCard;
