import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
  Cpu,
  Briefcase,
  GraduationCap,
  Hash,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const AtsScoreGauge = ({ analysis, targetRole, onApplySuggestion }) => {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!analysis) return null;

  const score = analysis.overallScore ?? analysis.matchScore ?? 80;
  
  // Theme color calculations
  let statusColor = '#10b981'; // Emerald
  let statusBg = 'rgba(16, 185, 129, 0.12)';
  let statusBorder = 'rgba(16, 185, 129, 0.3)';
  let statusLabel = 'ATS Optimized';
  let statusVerdict = 'High Interview Probability';

  if (score < 60) {
    statusColor = '#f43f5e'; // Rose
    statusBg = 'rgba(244, 63, 94, 0.12)';
    statusBorder = 'rgba(244, 63, 94, 0.3)';
    statusLabel = 'Critical Fixes Needed';
    statusVerdict = 'High Risk of ATS Rejection';
  } else if (score < 80) {
    statusColor = '#f59e0b'; // Amber
    statusBg = 'rgba(245, 158, 11, 0.12)';
    statusBorder = 'rgba(245, 158, 11, 0.3)';
    statusLabel = 'Competitive Polish Needed';
    statusVerdict = 'Moderate Interview Probability';
  }

  // SVG Circular Meter Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // 5 Dimension Breakdown
  const dimensions = [
    {
      label: 'Technical Skills Match',
      score: analysis.skillsMatchScore ?? Math.min(98, score + 4),
      icon: Cpu,
      color: '#6366f1',
    },
    {
      label: 'Experience & Impact Depth',
      score: analysis.experienceMatchScore ?? Math.min(95, Math.max(45, score - 3)),
      icon: Briefcase,
      color: '#06b6d4',
    },
    {
      label: 'Education & Credentials',
      score: analysis.educationMatchScore ?? 90,
      icon: GraduationCap,
      color: '#8b5cf6',
    },
    {
      label: 'ATS Keyword Density',
      score: analysis.keywordsScore ?? Math.min(96, Math.max(50, score + 1)),
      icon: Hash,
      color: '#ec4899',
    },
    {
      label: 'Formatting & Parse Safety',
      score: analysis.formattingScore ?? (analysis.formattingIssues?.length > 0 ? 70 : 94),
      icon: FileCheck,
      color: '#10b981',
    },
  ];

  const handleCopySuggestion = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const suggestions = analysis.suggestions || analysis.experienceImprovements || [];
  const missingSkills = analysis.missingSkills || analysis.skillRecommendations || [];
  const formattingIssues = analysis.formattingIssues || [];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={20} color={statusColor} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>ATS Compliance Intelligence</h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                background: statusBg,
                color: statusColor,
                border: `1px solid ${statusBorder}`,
              }}
            >
              {statusLabel}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Target Role: <strong style={{ color: 'var(--text-primary)' }}>{targetRole || analysis.jobTitle || 'Senior Software Engineer'}</strong> • {statusVerdict}
          </p>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
          Engine: <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{analysis.modelUsed || 'gemini-1.5-flash'}</span>
        </div>
      </div>

      {/* Main Gauge & Dimensions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', alignItems: 'center' }}>
        {/* Left: Animated Circular Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px' }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="10"
              />
              {/* Animated Value Arc */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={statusColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>

            {/* Inner Score Text */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
                {score}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                OUT OF 100
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: statusColor }}>
              {score >= 80 ? '✓ Ready for Application' : score >= 60 ? '⚡ Improvements Recommended' : '⚠ Significant Gaps Detected'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Simulates Greenhouse & Workday ATS Filters
            </div>
          </div>
        </div>

        {/* Right: 5 Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            5-Factor ATS Dimension Breakdown
          </div>

          {dimensions.map((dim, idx) => {
            const Icon = dim.icon;
            const barWidth = `${Math.min(100, Math.max(5, dim.score))}%`;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <Icon size={14} color={dim.color} />
                    {dim.label}
                  </span>
                  <span style={{ fontWeight: 700, color: dim.color }}>{dim.score}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: barWidth,
                      height: '100%',
                      background: dim.color,
                      borderRadius: '3px',
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Improvement Recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-400)', fontWeight: 700, fontSize: '0.9rem' }}>
          <Sparkles size={16} />
          <span>Priority Action Checklist (To Reach 95+ ATS Score)</span>
        </div>

        {/* Missing Keywords Badges */}
        {missingSkills.length > 0 && (
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={14} /> Missing Core Keywords Found in Target Job Postings:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {missingSkills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                  }}
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formatting Flags */}
        {formattingIssues.length > 0 && (
          <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertCircle size={14} /> Parser Compatibility Flags:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {formattingIssues.map((issue, fIdx) => (
                <li key={fIdx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actionable Concrete Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--bg-secondary)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--primary-400)', fontWeight: 800 }}>{idx + 1}.</span>
                <span>{sug}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopySuggestion(sug, idx)}
                className="btn btn-xs btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  flexShrink: 0,
                  borderRadius: '6px',
                }}
                title="Copy suggestion to clipboard"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check size={12} color="#10b981" />
                    <span style={{ color: '#10b981' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AtsScoreGauge;
