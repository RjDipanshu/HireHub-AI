import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Cpu,
  Server,
  Activity,
  Zap,
  Users,
  Briefcase,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <BarChart3 size={26} color="var(--primary-400)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>System Telemetry & Platform Analytics</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Comprehensive telemetry on Google Gemini AI usage, application velocity, and system throughput.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn btn-xs ${timeRange === range ? 'btn-primary' : 'btn-outline'}`}
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {/* AI Engine Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card card-ai">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Cpu size={20} color="var(--primary-300)" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Gemini Operations</h3>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.4rem 0' }}>
            {timeRange === '7d' ? '34,210' : timeRange === '30d' ? '142,850' : '418,900'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            ATS analyses & interview sessions
          </p>
        </div>

        <div className="card card-ai">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Activity size={20} color="#10b981" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Avg. Inference Latency</h3>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', margin: '0.4rem 0' }}>
            540 ms
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Gemini 1.5 Flash roundtrip time
          </p>
        </div>

        <div className="card card-ai">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Server size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Backend REST Traffic</h3>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#06b6d4', margin: '0.4rem 0' }}>
            {timeRange === '7d' ? '210k' : timeRange === '30d' ? '948k' : '2.8M'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Spring Boot API requests served
          </p>
        </div>

        <div className="card card-ai">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Zap size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Fallback Circuit Rate</h3>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', margin: '0.4rem 0' }}>
            0.12%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Graceful heuristic activations
          </p>
        </div>
      </div>

      {/* Funnel Progress Breakdown & Platform Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary-400)" /> Recruitment Funnel Conversion
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Job Discoveries & Views</span>
                <span style={{ fontWeight: 600 }}>100% (24,500)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'var(--primary-500)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Applications Submitted</span>
                <span style={{ fontWeight: 600 }}>24.8% (6,080)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '24.8%', background: '#8b5cf6', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>AI Ranked & Shortlisted</span>
                <span style={{ fontWeight: 600 }}>8.2% (2,010)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '8.2%', background: '#06b6d4', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Interviews Scheduled</span>
                <span style={{ fontWeight: 600 }}>3.4% (830)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '3.4%', background: '#10b981', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Utilization */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary-300)" /> AI Feature Utilization Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Resume ATS Analysis & Scoring</span>
                <span style={{ fontWeight: 600 }}>48% (68,568 invocations)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '48%', background: 'var(--primary-400)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Cover Letter Studio Generation</span>
                <span style={{ fontWeight: 600 }}>24% (34,284 invocations)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '24%', background: '#ec4899', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Technical Interview Simulation</span>
                <span style={{ fontWeight: 600 }}>18% (25,713 invocations)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '18%', background: '#10b981', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Recruiter Job Description & Applicant Ranking</span>
                <span style={{ fontWeight: 600 }}>10% (14,285 invocations)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '10%', background: '#f59e0b', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
