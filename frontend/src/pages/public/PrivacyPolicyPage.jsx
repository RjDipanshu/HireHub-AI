import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle2, AlertCircle, Mail, Printer, ExternalLink } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  const lastUpdated = "September 12, 2026";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '2rem',
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
          }}>
            <Shield size={14} /> Trust & Transparency
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Effective Date: January 1, 2026 • Last Revised: <strong>{lastUpdated}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          id="privacy-print-btn"
        >
          <Printer size={15} /> Print Policy
        </button>
      </div>

      {/* Key Highlights Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="var(--color-primary, #6366f1)" /> Our Core Privacy Commitments
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Zero Data Monetization:</strong> We never sell, lease, or broker your candidate resume or contact information to third parties.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Private AI Inferences:</strong> Your resume and profile are processed via private Google Gemini enterprise API calls without training public models.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Database Encryption:</strong> Row-Level Security (RLS) and AES-256 encryption isolate your profile across all storage buckets.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Full Control & Deletion:</strong> You can export or permanently delete your account, resume files, and telemetry at any time.</span>
          </div>
        </div>
      </div>

      {/* Main Body Articles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            1. Information We Collect
          </h3>
          <p>
            When you register for or interact with HireHub AI, we collect personal and professional information necessary to deliver our career acceleration and recruitment matching services:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Account Identity:</strong> Full name, email address, phone number, encrypted password credentials, and designated account role (Candidate, Recruiter, Administrator).</li>
            <li><strong>Candidate Profile & Resume Data:</strong> Career history, educational background, technical proficiencies, portfolio links, target salary expectations, and uploaded resume documents (PDF, DOCX).</li>
            <li><strong>Employer & Job Information:</strong> Organization name, company domain, verified corporate email, job postings, salary ranges, and applicant evaluation notes.</li>
            <li><strong>Technical Telemetry:</strong> Anonymized session logs, device information, browser user-agent, IP address, and interaction analytics to prevent malicious automated access.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            2. Artificial Intelligence & Resume Processing
          </h3>
          <p>
            HireHub AI incorporates Large Language Model capabilities via Google Gemini to provide semantic ATS matching, resume optimization recommendations, and applicant ranking. We adhere strictly to responsible AI principles:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Inbound resume parsing and match generation take place over TLS 1.3 encrypted enterprise API channels.</li>
            <li>Candidate personal identifiers (such as national identity numbers or private home addresses) are stripped before semantic matching evaluation.</li>
            <li>We do <em>not</em> utilize proprietary user resumes to train general public generative models.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            3. How We Use and Disclose Information
          </h3>
          <p>
            We process your data strictly to facilitate authentic recruitment connections:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Application Sharing:</strong> When a candidate submits an application for a specific job, their profile and attached resume are made accessible exclusively to that job's verified recruiter and authorized hiring team.</li>
            <li><strong>Platform Communications:</strong> We send transactional alerts regarding interview schedules, application status changes, and critical security notices. You may customize marketing preferences in your account settings.</li>
            <li><strong>Legal & Compliance:</strong> We disclose account information only when required by valid court order, government subpoena, or to protect the vital security of our community against fraud.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            4. Data Retention and Security Architecture
          </h3>
          <p>
            All user data is stored within hardened PostgreSQL databases hosted on secure cloud infrastructure with automated snapshots. Authentication tokens and refresh cookies are signed with cryptographically secure JSON Web Tokens (JWT). We retain your career records as long as your account remains active; you may request account deprecation at any time.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            5. Your Rights & Data Subject Access
          </h3>
          <p>
            In compliance with the Digital Personal Data Protection (DPDP) Act and the General Data Protection Regulation (GDPR), you retain the following rights:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Right to Access:</strong> View all stored personal profile fields and application history through your portal.</li>
            <li><strong>Right to Rectification:</strong> Edit or update any inaccurate career details in real-time.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete deletion of your account and associated resume files by emailing our privacy team.</li>
          </ul>
        </section>

        <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            6. Contact Our Data Protection Officer
          </h3>
          <p>
            For questions regarding this policy, data subject requests, or security disclosures, please reach out to our privacy compliance team:
          </p>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'inline-flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.9rem',
          }}>
            <div><strong>HireHub AI Global Privacy Office</strong></div>
            <div>Email: <a href="mailto:privacy@hirehub.ai" style={{ color: 'var(--color-primary)' }}>privacy@hirehub.ai</a></div>
            <div>Support Ticket: <Link to="/help" style={{ color: 'var(--color-primary)' }}>Open a Support Request</Link></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
