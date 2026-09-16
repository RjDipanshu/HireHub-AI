import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileCheck, AlertCircle, CheckCircle2, Shield, Printer, ExternalLink } from 'lucide-react';

export const TermsOfServicePage = () => {
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
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--color-primary, #6366f1)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
          }}>
            <Scale size={14} /> Legal Agreement
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Terms of Service
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
          id="terms-print-btn"
        >
          <Printer size={15} /> Print Terms
        </button>
      </div>

      {/* Summary Box */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={18} color="var(--color-primary, #6366f1)" /> Key Summary of Platform Terms
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          By creating an account or accessing HireHub AI, you agree to these Terms of Service. These terms govern candidate job applications, employer recruitment tools, AI-assisted resume scoring, and platform access. Please read them thoroughly.
        </p>
      </div>

      {/* Articles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            1. Acceptance of Terms & Eligibility
          </h3>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you and HireHub AI ("Platform", "we", "us"). You must be at least 18 years of age or the age of majority in your jurisdiction to establish an account or submit applications.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            2. User Accounts & Role Permissions
          </h3>
          <p>
            When registering an account, you must provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your credentials:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Candidate Accounts:</strong> Intended solely for individual job seekers seeking genuine employment opportunities.</li>
            <li><strong>Recruiter & Employer Accounts:</strong> Authorized solely for verified business entities and recruiters posting active, genuine vacancies.</li>
            <li><strong>Role Integrity:</strong> Any attempt to impersonate another individual, misrepresent corporate affiliation, or deploy scraping bots will result in immediate termination.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            3. Employer Job Posting Standards
          </h3>
          <p>
            Organizations posting vacancies agree to maintain strict workplace compliance:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>All jobs must represent genuine, active employment openings with realistic compensation and requirements.</li>
            <li>Postings that require upfront applicant fees, multi-level marketing (MLM), or discriminatory hiring criteria based on race, gender, religion, or disability are strictly banned.</li>
            <li>HireHub AI reserves the right to unpublish or suspend job postings that fail moderation reviews.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            4. Artificial Intelligence & Automated Scoring Disclaimer
          </h3>
          <p>
            HireHub AI provides AI-assisted resume scoring, match percentages, and automated candidate summaries using Google Gemini Pro. You acknowledge and agree that:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>AI match scores are informational assistive indicators intended to supplement human decision-making, not replace comprehensive hiring evaluation.</li>
            <li>HireHub AI does not guarantee employment offers, interview invitations, or successful hiring outcomes.</li>
            <li>Employers remain solely responsible for ultimate employment decisions and non-discriminatory candidate selection.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            5. Intellectual Property & User Content License
          </h3>
          <p>
            You retain all ownership rights in your uploaded resumes, company logos, and profile descriptions. By posting on HireHub AI, you grant us a limited, non-exclusive license to store, process, format, and display your content solely for the purpose of operating the recruitment platform.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            6. Limitation of Liability
          </h3>
          <p>
            To the maximum extent permitted by law, HireHub AI and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the platform, including lost career opportunities or recruitment downtime.
          </p>
        </section>

        <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            7. Contact & Legal Notices
          </h3>
          <p>
            If you have questions regarding these Terms or wish to serve legal notice, please contact our legal counsel:
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
            <div><strong>HireHub AI Legal Department</strong></div>
            <div>Email: <a href="mailto:legal@hirehub.ai" style={{ color: 'var(--color-primary)' }}>legal@hirehub.ai</a></div>
            <div>Customer Helpdesk: <Link to="/help" style={{ color: 'var(--color-primary)' }}>HireHub Support Center</Link></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
