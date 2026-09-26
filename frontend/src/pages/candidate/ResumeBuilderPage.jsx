import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import candidateService from '../../services/candidateService';
import { exportCandidateResumePdf } from '../../utils/resumePdfExporter';
import {
  FileText,
  Download,
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Palette,
  Layout,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const INITIAL_RESUME_DATA = {
  fullName: 'Arjun Mehta',
  headline: 'Senior Full Stack Java & React Engineer',
  email: 'arjun.mehta@example.com',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
  website: 'https://arjunmehta.dev',
  linkedin: 'linkedin.com/in/arjunmehta',
  github: 'github.com/arjunmehta',
  summary: 'Results-driven Full Stack Engineer with 5+ years of experience architecting high-throughput microservices using Spring Boot, PostgreSQL, and React. Passionate about AI-assisted workflows, clean architecture, and low-latency API design.',
  experiences: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'TechWave Solutions',
      location: 'Bengaluru, India',
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        'Architected real-time candidate search engine serving 2M+ monthly queries using PostgreSQL pg_trgm and Spring Boot.',
        'Engineered responsive React microfrontends reducing First Contentful Paint by 42% across mobile web and desktop.',
        'Mentored 6 junior engineers and led code review governance adhering to enterprise SOC-2 guidelines.',
      ],
    },
    {
      id: 'exp-2',
      title: 'Full Stack Developer',
      company: 'Novatech Labs',
      location: 'Pune, India',
      startDate: 'Jul 2020',
      endDate: 'Dec 2022',
      bullets: [
        'Built automated REST and GraphQL aggregation pipelines fetching 50,000+ external jobs daily.',
        'Implemented Supabase JWT authentication and RBAC guards for multi-tenant candidate and recruiter portals.',
      ],
    },
  ],
  educations: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science and Engineering',
      institution: 'National Institute of Technology, Karnataka',
      year: '2016 – 2020',
      grade: '8.8 CGPA',
    },
  ],
  skills: [
    'Java 17', 'Spring Boot 3', 'React 19', 'PostgreSQL', 'Docker',
    'Redis', 'Microservices', 'Tailwind CSS', 'TypeScript', 'RESTful APIs',
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'HireHub AI ATS Platform',
      tech: 'Spring Boot, React, Supabase, pgvector',
      description: 'AI-assisted recruitment portal with automated resume semantic parsing and real-time candidate matching.',
    },
  ],
};

const TEMPLATES = [
  { id: 'modern', name: 'Modern Tech', accent: '#2563eb', desc: 'Clean, balanced ATS layout favored by tech startups and FAANG.' },
  { id: 'executive', name: 'Executive Formal', accent: '#0f172a', desc: 'Traditional serif headers and formal structure for leadership roles.' },
  { id: 'minimal', name: 'Minimalist Nordic', accent: '#059669', desc: 'Streamlined visual hierarchy with high density and elegant spacing.' },
];

const ACCENTS = ['#2563eb', '#059669', '#7c3aed', '#0f172a', '#dc2626', '#d97706'];

export const ResumeBuilderPage = () => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [selectedAccent, setSelectedAccent] = useState('#2563eb');
  const [activeTab, setActiveTab] = useState('basics'); // basics | experience | education | skills | projects
  const [importing, setImporting] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Load existing profile from backend on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const profile = await candidateService.getMyProfile();
      if (profile && profile.id) {
        setResumeData((prev) => ({
          ...prev,
          fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || prev.fullName,
          headline: profile.headline || prev.headline,
          email: profile.email || user?.email || prev.email,
          phone: profile.phone || prev.phone,
          location: profile.currentLocation || prev.location,
          website: profile.websiteUrl || prev.website,
          linkedin: profile.linkedinUrl || prev.linkedin,
          github: profile.githubUrl || prev.github,
          summary: profile.bio || prev.summary,
          experiences: profile.experiences?.length
            ? profile.experiences.map((exp, idx) => ({
                id: exp.id || `exp-${idx}`,
                title: exp.title || exp.jobTitle || 'Software Engineer',
                company: exp.company || exp.companyName || 'Company',
                location: exp.location || 'Remote',
                startDate: exp.startDate || '2021',
                endDate: exp.isCurrent ? 'Present' : exp.endDate || '2023',
                bullets: exp.description ? [exp.description] : ['Developed core software features.'],
              }))
            : prev.experiences,
          educations: profile.educations?.length
            ? profile.educations.map((edu, idx) => ({
                id: edu.id || `edu-${idx}`,
                degree: edu.degree || 'Bachelor of Technology',
                institution: edu.institution || 'University',
                year: edu.graduationYear ? `${edu.startYear || ''} – ${edu.graduationYear}` : '2020',
                grade: edu.grade || '',
              }))
            : prev.educations,
          skills: profile.skills?.length
            ? profile.skills.map((s) => s.skillName || s.name || s)
            : prev.skills,
        }));
      }
    } catch (err) {
      console.warn('[ResumeBuilder] Using default baseline resume template:', err?.message || err);
    }
  };

  // ATS Readiness Score Calculation
  const calculateAtsScore = () => {
    let score = 50;
    if (resumeData.fullName && resumeData.email && resumeData.phone) score += 15;
    if (resumeData.summary && resumeData.summary.length > 50) score += 10;
    if (resumeData.experiences && resumeData.experiences.length >= 2) score += 10;
    if (resumeData.skills && resumeData.skills.length >= 5) score += 10;
    if (resumeData.educations && resumeData.educations.length >= 1) score += 5;
    return Math.min(score, 100);
  };

  const atsScore = calculateAtsScore();

  const handleExportPdf = () => {
    exportCandidateResumePdf(resumeData);
  };

  // Experience handlers
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      title: 'Software Developer',
      company: 'Company Name',
      location: 'City, Country',
      startDate: '2022',
      endDate: 'Present',
      bullets: ['Implemented core business features and improved system performance.'],
    };
    setResumeData((prev) => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
  };

  const removeExperience = (id) => {
    setResumeData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  };

  const moveExperience = (index, direction) => {
    const list = [...resumeData.experiences];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(target, 0, moved);
    setResumeData((prev) => ({ ...prev, experiences: list }));
  };

  // Skill handlers
  const [newSkill, setNewSkill] = useState('');
  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim() || resumeData.skills.includes(newSkill.trim())) return;
    setResumeData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setResumeData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={26} color="var(--color-primary)" />
            ATS Resume Studio & Visual Builder
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Build, rearrange, and export an industry-standard, ATS-parseable resume optimized for recruiter screening.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* ATS Score Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', background: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
              ATS READY: {atsScore}/100
            </span>
          </div>

          <button onClick={handleExportPdf} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export ATS PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 450px) 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: Section Editor Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Template & Accent Picker Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
              LAYOUT TEMPLATE & BRAND ACCENT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  style={{
                    padding: '0.6rem 0.4rem',
                    borderRadius: '8px',
                    border: selectedTemplate === tmpl.id ? `2px solid ${selectedAccent}` : '1px solid var(--border-subtle)',
                    background: selectedTemplate === tmpl.id ? 'var(--bg-subtle, #eff6ff)' : 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Accent Color Circles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Accent:</span>
              {ACCENTS.map((acc) => (
                <button
                  key={acc}
                  onClick={() => setSelectedAccent(acc)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: acc,
                    border: selectedAccent === acc ? '3px solid #ffffff' : 'none',
                    boxShadow: selectedAccent === acc ? `0 0 0 2px ${acc}` : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {[
              { id: 'basics', label: 'Basics' },
              { id: 'summary', label: 'Summary' },
              { id: 'experience', label: 'Experience' },
              { id: 'education', label: 'Education' },
              { id: 'skills', label: 'Skills' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Basics Form */}
          {activeTab === 'basics' && (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Contact & Identity</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  className="form-control"
                  value={resumeData.headline}
                  onChange={(e) => setResumeData({ ...resumeData, headline: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (City, Country)</label>
                <input
                  type="text"
                  className="form-control"
                  value={resumeData.location}
                  onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">LinkedIn</label>
                  <input
                    type="text"
                    className="form-control"
                    value={resumeData.linkedin}
                    onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub</label>
                  <input
                    type="text"
                    className="form-control"
                    value={resumeData.github}
                    onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Summary Form */}
          {activeTab === 'summary' && (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Executive Summary</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {resumeData.summary.length} characters
                </span>
              </div>
              <textarea
                className="form-control"
                rows={5}
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                placeholder="Write an impactful 2-3 sentence overview of your career achievements..."
              />
            </div>
          )}

          {/* Tab 3: Experience Form */}
          {activeTab === 'experience' && (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Work Experience</h3>
                <button onClick={addExperience} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Plus size={14} /> Add Role
                </button>
              </div>

              {resumeData.experiences.map((exp, idx) => (
                <div key={exp.id} style={{ background: 'var(--bg-subtle, #f8fafc)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Position #{idx + 1}</div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => moveExperience(idx, -1)} disabled={idx === 0} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem' }}>
                        <MoveUp size={13} />
                      </button>
                      <button onClick={() => moveExperience(idx, 1)} disabled={idx === resumeData.experiences.length - 1} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem' }}>
                        <MoveDown size={13} />
                      </button>
                      <button onClick={() => removeExperience(exp.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title"
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...resumeData.experiences];
                        updated[idx].title = e.target.value;
                        setResumeData({ ...resumeData, experiences: updated });
                      }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...resumeData.experiences];
                        updated[idx].company = e.target.value;
                        setResumeData({ ...resumeData, experiences: updated });
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...resumeData.experiences];
                        updated[idx].startDate = e.target.value;
                        setResumeData({ ...resumeData, experiences: updated });
                      }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...resumeData.experiences];
                        updated[idx].endDate = e.target.value;
                        setResumeData({ ...resumeData, experiences: updated });
                      }}
                    />
                  </div>

                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Key impact bullets (one per line)"
                    value={exp.bullets.join('\n')}
                    onChange={(e) => {
                      const updated = [...resumeData.experiences];
                      updated[idx].bullets = e.target.value.split('\n');
                      setResumeData({ ...resumeData, experiences: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Education Form */}
          {activeTab === 'education' && (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Education & Qualifications</h3>
              {resumeData.educations.map((edu, idx) => (
                <div key={edu.id} style={{ background: 'var(--bg-subtle, #f8fafc)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ marginBottom: '0.4rem' }}
                    placeholder="Degree / Program"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...resumeData.educations];
                      updated[idx].degree = e.target.value;
                      setResumeData({ ...resumeData, educations: updated });
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{ marginBottom: '0.4rem' }}
                    placeholder="University or College"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...resumeData.educations];
                      updated[idx].institution = e.target.value;
                      setResumeData({ ...resumeData, educations: updated });
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Years (e.g. 2016 – 2020)"
                    value={edu.year}
                    onChange={(e) => {
                      const updated = [...resumeData.educations];
                      updated[idx].year = e.target.value;
                      setResumeData({ ...resumeData, educations: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Skills Form */}
          {activeTab === 'skills' && (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Skills & Core Competencies</h3>
              <form onSubmit={addSkill} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AWS Lambda, Kubernetes, Docker"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">Add</button>
              </form>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {resumeData.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.6rem',
                      background: 'var(--bg-subtle, #f1f5f9)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live ATS Paper Canvas Preview */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div
            id="ats-resume-preview"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: '2.5rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              fontFamily: selectedTemplate === 'executive' ? 'Georgia, serif' : 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              minHeight: '800px',
              fontSize: '10.5pt',
              lineHeight: 1.5,
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: `2px solid ${selectedAccent}`, paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
                {resumeData.fullName}
              </h1>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: selectedAccent, marginBottom: '0.5rem' }}>
                {resumeData.headline}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.825rem', color: '#475569' }}>
                {resumeData.email && <span>{resumeData.email}</span>}
                {resumeData.phone && <span>• {resumeData.phone}</span>}
                {resumeData.location && <span>• {resumeData.location}</span>}
                {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                {resumeData.github && <span>• {resumeData.github}</span>}
              </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedAccent, margin: '0 0 0.4rem 0' }}>
                  Professional Summary
                </h2>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.875rem', lineHeight: 1.55 }}>
                  {resumeData.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experiences.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedAccent, margin: '0 0 0.6rem 0' }}>
                  Work Experience
                </h2>
                {resumeData.experiences.map((exp) => (
                  <div key={exp.id} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{exp.title}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                      {exp.company} {exp.location ? `— ${exp.location}` : ''}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.84rem' }}>
                      {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                        <li key={bIdx} style={{ marginBottom: '0.25rem' }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resumeData.educations.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedAccent, margin: '0 0 0.5rem 0' }}>
                  Education
                </h2>
                {resumeData.educations.map((edu) => (
                  <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{edu.degree}</div>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>{edu.institution}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{edu.year}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Technical Skills */}
            {resumeData.skills.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedAccent, margin: '0 0 0.4rem 0' }}>
                  Technical Skills & Competencies
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                  {resumeData.skills.join('  •  ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
