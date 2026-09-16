import React from 'react';
import { Sparkles } from 'lucide-react';

export const AiScoreBadge = ({ score = 85, label = 'ATS Match' }) => {
  const getScoreColor = (num) => {
    if (num >= 80) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    if (num >= 60) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
    return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
  };

  const colors = getScoreColor(score);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.85rem',
      borderRadius: 'var(--radius-full)',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
    }}>
      <Sparkles size={14} color={colors.text} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}:
      </span>
      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: colors.text }}>
        {score}%
      </span>
    </div>
  );
};

export default AiScoreBadge;
