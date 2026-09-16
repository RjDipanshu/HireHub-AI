import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Zap, 
  Building2, 
  Globe2, 
  Lock, 
  Briefcase 
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: 'var(--color-primary, #6366f1)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
        }}>
          <Sparkles size={16} /> Empowering Global Talent & Modern Hiring
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.18,
          color: 'var(--text-primary, #0f172a)',
          marginBottom: '1.25rem',
        }}>
          Transforming Recruitment Through <span style={{ color: 'var(--color-primary, #6366f1)' }}>Artificial Intelligence</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary, #64748b)',
          lineHeight: 1.65,
          margin: '0 auto 2.5rem',
        }}>
          HireHub AI bridges the gap between ambitious professionals and top global enterprises. By combining Google Gemini LLMs, real-time ATS scoring, and automated pipeline intelligence, we eliminate the friction of traditional job hunting and talent acquisition.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/jobs" className="btn btn-primary btn-lg" id="about-explore-jobs-btn">
            Explore 1,200+ Jobs <ArrowRight size={18} />
          </Link>
          <Link to="/register" className="btn btn-secondary btn-lg" id="about-join-platform-btn">
            Join Platform
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        margin: '2rem 0 5rem',
      }}>
        {[
          { label: 'ATS Match Accuracy', val: '94.2%', desc: 'Gemini-powered semantic scoring benchmarked against top ATS parsers' },
          { label: 'Active Open Jobs', val: '1,200+', desc: 'Verified tech, product, and leadership roles across India & Remote' },
          { label: 'Partner Companies', val: '450+', desc: 'From fast-growing Series A startups to Fortune 500 multinationals' },
          { label: 'Avg. Time-to-Hire Reduction', val: '62%', desc: 'Accelerated recruiter screening with AI candidate matching' },
        ].map((m, idx) => (
          <div key={idx} className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary, #6366f1)', marginBottom: '0.4rem' }}>
              {m.val}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {m.desc}
            </div>
          </div>
        ))}
      </section>

      {/* Core Mission & Pillars */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Why We Built HireHub AI
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Hiring has been broken for over a decade. Resumes vanish into corporate ATS black holes, while hiring managers drown in thousands of unqualified applicants. We engineered a solution built on meritocracy, speed, and fairness.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <BrainCircuit size={26} color="var(--color-primary, #6366f1)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              For Candidates: Zero Guesswork
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Stop applying blindly. HireHub analyzes your resume in real-time against any job description, generates custom cover letters, highlights skill gaps, and recommends targeted salary expectations.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Instant ATS match score (0-100%)', 'One-click AI cover letter customization', 'Peer salary benchmarks across Indian tech hubs'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="#10b981" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <Users size={26} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              For Employers: Predictive Screening
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Cut your applicant screening time by over 60%. Our algorithms automatically rank inbound applicants, generate interview scorecards, and provide structured communication workflows.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['AI candidate stack-ranking with match justification', '1-click interview scheduling & status management', 'Full pipeline analytics with GDPR/DPDP compliance'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="#10b981" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <ShieldCheck size={26} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Enterprise Security & Privacy
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Your data is never sold or used to train third-party public models. Built on Supabase Row-Level Security and encrypted PostgreSQL storage to meet rigorous privacy standards.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Row-Level Security (RLS) candidate isolation', 'AES-256 encrypted resume storage', 'Zero third-party commercial data scraping'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="#10b981" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack & Engineering Architecture */}
      <section className="card" style={{ padding: '3rem 2rem', marginBottom: '5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Powered by Modern Engineering
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            A state-of-the-art cloud architecture designed for sub-second latency, enterprise fault tolerance, and high-concurrency screening.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            { title: 'Google Gemini Pro', role: 'LLM Reasoning & ATS scoring', icon: Sparkles, col: '#6366f1' },
            { title: 'Spring Boot 3.3', role: 'High-throughput microservices', icon: Zap, col: '#10b981' },
            { title: 'Supabase & Postgres', role: 'Auth & RLS database', icon: Lock, col: '#3b82f6' },
            { title: 'React 18 & Vite', role: 'Optimized SPA frontend', icon: Globe2, col: '#8b5cf6' },
          ].map((tech, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}>
              <tech.icon size={28} color={tech.col} style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {tech.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {tech.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '16px',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        color: '#ffffff',
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Ready to Elevate Your Career or Hiring?
        </h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6 }}>
          Join thousands of candidates finding dream roles and recruiters building high-performing teams with HireHub AI.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-lg" style={{ background: '#ffffff', color: '#4f46e5', fontWeight: 700 }}>
            Create Free Account
          </Link>
          <Link to="/salaries" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#ffffff' }}>
            View Salary Insights
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
