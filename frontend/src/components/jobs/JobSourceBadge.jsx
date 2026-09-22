import React from 'react';

/**
 * JobSourceBadge — Visual badge showing the origin source of a job listing.
 * Displays a colored badge with source icon/label for each job source type.
 *
 * Source Types:
 * - INTERNAL (HireHub) — Emerald green
 * - ADZUNA — Sky blue
 * - GREENHOUSE — Lime green
 * - LEVER — Violet purple
 */

const SOURCE_CONFIG = {
    INTERNAL: {
        label: 'HireHub',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.25)',
        icon: '✦',
    },
    ADZUNA: {
        label: 'Adzuna',
        color: '#0ea5e9',
        bgColor: 'rgba(14, 165, 233, 0.12)',
        borderColor: 'rgba(14, 165, 233, 0.25)',
        icon: '◆',
    },
    GREENHOUSE: {
        label: 'Greenhouse',
        color: '#84cc16',
        bgColor: 'rgba(132, 204, 22, 0.12)',
        borderColor: 'rgba(132, 204, 22, 0.25)',
        icon: '●',
    },
    LEVER: {
        label: 'Lever',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.12)',
        borderColor: 'rgba(139, 92, 246, 0.25)',
        icon: '▲',
    },
};

const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.025em',
    lineHeight: '1.5',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    border: '1px solid',
};

export default function JobSourceBadge({ sourceType, size = 'sm', showIcon = true }) {
    const config = SOURCE_CONFIG[sourceType] || SOURCE_CONFIG.INTERNAL;

    const sizeStyles = {
        xs: { fontSize: '10px', padding: '1px 6px' },
        sm: { fontSize: '11px', padding: '2px 8px' },
        md: { fontSize: '12px', padding: '3px 10px' },
        lg: { fontSize: '13px', padding: '4px 12px' },
    };

    return (
        <span
            style={{
                ...badgeStyles,
                ...sizeStyles[size],
                color: config.color,
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
            }}
            title={`Source: ${config.label}`}
        >
            {showIcon && <span style={{ fontSize: size === 'xs' ? '8px' : '10px' }}>{config.icon}</span>}
            {config.label}
        </span>
    );
}
