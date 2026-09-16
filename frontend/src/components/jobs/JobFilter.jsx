import React, { useState } from 'react';
import { Search, MapPin, Filter, RotateCcw, IndianRupee, SlidersHorizontal, Award, Tag, Sparkles } from 'lucide-react';

export const JobFilter = ({ filters, onChange, onReset, isSemanticMode, onToggleSemantic }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const currentSkills = filters.skills || [];
      const trimmed = skillInput.trim();
      if (!currentSkills.includes(trimmed)) {
        handleChange('skills', [...currentSkills, trimmed]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = filters.skills || [];
    handleChange('skills', currentSkills.filter(s => s !== skillToRemove));
  };

  const activeFilterCount = [
    filters.keyword,
    filters.location,
    filters.workMode,
    filters.employmentType,
    filters.experienceLevel,
    filters.minSalary,
    (filters.skills && filters.skills.length > 0) ? true : false,
  ].filter(Boolean).length;

  return (
    <div className="card" style={{
      marginBottom: '1.75rem',
      padding: '1.25rem 1.5rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Search size={18} color="var(--color-primary)" /> Search Jobs
          </h3>
          {activeFilterCount > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: '#e8f3fc',
              color: 'var(--color-primary)',
              border: '1px solid #c8e1f9',
            }}>
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onToggleSemantic && (
            <button
              type="button"
              id="toggle-semantic-job-search"
              onClick={onToggleSemantic}
              className={`btn btn-xs ${isSemanticMode ? 'btn-primary' : 'btn-outline'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
              }}
            >
              <Sparkles size={13} />
              {isSemanticMode ? 'AI Search Active' : 'Enable AI Search'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <SlidersHorizontal size={13} /> {showAdvanced ? 'Simple View' : 'More Filters'}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Primary Google/LinkedIn-like Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem' }}>
            <Search size={14} color="var(--text-secondary)" />
            {isSemanticMode ? 'Role Description' : 'Job title or keyword'}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={isSemanticMode ? 'e.g. Scalable backend architectures...' : 'e.g. Software Engineer, React, Java'}
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
          />
        </div>

        {/* Location Search */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem' }}>
            <MapPin size={14} color="var(--text-secondary)" /> Location
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Bengaluru, Pune, Hyderabad, Delhi NCR, or Remote"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>

        {/* Work Mode */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.825rem' }}>Workplace Type</label>
          <select
            className="form-select"
            value={filters.workMode || ''}
            onChange={(e) => handleChange('workMode', e.target.value)}
          >
            <option value="">All Workplace Types</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">Onsite</option>
          </select>
        </div>

        {/* Employment Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.825rem' }}>Job Type</label>
          <select
            className="form-select"
            value={filters.employmentType || ''}
            onChange={(e) => handleChange('employmentType', e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Row */}
      {showAdvanced && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e7eb' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Experience Level */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem' }}>
                <Award size={14} color="var(--text-secondary)" /> Experience Level
              </label>
              <select
                className="form-select"
                value={filters.experienceLevel || ''}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
              >
                <option value="">Any Experience</option>
                <option value="ENTRY_LEVEL">Entry Level (0-2 yrs)</option>
                <option value="MID_LEVEL">Mid Level (2-5 yrs)</option>
                <option value="SENIOR_LEVEL">Senior (5-8 yrs)</option>
                <option value="LEAD">Lead / Staff (8+ yrs)</option>
                <option value="EXECUTIVE">Executive / VP</option>
              </select>
            </div>

            {/* Minimum Salary in LPA */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem' }}>
                <IndianRupee size={14} color="#057642" /> Minimum Salary (LPA)
              </label>
              <select
                className="form-select"
                value={filters.minSalary || ''}
                onChange={(e) => handleChange('minSalary', e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Any Salary</option>
                <option value="600000">₹6 LPA+ (₹6,00,000)</option>
                <option value="1000000">₹10 LPA+ (₹10,00,000)</option>
                <option value="1500000">₹15 LPA+ (₹15,00,000)</option>
                <option value="2500000">₹25 LPA+ (₹25,00,000)</option>
                <option value="3500000">₹35 LPA+ (₹35,00,000)</option>
                <option value="5000000">₹50 LPA+ (₹50,00,000)</option>
              </select>
            </div>

            {/* Filter by Required Skill Tag */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem' }}>
                <Tag size={14} color="var(--text-secondary)" /> Filter by Skill
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Type skill & press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
            </div>
          </div>

          {/* Active Skill Pills */}
          {filters.skills && filters.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filtering by:</span>
              {filters.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    color: '#374151',
                    fontWeight: 500,
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobFilter;

