import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, FileSearch, CheckCircle2, ArrowRight, BrainCircuit, Users, Award } from 'lucide-react';
import AiSparkleCard from '../../components/ai/AiSparkleCard';
import { useAuth } from '../../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated, role } = useAuth();
  const recruiterCtaPath = !isAuthenticated
    ? '/register'
    : (role === 'RECRUITER' || role === 'ADMIN')
      ? '/recruiter/jobs/new'
      : '/recruiter/dashboard';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '4rem 1.5rem 2rem',
        maxWidth: 'var(--container-max-width)',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Announcement Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: '#e8f3fc',
          border: '1px solid #c8e1f9',
          marginBottom: '1.75rem',
          fontSize: '0.825rem',
          color: 'var(--color-primary)',
          fontWeight: 600,
        }}>
          <Sparkles size={14} color="var(--color-primary)" /> Powered by Google Gemini AI & Supabase
        </div>

        <h1 style={{
          fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: '900px',
          margin: '0 auto 1.25rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
        }}>
          Where Top Talent Meets <br />
          <span style={{ color: 'var(--color-primary)' }}>Intelligent Recruitment</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          maxWidth: '650px',
          margin: '0 auto 2.25rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          Accelerate your career with instant resume scoring and AI cover letters, or empower your hiring pipeline with automated candidate match intelligence.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link to="/jobs" className="btn btn-primary btn-lg">
            Explore 1,200+ Jobs <ArrowRight size={18} />
          </Link>
          <Link to={recruiterCtaPath} className="btn btn-secondary btn-lg">
            Post Jobs as Recruiter
          </Link>
        </div>

        {/* Key Metrics / Proof */}
        <div style={{
          marginTop: '3.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          maxWidth: '950px',
          margin: '3.5rem auto 0',
        }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
              94%
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>ATS Match Accuracy</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#057642', marginBottom: '0.2rem' }}>
              10x
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Faster Screening Cycles</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              50k+
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Interviews Scheduled</p>
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-ai" style={{ marginBottom: '0.75rem' }}>Next-Gen Intelligence</span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Intelligence in Every Step of the Funnel</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Supercharge candidate preparation and streamline employer decision-making with custom LLM pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AiSparkleCard
            title="AI Resume Intelligence"
            description="Extract keywords, compute instant ATS compatibility scores, and receive pinpoint feedback to stand out to hiring managers."
            to="/candidate/ai-tools"
            actionLabel="Analyze Resume"
            icon={FileSearch}
          />
          <AiSparkleCard
            title="AI Candidate Ranking"
            description="Recruiters automatically rank hundreds of incoming applications against custom job requirements in seconds."
            to="/recruiter/dashboard"
            actionLabel="Recruiter Ranking"
            icon={BrainCircuit}
          />
          <AiSparkleCard
            title="Mock Interview Simulator"
            description="Prepare with custom behavioral and technical interview questions tuned precisely to the target role and seniority."
            to="/candidate/ai-tools"
            actionLabel="Start Prep"
            icon={Award}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
