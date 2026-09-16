import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jobService from '../../services/jobService';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Sparkles, PlusCircle, ArrowLeft, CheckCircle2, Save, X } from 'lucide-react';

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: 'Bengaluru, India',
    workMode: 'REMOTE',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID_LEVEL',
    minSalary: '',
    maxSalary: '',
    currency: 'INR',
    skillsList: [],
    screeningQuestions: [],
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadJobDetails(id);
    }
  }, [id, isEdit]);

  const loadJobDetails = async (jobId) => {
    setLoading(true);
    try {
      const job = await jobService.getJobById(jobId);
      if (job) {
        setForm({
          title: job.title || '',
          description: job.description || '',
          location: job.location || 'Bengaluru, India',
          workMode: job.workMode || 'REMOTE',
          employmentType: job.employmentType || 'FULL_TIME',
          experienceLevel: job.experienceLevel || 'MID_LEVEL',
          minSalary: job.minSalary != null ? String(job.minSalary) : '',
          maxSalary: job.maxSalary != null ? String(job.maxSalary) : '',
          currency: job.currency || 'INR',
          skillsList: job.requiredSkills || [],
          screeningQuestions: job.screeningQuestions || [],
          status: job.status || 'ACTIVE',
        });
      }
    } catch (err) {
      console.error('Failed to fetch job for editing:', err);
      setError('Failed to load existing job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!form.title) {
      alert('Please enter a Job Title first so Gemini AI knows what description to create.');
      return;
    }

    setAiGenerating(true);
    try {
      const data = await aiService.generateJobDescription({
        title: form.title,
        experienceLevel: form.experienceLevel,
      });

      if (data?.description) {
        const newSkills = data.suggestedSkills && Array.isArray(data.suggestedSkills)
          ? Array.from(new Set([...form.skillsList, ...data.suggestedSkills]))
          : form.skillsList;

        setForm((prev) => ({
          ...prev,
          description: data.description,
          skillsList: newSkills,
        }));
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        description: `We are seeking an outstanding ${form.title} (${form.experienceLevel.replace('_', ' ')}) to build impactful systems and drive technical excellence.\n\nKey Responsibilities:\n• Architect, implement, and maintain mission-critical software solutions\n• Collaborate cross-functionally with Product, Design, and QA partners\n• Drive code review standards, test automation, and CI/CD pipelines\n\nRequirements:\n• Demonstrated experience in scalable application architectures\n• Deep problem-solving aptitude and passion for continuous innovation`,
      }));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const clean = skillInput.trim();
    if (!form.skillsList.includes(clean)) {
      setForm((prev) => ({
        ...prev,
        skillsList: [...prev.skillsList, clean],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skillsList: prev.skillsList.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        workMode: form.workMode,
        employmentType: form.employmentType,
        experienceLevel: form.experienceLevel,
        currency: form.currency,
        minSalary: form.minSalary ? parseFloat(form.minSalary) : null,
        maxSalary: form.maxSalary ? parseFloat(form.maxSalary) : null,
        requiredSkills: form.skillsList,
        screeningQuestions: form.screeningQuestions.filter((q) => q && q.trim()),
        status: form.status,
      };

      if (isEdit) {
        await jobService.updateJob(id, payload);
      } else {
        await jobService.createJob(payload);
      }

      navigate('/recruiter/jobs');
    } catch (err) {
      console.error('Job submission error:', err);
      setError(err?.message || 'Failed to save job posting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading job listing details..." size="lg" />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>
            {isEdit ? 'Edit Job Posting' : 'Post a New Job'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
            {isEdit
              ? 'Update vacancy requirements, compensation, and publication status.'
              : 'Attract top talent with comprehensive role details and AI-crafted descriptions.'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Job Title *</label>
          <input
            type="text"
            className="input"
            required
            placeholder="e.g. Senior Full Stack Engineer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Work Arrangement & Employment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Work Mode</label>
            <select
              className="input"
              value={form.workMode}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
            >
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Employment Type</label>
            <select
              className="input"
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Experience Level</label>
            <select
              className="input"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
            >
              <option value="ENTRY_LEVEL">Entry Level</option>
              <option value="MID_LEVEL">Mid Level</option>
              <option value="SENIOR_LEVEL">Senior Level</option>
              <option value="LEAD">Lead / Staff</option>
              <option value="EXECUTIVE">Executive / VP</option>
            </select>
          </div>
        </div>

        {/* Location & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Location / Timezone *</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Bengaluru, Karnataka, Hyderabad, or Remote (India)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Job Posting Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE (Published)</option>
              <option value="PAUSED">PAUSED (Hidden from search)</option>
              <option value="CLOSED">CLOSED (Archived)</option>
            </select>
          </div>
        </div>

        {/* Compensation */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Annual Compensation Range (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              className="input"
              placeholder="Min Salary (e.g. 1800000)"
              value={form.minSalary}
              onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
            />
            <input
              type="number"
              className="input"
              placeholder="Max Salary (e.g. 2800000)"
              value={form.maxSalary}
              onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
            />
            <select
              className="input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
            </select>
          </div>
        </div>

        {/* Skills Pills */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Required Skills</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Add required skill (e.g. React, Spring Boot, Docker)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <button type="button" onClick={handleAddSkill} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
              Add Skill
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '32px' }}>
            {form.skillsList.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: '0.825rem',
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description + AI Generator */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Job Description & Responsibilities *</label>
            <button
              type="button"
              onClick={handleGenerateAiDescription}
              disabled={aiGenerating}
              className="btn btn-ai btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Sparkles size={14} />
              {aiGenerating ? 'AI Crafting Description...' : 'Generate with Gemini AI'}
            </button>
          </div>

          <textarea
            className="input"
            rows={10}
            required
            placeholder="Outline the role objectives, responsibilities, prerequisites, and cultural expectations..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
          />
        </div>

        {/* Custom Candidate Screening Questions */}
        <div className="card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Screening Questions for Applicants (Optional, max 3)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                Ask applicants critical qualifying questions when they click &apos;Apply&apos;.
              </p>
            </div>
            {form.screeningQuestions.length < 3 && (
              <button
                type="button"
                onClick={() => setForm({ ...form, screeningQuestions: [...form.screeningQuestions, ''] })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
              >
                + Add Custom Question
              </button>
            )}
          </div>

          {/* Quick preset templates */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>Quick presets:</span>
            {[
              'What is your official notice period, and is it negotiable/buyable?',
              'How many years of production experience do you have with our required tech stack?',
              'Are you comfortable commuting or relocating for the designated office location / hybrid policy?',
            ].map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                disabled={form.screeningQuestions.length >= 3 || form.screeningQuestions.includes(preset)}
                onClick={() => setForm({ ...form, screeningQuestions: [...form.screeningQuestions, preset] })}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: form.screeningQuestions.length >= 3 || form.screeningQuestions.includes(preset) ? 'not-allowed' : 'pointer',
                  opacity: form.screeningQuestions.length >= 3 || form.screeningQuestions.includes(preset) ? 0.5 : 1,
                }}
              >
                + {preset.slice(0, 38)}...
              </button>
            ))}
          </div>

          {/* Question inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {form.screeningQuestions.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                No screening questions added. Applicants will submit their standard profile and resume.
              </p>
            ) : (
              form.screeningQuestions.map((q, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', minWidth: '24px' }}>
                    Q{idx + 1}.
                  </span>
                  <input
                    type="text"
                    className="input"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    placeholder={`e.g. Question #${idx + 1}`}
                    value={q}
                    onChange={(e) => {
                      const next = [...form.screeningQuestions];
                      next[idx] = e.target.value;
                      setForm({ ...form, screeningQuestions: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.screeningQuestions.filter((_, i) => i !== idx);
                      setForm({ ...form, screeningQuestions: next });
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}
                    title="Remove question"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={() => navigate('/recruiter/jobs')} className="btn btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '150px', justifyContent: 'center' }}
          >
            {isEdit ? <Save size={16} /> : <PlusCircle size={16} />}
            {submitting ? 'Saving...' : isEdit ? 'Update Job' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
