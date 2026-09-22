import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Activity, TrendingUp, Globe } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';

/**
 * MarketplaceStatsCard — Dashboard card showing job aggregation health metrics.
 * Displays total jobs from each source, last sync time, and animated counters.
 */

const SOURCE_COLORS = {
    INTERNAL: { color: '#10b981', label: 'HireHub' },
    ADZUNA: { color: '#0ea5e9', label: 'Adzuna' },
    GREENHOUSE: { color: '#84cc16', label: 'Greenhouse' },
    LEVER: { color: '#8b5cf6', label: 'Lever' },
};

export default function MarketplaceStatsCard({ className = '' }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [animatedTotal, setAnimatedTotal] = useState(0);

    useEffect(() => {
        loadStats();
    }, []);

    // Animated counter effect
    useEffect(() => {
        if (stats?.totalJobs) {
            const target = stats.totalJobs;
            const duration = 1200;
            const steps = 40;
            const stepMs = duration / steps;
            let current = 0;
            const increment = target / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setAnimatedTotal(target);
                    clearInterval(timer);
                } else {
                    setAnimatedTotal(Math.floor(current));
                }
            }, stepMs);

            return () => clearInterval(timer);
        }
    }, [stats?.totalJobs]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await marketplaceService.getStats();
            setStats(data);
        } catch (err) {
            console.warn('Could not load marketplace stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Never';
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className={className} style={cardStyles}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Loading marketplace stats...</span>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className={className} style={cardStyles}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Globe size={16} color="white" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>
                            Job Marketplace
                        </h3>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                            Aggregated from {stats.activeSourceCount || 0} sources
                        </p>
                    </div>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', borderRadius: '9999px', fontSize: '10px',
                    fontWeight: '600', letterSpacing: '0.05em',
                    background: stats.lastSyncStatus === 'COMPLETED'
                        ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                    color: stats.lastSyncStatus === 'COMPLETED' ? '#10b981' : '#fbbf24',
                }}>
                    <Activity size={10} />
                    {stats.lastSyncStatus || 'IDLE'}
                </div>
            </div>

            {/* Total Counter */}
            <div style={{ textAlign: 'center', margin: '12px 0 16px' }}>
                <div style={{
                    fontSize: '36px', fontWeight: '800', lineHeight: 1,
                    background: 'linear-gradient(135deg, #10b981, #6366f1)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    {animatedTotal.toLocaleString()}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    Active Jobs Across All Sources
                </p>
            </div>

            {/* Source Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stats.jobsBySource && Object.entries(stats.jobsBySource).map(([source, count]) => {
                    const config = SOURCE_COLORS[source] || { color: '#6b7280', label: source };
                    const percentage = stats.totalJobs > 0 ? (count / stats.totalJobs) * 100 : 0;

                    return (
                        <div key={source} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                backgroundColor: config.color, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: '12px', color: '#d1d5db', flex: 1 }}>
                                {config.label}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f3f4f6' }}>
                                {count.toLocaleString()}
                            </span>
                            <div style={{
                                width: '40px', height: '4px', borderRadius: '2px',
                                backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${percentage}%`, height: '100%',
                                    borderRadius: '2px', backgroundColor: config.color,
                                    transition: 'width 0.8s ease',
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Last Sync Info */}
            <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    Last sync: {formatTimeAgo(stats.lastSyncAt)}
                </span>
                {stats.lastSyncJobsFetched > 0 && (
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        <TrendingUp size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        {stats.lastSyncJobsFetched} fetched
                    </span>
                )}
            </div>
        </div>
    );
}

const cardStyles = {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    transition: 'all 0.3s ease',
};
