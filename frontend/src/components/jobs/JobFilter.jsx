import React, { useState } from 'react';
import { Search, MapPin, Filter, RotateCcw, IndianRupee, SlidersHorizontal, Award, Tag, Sparkles, ArrowRight } from 'lucide-react';

export const JobFilter = ({ filters, onChange, onReset, isSemanticMode, onToggleSemantic, onSearch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch();
    }
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

  const handleQuickFilter = (type, value) => {
    if (type === 'workMode') {
      handleChange('workMode', filters.workMode === value ? '' : value);
    } else if (type === 'location') {
      handleChange('location', filters.location === value ? '' : value);
    } else if (type === 'keyword') {
      handleChange('keyword', filters.keyword === value ? '' : value);
    } else if (type === 'minSalary') {
      handleChange('minSalary', filters.minSalary === value ? '' : value);
    }
    if (onSearch) setTimeout(onSearch, 50);
  };

  const activeFilterCount = [
    filters.keyword,
    filters.location,
    filters.workMode,
    filters.employmentType,
    filters.experienceLevel,
    filters.minSalary,
    filters.sourceType,
    (filters.skills && filters.skills.length > 0) ? true : false,
  ].filter(Boolean).length;

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        marginBottom: '1.75rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-lg, 12px)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Search size={20} color="var(--color-primary)" /> Search & Filter Opportunities
          </h3>
          {activeFilterCount > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
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

      {/* Aggregated Source Pills Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.15rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.2rem' }}>
          Job Source:
        </span>
        {[
          { key: '', label: 'All Marketplace' },
          { key: 'INTERNAL', label: 'HireHub Direct' },
          { key: 'ADZUNA', label: 'Adzuna' },
          { key: 'GREENHOUSE', label: 'Greenhouse' },
          { key: 'LEVER', label: 'Lever' },
        ].map((src) => {
          const isSelected = (filters.sourceType || '') === src.key;
          return (
            <button
              key={src.key}
              type="button"
              onClick={() => {
                handleChange('sourceType', src.key);
                if (onSearch) setTimeout(onSearch, 50);
              }}
              style={{
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: isSelected ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
                background: isSelected ? '#e8f3fc' : '#f8fafc',
                color: isSelected ? 'var(--color-primary)' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {src.label}
            </button>
          );
        })}
      </div>

      {/* Primary Search Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', fontWeight: 600 }}>
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
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', fontWeight: 600 }}>
            <MapPin size={14} color="var(--text-secondary)" /> Location
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Bengaluru, Pune, Hyderabad, Remote"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>

        {/* Work Mode */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600 }}>Workplace Type</label>
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
          <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600 }}>Job Type</label>
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
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', fontWeight: 600 }}>
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
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', fontWeight: 600 }}>
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
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', fontWeight: 600 }}>
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
                    borderRadius: 'var(--radius-sm, 6px)',
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

      {/* Primary Submit & Action Row */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '1.15rem',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Trending Searches:
          </span>
          {[
            { label: 'Remote', type: 'workMode', val: 'REMOTE' },
            { label: 'Bengaluru', type: 'location', val: 'Bengaluru' },
            { label: 'React / Next.js', type: 'keyword', val: 'React' },
            { label: 'Java & Spring', type: 'keyword', val: 'Java' },
            { label: 'AI / Python', type: 'keyword', val: 'Python' },
            { label: '₹25 LPA+', type: 'minSalary', val: 2500000 },
          ].map((item) => {
            const isActive =
              (item.type === 'workMode' && filters.workMode === item.val) ||
              (item.type === 'location' && filters.location === item.val) ||
              (item.type === 'keyword' && filters.keyword === item.val) ||
              (item.type === 'minSalary' && filters.minSalary === item.val);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleQuickFilter(item.type, item.val)}
                style={{
                  fontSize: '0.73rem',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
                  background: isActive ? '#e8f3fc' : '#f8fafc',
                  color: isActive ? 'var(--color-primary)' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Prominent Submit Search Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            >
              Clear Filters
            </button>
          )}
          <button
            type="submit"
            id="search-jobs-submit-button"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.6rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(10, 102, 194, 0.25)',
              borderRadius: '8px'
            }}
          >
            <Search size={16} />
            <span>Find Jobs</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default JobFilter;
