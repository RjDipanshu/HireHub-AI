import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Sparkles, Mail, Send, CheckCircle2, Shield, HelpCircle, FileText } from 'lucide-react';

export const Footer = () => {
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscriberEmail.trim()) {
      setSubscribed(true);
      setSubscriberEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '3.5rem 2rem 2rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 'var(--container-max-width, 1200px)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
      }}>
        {/* Brand & Newsletter Column */}
        <div style={{ maxWidth: '320px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--color-primary, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              HireHub <span style={{ color: 'var(--color-primary, #6366f1)' }}>AI</span>
            </span>
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Enterprise recruitment and career acceleration platform powered by Google Gemini AI & Supabase.
          </p>

          {/* Quick Newsletter Box */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Stay Updated with Hiring Trends
            </div>
            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600, padding: '0.4rem 0' }}>
                <CheckCircle2 size={16} /> Subscribed to weekly insights!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="email"
                  required
                  className="input"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  placeholder="Enter your email..."
                  style={{ height: '36px', fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  title="Subscribe"
                  style={{ height: '36px', padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Candidates Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            For Candidates
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li>
              <Link to="/jobs" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Browse 1,200+ Jobs
              </Link>
            </li>
            <li>
              <Link to="/salaries" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Salary Insights (India & Remote)
              </Link>
            </li>
            <li>
              <Link to="/candidate/ai-tools" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                AI Resume Analyzer
              </Link>
            </li>
            <li>
              <Link to="/candidate/ai-tools" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Cover Letter Generator
              </Link>
            </li>
            <li>
              <Link to="/candidate/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Candidate Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Recruiters Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            For Employers
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li>
              <Link to="/recruiter/jobs/new" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Post a Job
              </Link>
            </li>
            <li>
              <Link to="/recruiter/candidates" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                AI Candidate Search & Ranking
              </Link>
            </li>
            <li>
              <Link to="/recruiter/interviews" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Interview Scheduling
              </Link>
            </li>
            <li>
              <Link to="/recruiter/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Recruiter Command Center
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Employer Signup
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Platform
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li>
              <Link to="/about" id="footer-about-link" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                About HireHub
              </Link>
            </li>
            <li>
              <Link to="/help" id="footer-help-link" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Help & Support Center
              </Link>
            </li>
            <li>
              <Link to="/privacy" id="footer-privacy-link" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" id="footer-terms-link" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright & attribution */}
      <div style={{
        maxWidth: 'var(--container-max-width, 1200px)',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.825rem',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <span>© {new Date().getFullYear()} HireHub AI. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy</Link>
          <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</Link>
          <Link to="/help" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Support</Link>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for modern hiring teams
        </span>
      </div>
    </footer>
  );
};

export default Footer;
