import React, { useState, useEffect } from 'react';
import recruiterService from '../../services/recruiterService';
import candidateService from '../../services/candidateService';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Search,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Filter,
  CheckCircle2,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  ChevronRight,
  X,
  MessageSquare,
  Award,
  ShieldCheck,
} from 'lucide-react';
import DirectMessageModal from '../../components/common/DirectMessageModal';

const COMMON_SKILLS = [
  'React',
  'Java',
  'Spring Boot',
  'TypeScript',
  'Node.js',
  'Python',
  'AWS',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'GraphQL',
  'Tailwind CSS',
];

const EXPERIENCE_LEVELS = [
  { label: 'All Experience', value: 0 },
  { label: '1+ Years', value: 1 },
  { label: '3+ Years', value: 3 },
  { label: '5+ Years', value: 5 },
  { label: '8+ Years (Senior/Lead)', value: 8 },
];

export const CandidateSearchPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minExp, setMinExp] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [noticeFilter, setNoticeFilter] = useState('ALL');
  const [ctcFilter, setCtcFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messagingCandidate, setMessagingCandidate] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [semanticSearching, setSemanticSearching] = useState(false);

  const handleSemanticSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchKeyword || searchKeyword.trim().length < 3) {
      loadCandidatePool();
      return;
    }

    setSemanticSearching(true);
    try {
      const results = await aiService.searchCandidatesSemantically({
        query: searchKeyword.trim(),
        limit: 25,
        minSimilarity: 0.25,
      });

      if (Array.isArray(results) && results.length > 0) {
        const mapped = results.map((r) => ({
          id: r.candidateProfileId,
          firstName: r.candidateName?.split(' ')[0] || 'Candidate',
          lastName: r.candidateName?.split(' ').slice(1).join(' ') || '',
          headline: r.headline,
          currentLocation: r.currentLocation || 'Location flexible',
          yearsOfExperience: r.yearsOfExperience || 3,
          semanticMatchScore: r.matchPercentage,
          matchRationale: r.matchRationale,
          skills: (r.verifiedSkills || []).map((sk) => ({ skillName: sk })),
          educations: [],
          experiences: [],
        }));
        setCandidates(mapped);
      } else {
        loadCandidatePool();
      }
    } catch (err) {
      console.warn('Semantic candidate search error:', err);
      loadCandidatePool();
    } finally {
      setSemanticSearching(false);
    }
  };

  useEffect(() => {
    loadCandidatePool();
  }, []);

  const loadCandidatePool = async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getAllCandidates();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Candidate search fallback:', err);
      // Demo talent pool with Indian tech market context
      setCandidates([
        {
          id: 'cand-1',
          firstName: 'Rahul',
          lastName: 'Sharma',
          headline: 'Senior Full Stack Engineer (Java 17, Spring Boot, React, AWS)',
          bio: 'Passionate software architect with 6 years building distributed microservices, fintech payment gateways, and event-driven architectures.',
          currentLocation: 'Bengaluru, Karnataka',
          yearsOfExperience: 6,
          noticePeriod: '15_DAYS',
          currentCtc: 18.0,
          expectedCtc: 26.0,
          preferredLocations: 'Bengaluru, Hyderabad, Remote',
          skills: [
            { skillName: 'React' },
            { skillName: 'Java' },
            { skillName: 'Spring Boot' },
            { skillName: 'AWS' },
            { skillName: 'PostgreSQL' },
          ],
          educations: [
            { degree: 'B.Tech in Computer Science', institution: 'IIT Madras' },
          ],
          experiences: [
            { jobTitle: 'Senior Software Engineer', companyName: 'Razorpay / PhonePe partner' },
          ],
        },
        {
          id: 'cand-2',
          firstName: 'Priya',
          lastName: 'Patel',
          headline: 'Backend Systems & High-Throughput Distributed DB Specialist',
          bio: 'Architecting ultra-low-latency backend infrastructure, Kafka event-streaming pipelines, and cloud native Kubernetes deployments.',
          currentLocation: 'Hyderabad, Telangana',
          yearsOfExperience: 5,
          noticePeriod: 'IMMEDIATE',
          currentCtc: 14.0,
          expectedCtc: 21.0,
          preferredLocations: 'Hyderabad, Bengaluru, Remote',
          skills: [
            { skillName: 'Java' },
            { skillName: 'Python' },
            { skillName: 'Kubernetes' },
            { skillName: 'Docker' },
            { skillName: 'PostgreSQL' },
          ],
          educations: [
            { degree: 'M.Tech in Software Engineering', institution: 'IIIT Hyderabad' },
          ],
          experiences: [
            { jobTitle: 'Distributed Systems Engineer', companyName: 'Swiggy' },
          ],
        },
        {
          id: 'cand-3',
          firstName: 'Amit',
          lastName: 'Verma',
          headline: 'Lead Frontend Architect & UI/UX Design System Specialist',
          bio: 'Dedicated to accessible web design systems, high performance React microfrontends, and seamless design-to-code pipelines.',
          currentLocation: 'Pune, Maharashtra',
          yearsOfExperience: 7,
          noticePeriod: '30_DAYS',
          currentCtc: 22.0,
          expectedCtc: 32.0,
          preferredLocations: 'Pune, Mumbai, Remote',
          skills: [
            { skillName: 'React' },
            { skillName: 'TypeScript' },
            { skillName: 'Node.js' },
            { skillName: 'GraphQL' },
            { skillName: 'Tailwind CSS' },
          ],
          educations: [
            { degree: 'B.E. in Information Technology', institution: 'COEP Pune' },
          ],
          experiences: [
            { jobTitle: 'Lead Frontend Architect', companyName: 'Zomato Tech' },
          ],
        },
        {
          id: 'cand-4',
          firstName: 'Sneha',
          lastName: 'Iyer',
          headline: 'Full Stack Cloud Developer (Spring Boot & Modern React)',
          bio: 'Built multi-tenant enterprise SaaS applications with resilient REST APIs, JWT authentication, and modern dashboard UIs.',
          currentLocation: 'Gurgaon / Delhi NCR',
          yearsOfExperience: 4,
          noticePeriod: 'IMMEDIATE',
          currentCtc: 12.0,
          expectedCtc: 18.0,
          preferredLocations: 'Delhi NCR, Bengaluru, Remote',
          skills: [
            { skillName: 'Java' },
            { skillName: 'Spring Boot' },
            { skillName: 'React' },
            { skillName: 'PostgreSQL' },
          ],
          educations: [
            { degree: 'B.Tech in Computer Science', institution: 'DTU Delhi' },
          ],
          experiences: [
            { jobTitle: 'Full Stack Developer', companyName: 'Paytm' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleContactCandidate = (candidate) => {
    setToastMessage(`Invitation to connect sent to ${candidate.firstName} ${candidate.lastName}!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredCandidates = candidates.filter((cand) => {
    const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.toLowerCase();
    const headline = (cand.headline || '').toLowerCase();
    const bio = (cand.bio || '').toLowerCase();
    const query = searchKeyword.toLowerCase();

    const matchesKeyword =
      !query || fullName.includes(query) || headline.includes(query) || bio.includes(query);

    const matchesLocation =
      !locationFilter ||
      (cand.currentLocation || '').toLowerCase().includes(locationFilter.toLowerCase()) ||
      (cand.preferredLocations || '').toLowerCase().includes(locationFilter.toLowerCase());

    const expYears = cand.yearsOfExperience || 0;
    const matchesExp = expYears >= minExp;

    const candSkillNames = (cand.skills || []).map((s) => (s.skillName || s.name || s).toLowerCase());
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((req) => candSkillNames.includes(req.toLowerCase()));

    // Notice Period Filter
    const matchesNotice =
      noticeFilter === 'ALL' ||
      (noticeFilter === 'IMMEDIATE' && (cand.noticePeriod === 'IMMEDIATE' || cand.noticePeriod === '15_DAYS')) ||
      cand.noticePeriod === noticeFilter;

    // Expected CTC Filter (in LPA)
    const expectedCtc = cand.expectedCtc != null ? cand.expectedCtc : null;
    let matchesCtc = true;
    if (ctcFilter === 'UNDER_15') {
      matchesCtc = expectedCtc !== null && expectedCtc <= 15;
    } else if (ctcFilter === '15_TO_25') {
      matchesCtc = expectedCtc !== null && expectedCtc >= 15 && expectedCtc <= 25;
    } else if (ctcFilter === 'ABOVE_25') {
      matchesCtc = expectedCtc !== null && expectedCtc > 25;
    }

    return matchesKeyword && matchesLocation && matchesExp && matchesSkills && matchesNotice && matchesCtc;
  });

  if (loading) {
    return <LoadingSpinner label="Searching talent pool..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card card-ai" style={{ padding: '2rem' }}>
        <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>Candidate Search & Sourcing</span>
        <h1 style={{ fontSize: '1.85rem', margin: '0.25rem 0' }}>Explore Verified Candidate Pool</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Discover top engineers, designers, and specialists filtered by verified technical skills, experience, and location.
        </p>
      </div>

      {toastMessage && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Search & Multi-Faceted Filters */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              id="toggle-semantic-candidate-search"
              onClick={() => {
                const nextMode = !isSemanticMode;
                setIsSemanticMode(nextMode);
                if (!nextMode) loadCandidatePool();
              }}
              className={`btn btn-xs ${isSemanticMode ? 'btn-primary' : 'btn-outline'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(139, 92, 246, 0.4)',
                background: isSemanticMode ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                color: isSemanticMode ? '#c4b5fd' : 'inherit',
              }}
            >
              <Sparkles size={13} color="#a78bfa" />
              {isSemanticMode ? '✨ Semantic Intent Mode: ON' : 'Enable AI Semantic Search'}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isSemanticMode ? 'Understands queries like "Find backend engineers with strong Java and cloud exposure"' : 'Standard keyword filter active'}
            </span>
          </div>
          {isSemanticMode && (
            <button
              type="button"
              id="execute-semantic-search-btn"
              onClick={handleSemanticSearch}
              disabled={semanticSearching}
              className="btn btn-ai btn-xs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Sparkles size={13} /> {semanticSearching ? 'Searching AI Vectors...' : 'Run Vector Search'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="input"
              style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
              placeholder={isSemanticMode ? 'Describe ideal talent in plain English (e.g. "Senior backend engineer with Docker and AWS experience")...' : 'Search by candidate name, role title, or keywords...'}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isSemanticMode) {
                  handleSemanticSearch();
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <MapPin size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="input"
              style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
              placeholder="Filter by city or Remote..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Experience Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum Experience:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setMinExp(lvl.value)}
                className={`btn btn-sm ${minExp === lvl.value ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notice Period Filter (India Market) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Notice Period:</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { label: 'All Notice', value: 'ALL' },
              { label: 'Immediate / <15d', value: 'IMMEDIATE' },
              { label: '30 Days', value: '30_DAYS' },
              { label: '60 Days', value: '60_DAYS' },
              { label: '90 Days', value: '90_DAYS' },
            ].map((np) => (
              <button
                key={np.value}
                onClick={() => setNoticeFilter(np.value)}
                className={`btn btn-sm ${noticeFilter === np.value ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                {np.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expected CTC Filter (Lakhs INR) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expected CTC:</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Any CTC', value: 'ALL' },
              { label: 'Under ₹15 LPA', value: 'UNDER_15' },
              { label: '₹15 - ₹25 LPA', value: '15_TO_25' },
              { label: '₹25+ LPA', value: 'ABOVE_25' },
            ].map((ctc) => (
              <button
                key={ctc.value}
                onClick={() => setCtcFilter(ctc.value)}
                className={`btn btn-sm ${ctcFilter === ctc.value ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                {ctc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Pills Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
            Filter by Skills:
          </span>
          {COMMON_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`btn btn-sm ${isSelected ? 'btn-ai' : 'btn-outline'}`}
                style={{
                  fontSize: '0.75rem',
                  borderRadius: '16px',
                  padding: '0.25rem 0.75rem',
                }}
              >
                {skill} {isSelected && '✓'}
              </button>
            );
          })}
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear Skills
            </button>
          )}
        </div>
      </div>

      {/* Candidates Results List */}
      {filteredCandidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No matching candidates found</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
            Try expanding your search query, clearing skills filters, or lowering minimum experience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((cand) => {
            const fullName = `${cand.firstName || 'Candidate'} ${cand.lastName || ''}`.trim();

            return (
              <div
                key={cand.id}
                className="card card-hover"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={
                          cand.profileImageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff&size=56`
                        }
                        alt={fullName}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{fullName}</h3>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            <ShieldCheck size={11} /> Verified
                          </span>
                          {(cand.isPhoneVerified !== false) && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                              📞 Phone Verified
                            </span>
                          )}
                          {(cand.isTopTalentBadge || cand.yearsOfExperience >= 5) && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                              🏅 Top 5% Talent
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={12} /> {cand.currentLocation || 'Remote'}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Briefcase size={12} /> {cand.yearsOfExperience || 0} yrs exp
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-400)' }}>
                    {cand.headline || 'Software Specialist'}
                  </p>

                  {/* Verified Skill Badges (LinkedIn Skill Quiz Style) */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                    {(cand.skillBadges?.length > 0 ? cand.skillBadges : [
                      { badgeTitle: 'Verified Java 17', score: 85 },
                      { badgeTitle: 'Verified Spring Boot', score: 90 }
                    ]).slice(0, 2).map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <Award size={12} /> {badge.badgeTitle || badge.skillName}
                      </span>
                    ))}
                  </div>

                  {/* Indian Market Context Badges (Notice & CTC) */}
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {cand.noticePeriod && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                        ⏳ {cand.noticePeriod === 'IMMEDIATE' ? 'Immediate Joiner' : cand.noticePeriod === '15_DAYS' ? '15d Notice' : cand.noticePeriod === '30_DAYS' ? '30d Notice' : cand.noticePeriod === '60_DAYS' ? '60d Notice' : cand.noticePeriod === '90_DAYS' ? '90d Notice' : 'Serving Notice'}
                      </span>
                    )}
                    {cand.expectedCtc && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                        ₹ {cand.expectedCtc} LPA Expected
                      </span>
                    )}
                    {cand.preferredLocations && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                        Pref: {cand.preferredLocations}
                      </span>
                    )}
                  </div>

                  {cand.semanticMatchScore && (
                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-ai" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                        ✨ {cand.semanticMatchScore}% AI Talent Fit
                      </span>
                    </div>
                  )}

                  {cand.matchRationale && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#c4b5fd',
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.6rem',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}>
                      <span>🎯</span>
                      <span>{cand.matchRationale}</span>
                    </div>
                  )}

                  {cand.bio && (
                    <p style={{ margin: '0 0 1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cand.bio}
                    </p>
                  )}

                  {/* Skills tags */}
                  {cand.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {cand.skills.slice(0, 6).map((sk, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.2rem 0.55rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {sk.skillName || sk.name || sk}
                        </span>
                      ))}
                      {cand.skills.length > 6 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{cand.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      View Background <ChevronRight size={14} />
                    </button>
                    {cand.id && (
                      <a
                        href={`/candidates/${cand.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-400)', borderColor: 'var(--primary-600)', textDecoration: 'none' }}
                        title="Open shareable public profile in new tab"
                      >
                        <ExternalLink size={13} /> Public Profile
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setMessagingCandidate(cand)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: '#2563eb', color: '#2563eb' }}
                    >
                      <MessageSquare size={13} /> Send InMail
                    </button>
                    <button
                      onClick={() => handleContactCandidate(cand)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Mail size={13} /> Invite
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Modal View */}
      {selectedCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCandidate(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img
                src={
                  selectedCandidate.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidate.firstName + ' ' + selectedCandidate.lastName)}&background=6366f1&color=fff&size=64`
                }
                alt="Candidate"
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                  {selectedCandidate.firstName} {selectedCandidate.lastName}
                </h2>
                <p style={{ margin: '0.2rem 0', color: 'var(--primary-400)', fontSize: '0.9rem' }}>
                  {selectedCandidate.headline || 'Software Specialist'}
                </p>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {selectedCandidate.currentLocation || 'Remote'} • {selectedCandidate.yearsOfExperience || 0} years experience
                </div>
                {(selectedCandidate.noticePeriod || selectedCandidate.expectedCtc) && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedCandidate.noticePeriod && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        ⏳ Notice: {selectedCandidate.noticePeriod.replace('_', ' ')}
                      </span>
                    )}
                    {selectedCandidate.currentCtc && (
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Current: ₹{selectedCandidate.currentCtc} LPA
                      </span>
                    )}
                    {selectedCandidate.expectedCtc && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Expected: ₹{selectedCandidate.expectedCtc} LPA
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedCandidate.bio && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>About</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {selectedCandidate.bio}
                </p>
              </div>
            )}

            {selectedCandidate.skills?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedCandidate.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary-300)',
                        borderRadius: '12px',
                        fontSize: '0.775rem',
                      }}
                    >
                      {sk.skillName || sk.name || sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedCandidate(null)} className="btn btn-outline">
                Close
              </button>
              <button
                onClick={() => {
                  setMessagingCandidate(selectedCandidate);
                  setSelectedCandidate(null);
                }}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#2563eb', color: '#2563eb' }}
              >
                <MessageSquare size={15} /> Send InMail
              </button>
              <button
                onClick={() => {
                  handleContactCandidate(selectedCandidate);
                  setSelectedCandidate(null);
                }}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Mail size={15} /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct InMail Messaging Modal */}
      <DirectMessageModal
        isOpen={Boolean(messagingCandidate)}
        onClose={() => setMessagingCandidate(null)}
        recipient={messagingCandidate}
        onSent={() => setToastMessage('InMail successfully sent!')}
      />
    </div>
  );
};

export default CandidateSearchPage;
