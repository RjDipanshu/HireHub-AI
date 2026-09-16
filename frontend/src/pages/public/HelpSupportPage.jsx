import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Mail, 
  CheckCircle2, 
  LifeBuoy, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Briefcase, 
  Clock, 
  PhoneCall 
} from 'lucide-react';

export const HelpSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Ticket submission state
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    category: 'TECHNICAL',
    subject: '',
    message: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const faqData = [
    {
      id: 0,
      category: 'AI',
      question: 'How does the AI Resume Match Score work?',
      answer: 'Our scoring engine leverages Google Gemini Pro to evaluate semantic relevance, key technical proficiencies, seniority level, and contextual project impact directly against the employer’s job description. Rather than simple keyword counting, it models ATS compatibility on a 0-100% scale with actionable improvement tips.',
    },
    {
      id: 1,
      category: 'ACCOUNT',
      question: 'How can I switch profiles between Candidate, Recruiter, and Admin?',
      answer: 'You can instantly switch profiles from either the top navigation bar or the dashboard header dropdown. Click on your active role badge (e.g., "CANDIDATE") to reveal the "Switch Profile" menu and choose any portal. Your session will transition seamlessly without requiring you to log out.',
    },
    {
      id: 2,
      category: 'EMPLOYERS',
      question: 'How do employers post a job and review applicant rankings?',
      answer: 'Once logged in to the Recruiter Portal, click "Post a Job" or navigate to /recruiter/jobs/new. Fill in the job title, compensation range, experience level, and required skills. Applicants will be automatically stack-ranked by our Gemini AI matching engine based on their resumes, allowing you to invite top candidates to interviews in 1 click.',
    },
    {
      id: 3,
      category: 'SECURITY',
      question: 'Is my resume and personal contact information private?',
      answer: 'Yes. We enforce Supabase Row-Level Security (RLS) across all PostgreSQL tables. Candidate resumes are encrypted with AES-256 and only shared with verified employers whose jobs you explicitly apply to. We never sell, lease, or scrape your career data for third-party advertisers.',
    },
    {
      id: 4,
      category: 'CANDIDATES',
      question: 'How do I generate an AI-tailored cover letter for a specific job?',
      answer: 'Navigate to any job details page and click "AI Cover Letter" or visit your Candidate Portal -> AI Tools. Select the target position and your active resume; our Gemini integration will construct a tailored, professional cover letter highlighting your relevant experience in seconds.',
    },
    {
      id: 5,
      category: 'EMPLOYERS',
      question: 'How does interview scheduling work on HireHub AI?',
      answer: 'Recruiters can navigate to the "Applicants" or "Interviews" tab in their portal, pick an applicant, and click "Schedule Interview". Set the proposed date, time, and meeting link. The candidate receives an instant notification with status tracking.',
    },
    {
      id: 6,
      category: 'ACCOUNT',
      question: 'What should I do if I forget my password or get locked out?',
      answer: 'Visit the Sign In page and click "Forgot Password?", enter your registered email address, and you will receive a secure password reset link via Supabase Auth within seconds.',
    },
  ];

  const filteredFaqs = faqData.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.email || !ticketForm.message) return;
    const randomId = 'HH-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(randomId);
    setTicketSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Header & Search */}
      <section style={{ textAlign: 'center', padding: '3rem 1rem 2.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--color-primary, #6366f1)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
        }}>
          <LifeBuoy size={16} /> 24/7 HireHub Support Center
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          How Can We Help You Today?
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Search our knowledge base for answers or reach out directly to our customer operations engineering team.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            id="support-search-input"
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. AI Resume, Profile Switch, Interview)..."
            style={{
              paddingLeft: '48px',
              paddingRight: '1rem',
              height: '52px',
              fontSize: '1rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
            }}
          />
        </div>
      </section>

      {/* Quick Category Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        margin: '1.5rem 0 3.5rem',
      }}>
        {[
          { key: 'ALL', label: 'All Questions', icon: HelpCircle, count: '7 Guides' },
          { key: 'CANDIDATES', label: 'For Candidates', icon: Users, count: 'Resumes & Matching' },
          { key: 'EMPLOYERS', label: 'For Employers', icon: Briefcase, count: 'Jobs & Candidates' },
          { key: 'AI', label: 'AI & Scoring', icon: Sparkles, count: 'Gemini Engine' },
          { key: 'SECURITY', label: 'Security & RLS', icon: ShieldCheck, count: 'Privacy & Data' },
        ].map((cat) => {
          const isSelected = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className="card"
              style={{
                padding: '1.25rem',
                textAlign: 'left',
                border: isSelected ? '2px solid var(--color-primary, #6366f1)' : '1px solid #e2e8f0',
                background: isSelected ? 'rgba(99, 102, 241, 0.04)' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <cat.icon size={22} color={isSelected ? 'var(--color-primary, #6366f1)' : '#64748b'} style={{ marginBottom: '0.6rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--color-primary, #6366f1)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {cat.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {cat.count}
              </div>
            </button>
          );
        })}
      </section>

      {/* Main Content Grid: FAQ Accordion + Contact Support Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Left Column: FAQs */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Frequently Asked Questions
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <HelpCircle size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No matching answers found for "{searchQuery}". You can submit a support ticket on the right!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      border: isOpen ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.15rem 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        gap: '1rem',
                      }}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp size={18} color="var(--color-primary)" /> : <ChevronDown size={18} color="#94a3b8" />}
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 1.25rem 1.25rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '0.85rem',
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Help Contacts Box */}
          <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Direct Support Channels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem' }}>
                <Mail size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 600 }}>Email:</span>
                <a href="mailto:support@hirehub.ai" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>support@hirehub.ai</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem' }}>
                <Clock size={16} color="#10b981" />
                <span style={{ fontWeight: 600 }}>Hours:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Mon - Sat, 9:00 AM - 8:00 PM IST</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem' }}>
                <ShieldCheck size={16} color="#2563eb" />
                <span style={{ fontWeight: 600 }}>SLA:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Median response under 2 hours for priority inquiries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Support / Ticket Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Send size={18} color="var(--color-primary, #6366f1)" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Submit a Support Ticket
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Encountered an issue or have a feature suggestion? Our technical operations team will follow up directly via email.
          </p>

          <div style={{
            background: 'var(--color-primary-light, #e8f3fc)',
            border: '1px solid #c8e1f9',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Track all your tickets & real-time updates in our Help & Support Center
            </span>
            <Link to="/support" className="btn btn-primary btn-sm" style={{ flexShrink: 0, textDecoration: 'none' }}>
              Open Support
            </Link>
          </div>

          {ticketSubmitted ? (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <CheckCircle2 size={42} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#065f46', marginBottom: '0.35rem' }}>
                Ticket Submitted Successfully!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#047857', marginBottom: '1rem' }}>
                Your reference ID is <strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{ticketId}</strong>. A confirmation has been routed to <strong>{ticketForm.email}</strong>.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setTicketSubmitted(false);
                  setTicketForm({ name: '', email: '', category: 'TECHNICAL', subject: '', message: '' });
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  id="ticket-name"
                  type="text"
                  required
                  className="input"
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  placeholder="e.g. Alex Sharma"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  id="ticket-email"
                  type="email"
                  required
                  className="input"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Issue Category
                </label>
                <select
                  id="ticket-category"
                  className="input"
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                >
                  <option value="TECHNICAL">Technical Glitch / Bug</option>
                  <option value="AI_RESUME">AI Resume Analyzer & Match Scoring</option>
                  <option value="ACCOUNT">Account, Role Switch & Login</option>
                  <option value="RECRUITER">Recruiter Job Posting & Interview Portal</option>
                  <option value="BILLING">Billing, Payments & Enterprise Plan</option>
                  <option value="FEEDBACK">General Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Subject
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  required
                  className="input"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Brief description of the problem"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Detailed Description *
                </label>
                <textarea
                  id="ticket-message"
                  required
                  rows={4}
                  className="input"
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  placeholder="Please provide steps to reproduce or explain what you were doing when the issue occurred..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                id="ticket-submit-btn"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Send size={16} /> Send Ticket to Support
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
