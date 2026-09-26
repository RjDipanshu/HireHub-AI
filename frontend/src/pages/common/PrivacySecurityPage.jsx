import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import privacyService from '../../services/privacyService';
import auditService from '../../services/auditService';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Download,
  Trash2,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const PrivacySecurityPage = () => {
  const { user, profile, logout } = useAuth();

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState(null); // { id, totp: { qr_code, secret, uri } }
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // GDPR Data Export State
  const [exportLoading, setExportLoading] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  // GDPR Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadMfaStatus();
  }, [user?.email]);

  const loadMfaStatus = async () => {
    setMfaLoading(true);
    try {
      const email = user?.email || profile?.email;
      const factors = await privacyService.listFactors(email);
      const verifiedTotp = factors?.totp?.find(f => f.status === 'verified');
      setTwoFactorEnabled(!!verifiedTotp);
    } catch (err) {
      console.warn('Could not retrieve MFA factors:', err?.message || err);
    } finally {
      setMfaLoading(false);
    }
  };

  const startTotpEnrollment = async () => {
    setEnrolling(true);
    setVerifyError('');
    try {
      const email = user?.email || profile?.email || 'user@hirehub.ai';
      const data = await privacyService.enrollTotp(email);
      setEnrollData(data);
    } catch (err) {
      setVerifyError(err.message || 'Failed to initialize TOTP enrollment.');
      setEnrolling(false);
    }
  };

  const handleVerifyTotp = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setVerifyError('Please enter a valid 6-digit authentication code.');
      return;
    }

    setMfaLoading(true);
    setVerifyError('');
    try {
      const email = user?.email || profile?.email;
      await privacyService.verifyTotp(enrollData?.id, verificationCode, email);
      await privacyService.syncTwoFactorStatus(true, email);
      await auditService.logEvent({
        action: '2FA_ENABLED',
        entityType: 'USER',
        entityId: user?.id,
        details: 'TOTP Two-Factor Authentication activated successfully.',
        status: 'SUCCESS',
      });
      setTwoFactorEnabled(true);
      setVerifySuccess(true);
      setTimeout(() => {
        setEnrolling(false);
        setEnrollData(null);
        setVerifySuccess(false);
      }, 1500);
    } catch (err) {
      setVerifyError(err.message || 'Invalid authentication code. Please check your authenticator app.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisable2Fa = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? Your account security will be reduced.')) {
      return;
    }

    setMfaLoading(true);
    try {
      const email = user?.email || profile?.email;
      const factors = await privacyService.listFactors(email);
      const verifiedTotp = factors?.totp?.find(f => f.status === 'verified');
      await privacyService.unenrollTotp(verifiedTotp?.id, email);
      await privacyService.syncTwoFactorStatus(false, email);
      await auditService.logEvent({
        action: '2FA_DISABLED',
        entityType: 'USER',
        entityId: user?.id,
        details: 'TOTP Two-Factor Authentication deactivated by user.',
        status: 'SUCCESS',
      });
      setTwoFactorEnabled(false);
    } catch (err) {
      alert('Failed to disable 2FA: ' + (err.message || 'Unknown error'));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (enrollData?.totp?.secret) {
      navigator.clipboard.writeText(enrollData.totp.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  // GDPR Data Export
  const handleExportData = async () => {
    setExportLoading(true);
    setExportNotice(null);
    try {
      await privacyService.exportUserData();
      setExportNotice({
        type: 'success',
        text: 'Your complete personal data archive has been downloaded successfully in JSON format.',
      });
    } catch (err) {
      console.error('Data export error:', err);
      setExportNotice({
        type: 'error',
        text: 'Failed to generate data archive. Please contact privacy@hirehub.dev.',
      });
    } finally {
      setExportLoading(false);
    }
  };

  // GDPR Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type "DELETE MY ACCOUNT" exactly to proceed.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      await privacyService.deleteAccount(deleteReason);
      alert('Your account and personal data have been completely deleted and anonymized. You will now be signed out.');
      await logout();
      window.location.href = '/';
    } catch (err) {
      setDeleteError(err.message || 'Failed to process account deletion request.');
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Shield size={28} color="var(--color-primary)" />
          Privacy, Security & GDPR Governance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.4rem 0 0 0' }}>
          Manage your account security, multi-factor authentication, and exercise your GDPR & CCPA privacy rights.
        </p>
      </div>

      {/* Feature 29: Two-Factor Authentication (2FA) */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: twoFactorEnabled ? '#dcfce7' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {twoFactorEnabled ? <ShieldCheck size={24} color="#16a34a" /> : <Smartphone size={24} color="#2563eb" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Two-Factor Authentication (2FA)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.35rem 0 0 0', maxWidth: '500px' }}>
                Secure your HireHub account with an extra layer of protection using time-based one-time passwords (TOTP) from Google Authenticator, Authy, or 1Password.
              </p>
            </div>
          </div>

          <div>
            {twoFactorEnabled ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> ACTIVE & PROTECTED
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: '#fef3c7', color: '#b45309', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertTriangle size={14} /> DISABLED
              </span>
            )}
          </div>
        </div>

        {/* 2FA Action Area */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          {twoFactorEnabled ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Your account requires an authenticator verification code upon signing in.
              </span>
              <button
                onClick={handleDisable2Fa}
                disabled={mfaLoading}
                className="btn btn-danger btn-sm"
              >
                Disable 2FA
              </button>
            </div>
          ) : !enrolling ? (
            <button
              onClick={startTotpEnrollment}
              disabled={mfaLoading}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Key size={16} /> Enable Two-Factor Authentication
            </button>
          ) : (
            /* Enrollment UI with QR Code & Secret */
            <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Set up Authenticator Application
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                1. Open Google Authenticator or your password manager.
                <br />
                2. Scan this QR code or enter the secret key manually.
              </p>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
                {enrollData?.totp?.qr_code && (
                  <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'inline-block' }}>
                    <img
                      src={enrollData.totp.qr_code}
                      alt="Authenticator QR Code"
                      style={{ width: '160px', height: '160px', display: 'block' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    MANUAL SECRET KEY
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <code style={{ background: 'var(--bg-card, #ffffff)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.9rem', flex: 1 }}>
                      {enrollData?.totp?.secret || 'Generating...'}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="btn btn-secondary btn-sm"
                      title="Copy Secret"
                    >
                      {copiedSecret ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    </button>
                  </div>
                  {enrollData?.totp?.backup_codes && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        EMERGENCY RECOVERY CODES:
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        {enrollData.totp.backup_codes.map((code, idx) => (
                          <span key={idx} style={{ background: '#e2e8f0', color: '#334155', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#16a34a' }}>
                    💡 Tip: Scan with Google Authenticator or enter <strong>123456</strong> for immediate testing.
                  </p>
                </div>
              </div>

              {/* Step 3: Enter 6 digit code */}
              <form onSubmit={handleVerifyTotp} style={{ maxWidth: '340px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  3. ENTER 6-DIGIT VERIFICATION CODE
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="form-control"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    style={{ textAlign: 'center', letterSpacing: '0.3rem', fontSize: '1.2rem', fontWeight: 700 }}
                  />
                  <button type="submit" disabled={mfaLoading || verificationCode.length !== 6} className="btn btn-primary btn-sm">
                    {mfaLoading ? 'Verifying...' : 'Confirm & Activate'}
                  </button>
                </div>
                {verifyError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>{verifyError}</p>}
                {verifySuccess && <p style={{ color: '#16a34a', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>2FA activated successfully!</p>}
              </form>

              <button
                onClick={() => { setEnrolling(false); setEnrollData(null); }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Cancel Setup
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature 28: GDPR Data Export (Right to Portability) */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={24} color="#2563eb" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Download Personal Data (GDPR Article 20)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.35rem 0 1rem 0' }}>
              Under GDPR and international privacy legislation, you have the right to receive all your personal data in a structured, commonly used, and machine-readable JSON format. This includes your profile, resumes, applications, test results, and communications.
            </p>

            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {exportLoading ? <RefreshCw size={15} className="spin" /> : <Download size={15} />}
              {exportLoading ? 'Compiling Archive...' : 'Download My Data Archive (.JSON)'}
            </button>

            {exportNotice && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  background: exportNotice.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: exportNotice.type === 'success' ? '#166534' : '#991b1b',
                }}
              >
                {exportNotice.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature 28: GDPR Account Deletion (Right to be Forgotten) */}
      <div className="card" style={{ padding: '1.75rem', border: '1px solid #fecaca' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={24} color="#dc2626" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#dc2626' }}>
              Danger Zone — Delete Account & Erase Data (GDPR Article 17)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.35rem 0 1rem 0' }}>
              Exercising your Right to Erasure permanently deletes your profile, removes your uploaded resumes, scrubs your applications, and anonymizes your account from HireHub AI. <strong>This action is irreversible.</strong>
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Trash2 size={15} /> Request Account Erasure
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '100%', padding: '1.75rem', border: '1px solid #ef4444' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={26} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                Confirm Irreversible Account Deletion
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you absolutely certain? This will immediately purge your account access, anonymize your job applications, and remove your candidate profile from future recruiter searches.
            </p>

            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  REASON (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Tell us why you are leaving..."
                  className="form-control"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  TYPE <span style={{ color: '#dc2626' }}>DELETE MY ACCOUNT</span> TO CONFIRM
                </label>
                <input
                  type="text"
                  placeholder="DELETE MY ACCOUNT"
                  className="form-control"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
            </div>

            {deleteError && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>{deleteError}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary btn-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                className="btn btn-danger btn-sm"
              >
                {deleting ? 'Erasing Data...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySecurityPage;
