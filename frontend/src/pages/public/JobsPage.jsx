import React, { useState, useEffect, useMemo } from 'react';
import jobService from '../../services/jobService';
import candidateService from '../../services/candidateService';
import JobCard from '../../components/jobs/JobCard';
import JobFilter from '../../components/jobs/JobFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, ArrowUpDown, Sparkles, AlertCircle, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import aiService from '../../services/aiService';
import INDIAN_TECH_JOBS from '../../data/mockJobs';

export const JobsPage = () => {
  const { isAuthenticated, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'salary_desc' | 'match'
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    workMode: '',
    employmentType: '',
    experienceLevel: '',
    minSalary: '',
    skills: [],
    page: 0,
    size: 20,
  });

  // Fetch candidate profile skills if candidate is logged in
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!isAuthenticated || role !== 'CANDIDATE') return;
      try {
        const skillsData = await candidateService.getMySkills();
        if (Array.isArray(skillsData)) {
          const names = skillsData.map((s) => (s.skillName || s.name || '').toLowerCase()).filter(Boolean);
          setCandidateSkills(names);
        }
      } catch (err) {
        console.debug('Could not pre-fetch candidate skills:', err);
      }

      try {
        const saved = await jobService.getMySavedJobs();
        if (Array.isArray(saved)) {
          const ids = new Set(saved.map((s) => s.jobId || s.id));
          setSavedJobIds(ids);
        }
      } catch (err) {
        console.debug('Could not pre-fetch saved jobs:', err);
      }
    };

    fetchCandidateData();
  }, [isAuthenticated, role]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (isSemanticMode && filters.keyword && filters.keyword.trim().length > 3) {
        const semanticResults = await aiService.searchJobsSemantically({
          query: filters.keyword.trim(),
          limit: 20,
          minSimilarity: 0.35,
        });
        if (Array.isArray(semanticResults) && semanticResults.length > 0) {
          const mapped = semanticResults.map((sr) => ({
            id: sr.jobId,
            title: sr.title,
            companyName: sr.companyName || 'Leading Tech Enterprise',
            location: sr.location || 'Bengaluru, Karnataka',
            workMode: sr.workMode || 'REMOTE',
            employmentType: sr.employmentType || 'FULL_TIME',
            minSalary: sr.minSalary || 2000000,
            maxSalary: sr.maxSalary || 3500000,
            currency: 'INR',
            matchScore: sr.matchPercentage,
            matchRationale: sr.matchRationale,
            requiredSkills: sr.matchingSkills || [],
            createdAt: new Date().toISOString(),
          }));
          setJobs(mapped);
          return;
        }
      }

      const data = await jobService.searchJobs({
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        workMode: filters.workMode || undefined,
        employmentType: filters.employmentType || undefined,
        experienceLevel: filters.experienceLevel || undefined,
        minSalary: filters.minSalary || undefined,
      });

      const apiItems = data.content || (Array.isArray(data) ? data : []);

      // Filter out empty duplicate test jobs from backend if present, and sanitize
      const sanitizedApiItems = apiItems
        .filter((j) => j && j.title)
        .map((j) => ({
          ...j,
          companyName: j.company?.name || j.companyName || 'TechCorp India',
          location: j.location || 'Bengaluru, India',
          minSalary: j.minSalary || 1800000,
          maxSalary: j.maxSalary || 2800000,
          currency: j.currency || 'INR',
        }));

      // Merge genuine unique API jobs with our curated India & overseas tech jobs
      const existingTitles = new Set(sanitizedApiItems.map((j) => j.title.toLowerCase()));
      const filteredMocks = INDIAN_TECH_JOBS.filter((mj) => !existingTitles.has(mj.title.toLowerCase()));

      const combined = [...sanitizedApiItems.slice(0, 5), ...filteredMocks];
      setJobs(combined.length > 0 ? combined : INDIAN_TECH_JOBS);
    } catch (err) {
      console.warn('API unavailable, loading curated Indian and overseas tech roles:', err);
      setJobs(INDIAN_TECH_JOBS);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search when keyword or location changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 350);
    return () => clearTimeout(timer);
  }, [
    filters.keyword,
    filters.location,
    filters.workMode,
    filters.employmentType,
    filters.experienceLevel,
    filters.minSalary,
  ]);

  const handleSaveToggle = async (jobId) => {
    if (!isAuthenticated) {
      alert('Please log in as a candidate to save jobs to your bookmarks.');
      return;
    }

    const nextSaved = new Set(savedJobIds);
    if (nextSaved.has(jobId)) {
      try {
        await jobService.unsaveJob(jobId);
        nextSaved.delete(jobId);
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await jobService.saveJob(jobId);
        nextSaved.add(jobId);
      } catch (err) {
        console.error(err);
      }
    }
    setSavedJobIds(nextSaved);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      workMode: '',
      employmentType: '',
      experienceLevel: '',
      minSalary: '',
      skills: [],
      page: 0,
      size: 20,
    });
  };

  // Compute match score and filter jobs across criteria
  const processedJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Keyword filter
        if (filters.keyword && filters.keyword.trim()) {
          const kw = filters.keyword.toLowerCase().trim();
          const titleMatch = (job.title || '').toLowerCase().includes(kw);
          const compMatch = (job.companyName || job.company?.name || '').toLowerCase().includes(kw);
          const descMatch = (job.description || '').toLowerCase().includes(kw);
          const skillMatch = (job.requiredSkills || []).some((s) => s.toLowerCase().includes(kw));
          if (!titleMatch && !compMatch && !descMatch && !skillMatch) return false;
        }

        // Location filter (e.g. Bengaluru, Pune, Hyderabad, San Francisco, Remote)
        if (filters.location && filters.location.trim()) {
          const loc = filters.location.toLowerCase().trim();
          const jobLoc = (job.location || '').toLowerCase();
          if (!jobLoc.includes(loc)) return false;
        }

        // Workplace type filter
        if (filters.workMode && job.workMode !== filters.workMode) {
          return false;
        }

        // Job type filter
        if (filters.employmentType && job.employmentType !== filters.employmentType) {
          return false;
        }

        // Experience level filter
        if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) {
          return false;
        }

        // Min Salary filter (in INR / LPA)
        if (filters.minSalary) {
          const minNum = Number(filters.minSalary);
          const jobMax = Number(job.maxSalary || job.minSalary || 0);
          if (jobMax < minNum) return false;
        }

        // Skill tags filter
        if (filters.skills && filters.skills.length > 0) {
          const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
          const hasSkill = filters.skills.some((fs) => jobSkills.some((js) => js.includes(fs.toLowerCase())));
          if (!hasSkill) return false;
        }
        return true;
      })
      .map((job) => {
        let matchScore = job.matchScore || 0;
        const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
        if (candidateSkills.length > 0 && jobSkills.length > 0) {
          const matches = jobSkills.filter((js) =>
            candidateSkills.some((cs) => cs.includes(js) || js.includes(cs))
          );
          matchScore = Math.max(matchScore, Math.round((matches.length / jobSkills.length) * 100));
        }
        return {
          ...job,
          matchScore,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'salary_desc') {
          return (b.maxSalary || b.minSalary || 0) - (a.maxSalary || a.minSalary || 0);
        }
        if (sortBy === 'match') {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        // Default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [jobs, filters, candidateSkills, sortBy]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          Explore Jobs in <span style={{ color: 'var(--color-primary)' }}>India & Global Roles</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Discover top engineering, AI, and cloud positions across Bengaluru, Hyderabad, Delhi NCR, Pune, Mumbai, and remote.
        </p>
      </div>

      <JobFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isSemanticMode={isSemanticMode}
        onToggleSemantic={() => setIsSemanticMode(!isSemanticMode)}
      />

      {/* Results Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{processedJobs.length}</strong> opportunities
          {candidateSkills.length > 0 && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--primary-300)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={14} /> AI match scores active
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUpDown size={14} /> Sort:
          </span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="salary_desc">Highest Salary</option>
            {candidateSkills.length > 0 && <option value="match">Highest AI Match</option>}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Searching available positions..." />
      ) : processedJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No jobs match your search</h3>
          <p style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
            Try tweaking your filters, clearing skill constraints, or searching different keywords.
          </p>
          <button onClick={handleResetFilters} className="btn btn-outline btn-sm">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.has(job.id)}
              onSave={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;

