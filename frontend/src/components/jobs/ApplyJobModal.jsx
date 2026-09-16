import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import candidateService from '../../services/candidateService';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Sparkles, FileText, CheckCircle2, AlertCircle, Upload, Check } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export const ApplyJobModal = ({ job, isOpen, onClose, onAppliedSuccess }) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setSubmitted(false);
    setErrorMsg('');

    const fetchResumes = async () => {
      setLoadingResumes(true);
      try {
        const data = await candidateService.getResumes();
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        // Select primary resume by default
        const primary = list.find((r) => r.isPrimary) || list[0];
        if (primary) {
          setSelectedResumeId(primary.id);
        }
      } catch (err) {
        console.warn('Could not fetch candidate resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchResumes();
  }, [isOpen]);

  // Keyboard navigation (Escape to close) and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const handleGenerateAiCoverLetter = async () => {
    setGeneratingAI(true);
    setErrorMsg('');
    try {
      const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
      const res = await aiService.generateCoverLetter({
        jobTitle: job.title,
        companyName: job.companyName || 'the hiring organization',
        keySkills: skills,
      });
      const generated = res?.coverLetter || res?.content || res;
      if (typeof generated === 'string') {
        setCoverLetter(generated);
      }
    } catch (err) {
      // Fallback generator
      setCoverLetter(
        `Dear Hiring Team at ${job.companyName || 'your organization'},\n\nI am writing to express my strong interest in the ${job.title} role. With my background building scalable systems, modern frontends, and resilient cloud architectures, I am confident in my ability to deliver immediate value to your team.\n\nMy technical expertise aligns with your requirements in ${((job.requiredSkills || ['modern engineering']).slice(0, 4)).join(', ')}. I thrive in high-impact environments and am eager to contribute to your engineering goals.\n\nThank you for considering my application. I look forward to the opportunity to discuss how my skill set aligns with your objectives.\n\nBest regards,\n${user?.firstName || 'Candidate'}`
      );
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const answersPayload = Object.keys(screeningAnswers).length > 0 ? screeningAnswers : undefined;
      await applicationService.applyForJob({
        jobId: job.id,
        resumeId: selectedResumeId || undefined,
        coverLetter: coverLetter.trim() || undefined,
        screeningAnswers: answersPayload,
      });

      setSubmitted(true);
      if (onAppliedSuccess) {
        onAppliedSuccess(job.id);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to submit application. You may have already applied for this role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-job-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem',
            minHeight: '36px',
            minWidth: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>


        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Your application for <strong>{job.title}</strong> at <strong>{job.companyName}</strong> has been received.
              You can track its hiring pipeline status in real-time.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <Link to="/candidate/applications" className="btn btn-primary btn-sm" onClick={onClose}>
                Track Applications
              </Link>
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                {job.companyName}
              </span>
              <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
                Apply for {job.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {job.location} • {job.workMode} • {job.employmentType?.replace('_', ' ')}
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {/* Resume Selection */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Select Resume <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <Link
                  to="/candidate/profile"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--primary-400)', textDecoration: 'none' }}
                >
                  + Upload New Resume
                </Link>
              </div>

              {loadingResumes ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading your resumes...</div>
              ) : resumes.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-subtle)',
                    textAlign: 'center',
                    background: 'var(--bg-tertiary)',
                  }}
                >
                  <FileText size={24} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    No resumes on file. Please upload a resume to your profile.
                  </div>
                  <Link to="/candidate/profile" className="btn btn-outline btn-xs">
                    Go to Profile
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {resumes.map((r) => (
                    <label
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${selectedResumeId === r.id ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                        background: selectedResumeId === r.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="radio"
                          name="resumeOption"
                          value={r.id}
                          checked={selectedResumeId === r.id}
                          onChange={() => setSelectedResumeId(r.id)}
                          style={{ accentColor: 'var(--primary-500)' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.fileName || 'Resume.pdf'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Uploaded {new Date(r.uploadedAt || Date.now()).toLocaleDateString()}
                            {r.atsScore && ` • ATS Score: ${r.atsScore}/100`}
                          </div>
                        </div>
                      </div>
                      {r.isPrimary && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '9999px',
                            background: 'var(--primary-500)',
                            color: '#ffffff',
                          }}
                        >
                          PRIMARY
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Letter Section */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Cover Letter <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiCoverLetter}
                  disabled={generatingAI}
                  className="btn btn-outline btn-xs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-400)' }}
                >
                  <Sparkles size={12} /> {generatingAI ? 'Drafting with AI...' : '✨ Generate with AI'}
                </button>
              </div>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Introduce yourself and highlight why you are a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            {/* Employer Screening Questions */}
            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div className="form-group" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'block' }}>
                  Employer Screening Questions
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {job.screeningQuestions.map((question, qIdx) => (
                    <div key={qIdx}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                        {qIdx + 1}. {question}
                      </div>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Your response..."
                        value={screeningAnswers[question] || ''}
                        onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [question]: e.target.value })}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (resumes.length > 0 && !selectedResumeId)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {submitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send size={14} /> Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyJobModal;
