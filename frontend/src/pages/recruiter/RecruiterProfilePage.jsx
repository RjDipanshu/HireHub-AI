import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Building, CheckCircle2, AlertCircle, Save, Sparkles } from 'lucide-react';
import recruiterService from '../../services/recruiterService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

export const RecruiterProfilePage = () => {
  const { user, refreshUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    designation: '',
    department: '',
    profileImageUrl: '',
    companyId: '',
  });

  useEffect(() => {
    loadProfileAndCompanies();
  }, []);

  const loadProfileAndCompanies = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [profileData, companiesList] = await Promise.allSettled([
        recruiterService.getMyProfile(),
        recruiterService.getAllCompanies(),
      ]);

      let prof = null;
      if (profileData.status === 'fulfilled') {
        prof = profileData.value;
        setProfile(prof);
        setFormData({
          firstName: prof?.firstName || user?.firstName || '',
          lastName: prof?.lastName || user?.lastName || '',
          phone: prof?.phone || user?.phone || '',
          designation: prof?.designation || '',
          department: prof?.department || '',
          profileImageUrl: prof?.profileImageUrl || user?.profileImageUrl || '',
          companyId: prof?.company?.id || '',
        });
      }

      if (companiesList.status === 'fulfilled') {
        setCompanies(Array.isArray(companiesList.value) ? companiesList.value : []);
      }
    } catch (err) {
      console.error('Error loading recruiter profile:', err);
      setErrorMsg('Failed to load profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.firstName && formData.lastName) score += 20;
    if (formData.phone) score += 15;
    if (formData.designation) score += 25;
    if (formData.department) score += 15;
    if (formData.companyId) score += 15;
    if (formData.profileImageUrl) score += 10;
    return score;
  };

  const completeness = calculateCompleteness();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        profileImageUrl: formData.profileImageUrl.trim(),
        companyId: formData.companyId || null,
      };

      const updated = await recruiterService.updateMyProfile(payload);
      setProfile(updated);
      setSuccessMsg('Recruiter profile updated successfully!');
      if (refreshUserProfile) refreshUserProfile();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Update recruiter profile error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Check your input.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading recruiter profile..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header card with Profile Completion Meter */}
      <div className="card card-ai" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={formData.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((formData.firstName || 'R') + ' ' + (formData.lastName || 'P'))}&background=6366f1&color=fff&size=96`}
                alt="Avatar"
                style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-500)' }}
              />
              {profile?.isVerified && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#10b981', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                  <CheckCircle2 size={18} color="#fff" />
                </div>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.65rem', margin: '0 0 0.2rem' }}>
                  {formData.firstName || user?.firstName} {formData.lastName || user?.lastName}
                </h1>
                <Badge variant="primary">RECRUITER</Badge>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {formData.designation || 'Talent Acquisition Partner'} {formData.department && `• ${formData.department}`}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Completeness Gauge */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', minWidth: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={14} color="var(--primary-400)" /> Profile Health
              </span>
              <span style={{ color: completeness >= 80 ? '#10b981' : '#f59e0b' }}>{completeness}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${completeness}%`,
                  height: '100%',
                  background: completeness >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {completeness === 100 ? 'All recruiter credentials complete' : 'Add your company & work details for higher candidate engagement'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification banners */}
      {successMsg && (
        <div style={{ padding: '0.9rem 1.25rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.9rem 1.25rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '2rem' }}>
        {/* Section 1: Personal Information */}
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={18} color="var(--primary-400)" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="e.g. Alex"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="e.g. Morgan"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Account Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input"
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Profile Image URL</label>
              <input
                type="url"
                name="profileImageUrl"
                value={formData.profileImageUrl}
                onChange={handleInputChange}
                className="input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

        {/* Section 2: Professional Information */}
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Briefcase size={18} color="var(--primary-400)" /> Professional Role & Organization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Designation / Job Title *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="e.g. Senior Technical Recruiter"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Department / Division</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g. Engineering Talent, People Ops"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Assigned Company / Enterprise</label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">-- Select an affiliated company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.industry ? `(${c.industry})` : ''}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Need to register a new organization?
                </span>
                <a href="/recruiter/company" style={{ fontSize: '0.8rem', color: 'var(--primary-400)', textDecoration: 'underline' }}>
                  Manage Company Profile →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterProfilePage;
