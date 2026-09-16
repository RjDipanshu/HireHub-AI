import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Save,
  AlertCircle,
  Image as ImageIcon,
  Heart,
  Code2,
  Gift,
  Navigation,
  Plus,
  X,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COMPANY_SIZES = [
  '1-10 Employees',
  '11-50 Employees',
  '51-200 Employees',
  '201-500 Employees',
  '501-1000 Employees',
  '1000+ Employees',
];

const INDUSTRIES = [
  'Information Technology & Services',
  'Software Development',
  'Financial Services & Fintech',
  'Healthcare & Biotechnology',
  'E-Commerce & Retail',
  'Artificial Intelligence & Machine Learning',
  'Education & EdTech',
  'Consulting & Professional Services',
  'Media & Entertainment',
];

const TECH_PRESETS = ['React', 'Angular', 'Vue.js', 'Next.js', 'Spring Boot', 'Node.js', 'Python', 'Django', 'FastAPI', 'Java', 'Kotlin', 'Go', 'Rust', 'TypeScript', 'GraphQL', 'REST APIs', 'Kafka', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MySQL', 'MongoDB', 'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'GitHub Actions'];

const BENEFIT_PRESETS = ['Health Insurance', 'Dental & Vision', 'Remote Work', 'Flexible Hours', 'Stock Options / ESOPs', 'Annual Bonus', 'Learning & Development Budget', 'Conference Allowance', 'Free Meals', 'Cab / Transport', 'Parental Leave', 'Gym Membership', 'Mental Health Support', 'Team Offsites', '5-Day Work Week'];

export const CompanyProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'lifepage' | 'preview'

  const [techInput, setTechInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const [company, setCompany] = useState({
    name: '',
    description: '',
    industry: 'Software Development',
    location: '',
    website: '',
    size: '51-200 Employees',
    logoUrl: '',
    isVerified: false,
    coverBannerUrl: '',
    cultureStatement: '',
    techStack: [],
    benefits: [],
    officeLocations: '',
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const rec = await recruiterService.getMyProfile();
      setRecruiterProfile(rec);

      if (rec?.company?.id) {
        setCompanyId(rec.company.id);
        const comp = await recruiterService.getCompanyById(rec.company.id);
        if (comp) {
          let techArr = [];
          let benefitsArr = [];
          try { techArr = comp.techStackJson ? JSON.parse(comp.techStackJson) : []; } catch {}
          try { benefitsArr = comp.benefitsJson ? JSON.parse(comp.benefitsJson) : []; } catch {}

          setCompany({
            name: comp.name || '',
            description: comp.description || '',
            industry: comp.industry || 'Software Development',
            location: comp.location || '',
            website: comp.websiteUrl || comp.website || '',
            size: comp.companySize?.replace('_', '-') || '51-200 Employees',
            logoUrl: comp.logoUrl || '',
            isVerified: comp.isVerified ?? false,
            coverBannerUrl: comp.coverBannerUrl || '',
            cultureStatement: comp.cultureStatement || '',
            techStack: techArr,
            benefits: benefitsArr,
            officeLocations: comp.officeLocations || '',
          });
        }
      } else {
        setCompany((prev) => ({
          ...prev,
          name: `${user?.firstName || 'Enterprise'}'s Organization`,
        }));
      }
    } catch (err) {
      console.warn('Company loading note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        name: company.name.trim(),
        description: company.description.trim(),
        industry: company.industry,
        location: company.location.trim(),
        websiteUrl: company.website.trim(),
        logoUrl: company.logoUrl.trim(),
        coverBannerUrl: company.coverBannerUrl.trim(),
        cultureStatement: company.cultureStatement.trim(),
        techStackJson: JSON.stringify(company.techStack),
        benefitsJson: JSON.stringify(company.benefits),
        officeLocations: company.officeLocations.trim(),
      };

      let savedCompany;
      if (companyId) {
        savedCompany = await recruiterService.updateCompany(companyId, payload);
      } else {
        savedCompany = await recruiterService.createCompany(payload);
        if (savedCompany?.id) {
          setCompanyId(savedCompany.id);
          await recruiterService.updateMyProfile({ companyId: savedCompany.id });
        }
      }

      setSuccessMessage('Company profile & Life Page published successfully! Candidates can now see your culture page.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Save company error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save company profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTech = (tech) => {
    const t = (tech || techInput).trim();
    if (t && !company.techStack.includes(t)) {
      setCompany((p) => ({ ...p, techStack: [...p.techStack, t] }));
    }
    setTechInput('');
  };

  const removeTech = (t) => setCompany((p) => ({ ...p, techStack: p.techStack.filter((x) => x !== t) }));

  const addBenefit = (b) => {
    const benefit = (b || benefitInput).trim();
    if (benefit && !company.benefits.includes(benefit)) {
      setCompany((p) => ({ ...p, benefits: [...p.benefits, benefit] }));
    }
    setBenefitInput('');
  };

  const removeBenefit = (b) => setCompany((p) => ({ ...p, benefits: p.benefits.filter((x) => x !== b) }));

  if (loading) {
    return <LoadingSpinner label="Loading company credentials..." size="lg" />;
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'lifepage', label: 'Life Page', icon: Heart },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header Profile Card */}
      <div className="card card-ai" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--border-color)' }} onError={(e) => (e.target.style.display = 'none')} />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>
                <Building2 size={36} color="#ffffff" />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{company.name || 'Your Company'}</h1>
                {company.isVerified && (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                    <ShieldCheck size={14} /> Verified Employer
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {company.location || 'Location Not Specified'}</span>
                <span>â€¢</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> {company.size}</span>
                {company.website && (
                  <><span>â€¢</span>
                    <a href={company.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-400)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Globe size={14} /> {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                {company.techStack.length > 0 && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                    {company.techStack.length} Tech Tags
                  </span>
                )}
                {company.benefits.length > 0 && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                    {company.benefits.length} Perks Listed
                  </span>
                )}
                {company.cultureStatement && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                    â¤ Culture Story Set
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div style={{ padding: '0.9rem 1.25rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ padding: '0.9rem 1.25rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.1))', paddingBottom: '0.5rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.15rem', borderRadius: 'var(--radius-md, 10px)', background: isActive ? '#0a66c2' : '#ffffff', border: isActive ? '1px solid #0a66c2' : '1px solid #e2e8f0', color: isActive ? '#ffffff' : '#334155', fontWeight: isActive ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <Icon size={16} color={isActive ? '#ffffff' : '#64748b'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Basic Info */}
      {activeTab === 'basic' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} color="var(--primary-400)" /> Company Profile & Brand Settings
          </h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Company Legal / Brand Name *</label>
                <input type="text" className="input" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required placeholder="e.g. Swiggy, Zepto, Flipkart" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Industry Sector *</label>
                <select className="input" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} required>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Headquarters / Location *</label>
                <input type="text" className="input" value={company.location} onChange={(e) => setCompany({ ...company, location: e.target.value })} required placeholder="e.g. Bengaluru, India" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Official Website</label>
                <input type="url" className="input" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://example.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Company Size</label>
                <select className="input" value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })}>
                  {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Company Logo URL</label>
              <input type="url" className="input" value={company.logoUrl} onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Company Overview & Mission</label>
              <textarea className="input" rows={4} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} placeholder="Tell prospective candidates about your company culture, technology stack, and values..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setActiveTab('lifepage')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={16} /> Setup Life Page â†’
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Life Page Editor */}
      {activeTab === 'lifepage' && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Hero Banner */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} color="var(--primary-400)" /> Hero Banner
            </h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>The banner image shown at the top of your Life Page. Use a high-quality photo of your office, team, or workspace.</p>
            <input type="url" className="input" value={company.coverBannerUrl} onChange={(e) => setCompany({ ...company, coverBannerUrl: e.target.value })} placeholder="https://images.unsplash.com/... (1280x400px recommended)" />
            {company.coverBannerUrl && (
              <div style={{ marginTop: '1rem', borderRadius: '10px', overflow: 'hidden', height: '180px' }}>
                <img src={company.coverBannerUrl} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
          </div>

          {/* Culture Statement */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="#f43f5e" /> Culture Statement
            </h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>In 2â€“4 sentences, describe what makes your company a great place to work. This is your first impression on top candidates.</p>
            <textarea className="input" rows={5} value={company.cultureStatement} onChange={(e) => setCompany({ ...company, cultureStatement: e.target.value })} placeholder="At our company, we build for a billion people. We are a team of passionate engineers and bold entrepreneurs who believe in moving fast, taking ownership, and celebrating failure as much as success..." />
          </div>

          {/* Tech Stack */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={18} color="#6366f1" /> Technology Stack
            </h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Let engineers know exactly what you build with. Click presets or type to add custom tags.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {company.techStack.map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t}
                  <button type="button" onClick={() => removeTech(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}><X size={13} /></button>
                </span>
              ))}
              {company.techStack.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tech tags added yet.</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" className="input" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} placeholder="Type a technology and press Enter..." style={{ flex: 1 }} />
              <button type="button" onClick={() => addTech()} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Plus size={14} /> Add</button>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Add:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {TECH_PRESETS.filter((t) => !company.techStack.includes(t)).map((t) => (
                  <button key={t} type="button" onClick={() => addTech(t)} style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>+ {t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits & Perks */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift size={18} color="#10b981" /> Benefits & Perks
            </h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Highlight what you offer to attract the best talent in India's competitive job market.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {company.benefits.map((b) => (
                <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {b}
                  <button type="button" onClick={() => removeBenefit(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}><X size={13} /></button>
                </span>
              ))}
              {company.benefits.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No perks added yet.</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" className="input" value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }} placeholder="Custom perk..." style={{ flex: 1 }} />
              <button type="button" onClick={() => addBenefit()} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Plus size={14} /> Add</button>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Add:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {BENEFIT_PRESETS.filter((b) => !company.benefits.includes(b)).map((b) => (
                  <button key={b} type="button" onClick={() => addBenefit(b)} style={{ padding: '0.2rem 0.6rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 500, color: '#166534', cursor: 'pointer' }}>+ {b}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Office Locations */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={18} color="#f59e0b" /> Office Locations
            </h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>List all city or country locations separated by commas.</p>
            <input type="text" className="input" value={company.officeLocations} onChange={(e) => setCompany({ ...company, officeLocations: e.target.value })} placeholder="e.g. Bengaluru, Mumbai, Hyderabad, Gurugram, Remote" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setActiveTab('preview')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={16} /> Preview Life Page â†’
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Publish Life Page'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: PREVIEW (candidate-facing life page simulation) */}
      {activeTab === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div
            style={{
              borderRadius: '16px 16px 0 0', overflow: 'hidden', height: '220px',
              background: company.coverBannerUrl
                ? `url(${company.coverBannerUrl}) center/cover`
                : 'linear-gradient(135deg, #1e3a5f 0%, #0a66c2 50%, #6366f1 100%)',
              display: 'flex', alignItems: 'flex-end', padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', border: '3px solid white' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white' }}>
                  <Building2 size={32} color="#ffffff" />
                </div>
              )}
              <div>
                <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.85rem', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{company.name || 'Your Company'}</h2>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{company.industry} Â· {company.location}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: '0 0 16px 16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}><Users size={16} /> {company.size}</div>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#0a66c2' }}>
                  <Globe size={16} /> {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {company.isVerified && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}><ShieldCheck size={15} /> Verified Employer</span>
              )}
            </div>

            {company.cultureStatement && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Heart size={18} color="#f43f5e" /> Life at {company.name}
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{company.cultureStatement}</p>
              </div>
            )}

            {company.description && !company.cultureStatement && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>About Us</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{company.description}</p>
              </div>
            )}

            {company.techStack.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code2 size={18} color="#6366f1" /> Tech Stack
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {company.techStack.map((t) => (
                    <span key={t} style={{ padding: '0.3rem 0.8rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {company.benefits.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Gift size={18} color="#10b981" /> Benefits & Perks
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.65rem' }}>
                  {company.benefits.map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle2 size={15} color="#10b981" /> {b}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {company.officeLocations && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Navigation size={18} color="#f59e0b" /> Office Locations
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {company.officeLocations.split(',').map((loc) => (
                    <span key={loc} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, color: '#713f12' }}>
                      <MapPin size={12} /> {loc.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setActiveTab('lifepage')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={14} /> Edit Life Page
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>This is how candidates see your company profile page.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfilePage;
