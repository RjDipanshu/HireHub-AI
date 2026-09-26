import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Heart,
  Code2,
  Gift,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  DollarSign,
  Clock,
  Send,
  Star,
  Compass,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart2,
  Share2,
  X,
  Edit3,
} from 'lucide-react';
import jobService from '../../services/jobService';
import recruiterService from '../../services/recruiterService';
import reviewService from '../../services/reviewService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ─── Star Rating Helper ────────────────────────────────────────────────────
function StarRow({ rating, size = 16, color = '#f59e0b' }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? color : 'none'}
          color={color}
          style={{ opacity: n <= Math.round(rating) ? 1 : 0.3 }}
        />
      ))}
    </span>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────
function DiffBadge({ diff }) {
  const map = {
    Easy:   { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    Medium: { bg: 'rgba(245,158,11,0.12)',  color: '#d97706' },
    Hard:   { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626' },
  };
  const s = map[diff] || map.Medium;
  return (
    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>
      {diff}
    </span>
  );
}

// ─── Rating Breakdown Bar ─────────────────────────────────────────────────
function RatingBar({ label, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
      <span style={{ width: 20, textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      <Star size={11} fill='#f59e0b' color='#f59e0b' />
      <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ width: 28, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{count}</span>
    </div>
  );
}

const DEMO_COMPANIES = {
  1: {
    id: 1,
    name: 'Flipkart',
    tagline: 'India’s Leading E-Commerce Marketplace & Tech Pioneer',
    industry: 'E-Commerce & Retail Tech',
    location: 'Bengaluru, Karnataka, India',
    size: '10,000+ Employees',
    website: 'https://flipkart.com',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80',
    isVerified: true,
    cultureStatement:
      'At Flipkart, we are customer-obsessed innovators who dare to think big, experiment fearlessly, and build infrastructure that powers commerce for over 500 million Indians. We value audacity, bias for action, integrity, and extreme ownership.',
    officeLocations: 'Bengaluru (HQ), Mumbai, Delhi NCR, Hyderabad, Chennai',
    techStack: [
      'Java 17',
      'Spring Boot',
      'Kafka',
      'HBase',
      'React',
      'Kubernetes',
      'Redis',
      'Elasticsearch',
      'MySQL',
      'GCP',
      'Docker',
      'Python',
    ],
    benefits: [
      'Comprehensive Family Health Cover (₹10 Lakhs)',
      'High-Growth Flipkart ESOP Grants',
      'Flexible Hybrid Work & ₹50k Home Office Setup',
      '₹1,20,000 Annual Learning & Upskilling Budget',
      'Free Daily Gourmet Lunch & Transport Cab Facility',
      '26 Weeks Paid Maternity & 4 Weeks Paternity Leave',
      'Onsite Wellness Clinics & Gym Subsidies',
      'Annual Flipkart Big Billion Hackathon & Innovation Awards',
    ],
    culturePillars: [
      { title: 'Audacity', desc: 'Thinking beyond boundaries to solve complex nationwide scale problems.' },
      { title: 'Customer First', desc: 'Every line of code and algorithm prioritizes consumer experience.' },
      { title: 'Bias for Action', desc: 'We value rapid iteration, continuous delivery, and thoughtful risks.' },
      { title: 'Extreme Ownership', desc: 'You own your feature from design document to p99 latency in production.' },
    ],
  },
  2: {
    id: 2,
    name: 'Swiggy',
    tagline: 'Delivering Convenience Across India with Hyperlocal Intelligence',
    industry: 'Food Delivery & Hyperlocal Logistics',
    location: 'Bengaluru, Karnataka, India',
    size: '5,000 - 10,000 Employees',
    website: 'https://swiggy.com',
    logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&auto=format&fit=crop&q=80',
    isVerified: true,
    cultureStatement:
      'Swiggy is driven by the mission of elevating the quality of life of urban consumers through unmatched convenience. We engineer high-velocity routing engines, real-time demand prediction models, and resilient delivery networks.',
    officeLocations: 'Bengaluru (HQ), Gurugram, Pune, Hyderabad',
    techStack: [
      'Go',
      'Java',
      'Python',
      'Kafka',
      'Apache Flink',
      'React Native',
      'Kubernetes',
      'AWS',
      'Redis Cluster',
      'PostgreSQL',
    ],
    benefits: [
      'Swiggy ESOPs with Annual Buyback Windows',
      'Medical Insurance with 100% Dependent Coverage',
      'Permanent Remote & Flexible Work Model for Tech Teams',
      'Generous Monthly Swiggy Food Allowance',
      'Wellness Days & Unlimited Sick Time',
      'Career Mentorship & Executive Leadership Coaching',
    ],
    culturePillars: [
      { title: 'Consumer Delight', desc: 'Uncompromising standard for 30-minute delivery promise.' },
      { title: 'Always Curious, Always Learning', desc: 'Continuous experimentation and data-driven post-mortems.' },
      { title: 'Be Humble', desc: 'Collaborative engineering where the best idea always wins.' },
    ],
  },
  3: {
    id: 3,
    name: 'Zepto',
    tagline: '10-Minute Grocery Delivery Powered by Precision Tech',
    industry: 'Quick Commerce & Dark Store Logistics',
    location: 'Mumbai / Bengaluru, India',
    size: '2,000 - 5,000 Employees',
    website: 'https://zeptonow.com',
    logoUrl: 'https://images.unsplash.com/photo-1534972195531-a756b1126f25?w=120&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80',
    isVerified: true,
    cultureStatement:
      'Zepto is redefining quick commerce in India with sub-second routing algorithms, dark store automation, and blistering execution speed. We are young, hungry, and building India’s next generational tech giant.',
    officeLocations: 'Bengaluru, Mumbai (HQ), Delhi NCR',
    techStack: [
      'Node.js',
      'Go',
      'Next.js',
      'PostgreSQL',
      'Redis',
      'RabbitMQ',
      'Kubernetes',
      'GCP',
      'GraphQL',
    ],
    benefits: [
      'Aggressive ESOP Packages for Early Core Engineers',
      'Comprehensive Health & Critical Illness Protection',
      'Catered Meals & Energy Bar in Offices',
      'Fast-Track Career Growth & Bi-annual Promotions',
      'Relocation Assistance to Bengaluru/Mumbai Tech Hubs',
    ],
    culturePillars: [
      { title: 'Velocity & Hustle', desc: 'Move fast, break bottlenecks, and deliver measurable impact daily.' },
      { title: 'Frugality & Efficiency', desc: 'Optimize every delivery route and dark store footprint.' },
      { title: 'Customer Obsession', desc: 'Precision delivery in under 10 minutes, rain or shine.' },
    ],
  },
};

// ─── Demo Reviews per Company ─────────────────────────────────────────────
const DEMO_REVIEWS = {
  1: [
    { id:'r1', reviewer:'Senior Software Engineer', rating:4, title:'Great engineering culture, fast-paced growth', pros:'Top-tier engineers, excellent scale problems, good ESOP program and benefits package.', cons:'Work-life balance can suffer during sale seasons. On-call rotation is demanding.', recommended:true, ceoApproval:true, createdAt:'2026-07-12', helpful:24 },
    { id:'r2', reviewer:'Product Manager', rating:5, title:'Best place to build consumer-scale products in India', pros:'Billion-user scale, great autonomy, leadership invests in your growth trajectory.', cons:'Red tape between cross-functional teams can slow down decisions.', recommended:true, ceoApproval:true, createdAt:'2026-05-21', helpful:18 },
    { id:'r3', reviewer:'Data Engineer', rating:3, title:'Good tech stack but high attrition in data teams', pros:'Cutting-edge Kafka/HBase infrastructure. Real data at petabyte scale.', cons:'Data team is understaffed vs product team. Roadmap changes too frequently.', recommended:false, ceoApproval:true, createdAt:'2026-03-08', helpful:9 },
  ],
  2: [
    { id:'r4', reviewer:'Backend Engineer (Go)', rating:5, title:'Engineering paradise — freedom and scale combined', pros:'Fully remote-friendly, Go microservices at insane throughput, great L&D budget.', cons:"Food allowance isn't enough for rising Bengaluru costs. Onboarding is chaotic.", recommended:true, ceoApproval:true, createdAt:'2026-08-01', helpful:31 },
    { id:'r5', reviewer:'SDE-2', rating:4, title:'High-growth with real engineering challenges', pros:'Collaborative culture, flat hierarchy, smart colleagues. ML-heavy problems are exciting.', cons:'Interview process is very long. Sometimes 6+ rounds.', recommended:true, ceoApproval:false, createdAt:'2026-06-15', helpful:14 },
  ],
  3: [
    { id:'r6', reviewer:'Full Stack Developer', rating:4, title:'Startup energy with unicorn ambitions', pros:'ESOPs could be life-changing. Young leadership is transparent. Ship fast culture.', cons:'No formal mentorship. Processes are immature. High pressure environment.', recommended:true, ceoApproval:true, createdAt:'2026-07-28', helpful:22 },
    { id:'r7', reviewer:'DevOps Engineer', rating:3, title:'Exciting product but burnout is real', pros:'Solving genuinely hard logistics problems. Modern cloud-native stack.', cons:'On-call every other week. No clear career ladder yet.', recommended:false, ceoApproval:true, createdAt:'2026-04-10', helpful:7 },
  ],
};

// ─── Demo Interview Experiences per Company ────────────────────────────────
const DEMO_INTERVIEWS = {
  1: [
    { id:'i1', role:'Senior Software Engineer', rounds:5, difficulty:'Hard', outcome:'Offer', experience:'Positive', summary:'5 rounds: Online Coding (2 hrs DSA), System Design, Technical Deep Dive (Java concurrency), Bar Raiser, and HR. Questions focused on distributed system design and high-throughput Java microservices. Offer received in 3 weeks.', questions:['Design a distributed rate limiter for 1M RPS','Implement LRU cache with O(1) operations','Design Flipkart product search ranking system'], createdAt:'2026-08-05' },
    { id:'i2', role:'Product Analyst', rounds:3, difficulty:'Medium', outcome:'No Offer', experience:'Neutral', summary:'Hackerrank screening, followed by 2 case study rounds. Cases were about pricing strategy and customer retention. Feedback was never shared.', questions:['How would you increase repeat purchase rate?','Estimate GMV for Flipkart Big Billion Day'], createdAt:'2026-06-22' },
  ],
  2: [
    { id:'i3', role:'Backend Engineer (Go)', rounds:4, difficulty:'Hard', outcome:'Offer', experience:'Positive', summary:'Machine coding round (real-time routing engine simulation), System design (live order tracking at 100k events/sec), Deep dive on Go concurrency patterns, and culture fit. Very technical, very fair.', questions:['Implement a concurrent order dispatching queue','Design Swiggy live order tracking WebSocket architecture'], createdAt:'2026-07-14' },
  ],
  3: [
    { id:'i4', role:'Full Stack Developer', rounds:3, difficulty:'Medium', outcome:'Offer', experience:'Positive', summary:'Fast process — all 3 rounds in one week. Coding round was LeetCode medium, followed by system design for dark store inventory, and a culture call with the CTO.', questions:['Design real-time inventory management for 200 dark stores','Build a React component for live delivery tracking map'], createdAt:'2026-08-18' },
  ],
};

export const CompanyDetailsPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Social: Reviews
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer: '', rating: 4, title: '', pros: '', cons: '', recommended: true });

  // Social: Interview Experiences
  const [interviewExps, setInterviewExps] = useState([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [intForm, setIntForm] = useState({ role: '', rounds: 3, difficulty: 'Medium', outcome: 'Offer', summary: '', questions: '' });

  useEffect(() => {
    loadCompanyAndJobs();
  }, [id]);

  const loadCompanyAndJobs = async () => {
    setLoading(true);
    try {
      const compId = id ? parseInt(id, 10) : 1;
      let compData = null;

      // Try fetching from backend API
      try {
        const res = await recruiterService.getCompanyById(compId);
        if (res && res.name) {
          let techArr = [];
          let benefitsArr = [];
          try { techArr = res.techStackJson ? JSON.parse(res.techStackJson) : []; } catch {}
          try { benefitsArr = res.benefitsJson ? JSON.parse(res.benefitsJson) : []; } catch {}

          compData = {
            ...res,
            techStack: techArr.length > 0 ? techArr : (DEMO_COMPANIES[compId]?.techStack || DEMO_COMPANIES[1].techStack),
            benefits: benefitsArr.length > 0 ? benefitsArr : (DEMO_COMPANIES[compId]?.benefits || DEMO_COMPANIES[1].benefits),
            cultureStatement: res.cultureStatement || DEMO_COMPANIES[compId]?.cultureStatement || DEMO_COMPANIES[1].cultureStatement,
            officeLocations: res.officeLocations || DEMO_COMPANIES[compId]?.officeLocations || DEMO_COMPANIES[1].officeLocations,
            coverBannerUrl: res.coverBannerUrl || DEMO_COMPANIES[compId]?.coverBannerUrl || DEMO_COMPANIES[1].coverBannerUrl,
            tagline: DEMO_COMPANIES[compId]?.tagline || `${res.name} — High Growth Tech Enterprise`,
            culturePillars: DEMO_COMPANIES[compId]?.culturePillars || DEMO_COMPANIES[1].culturePillars,
          };
        }
      } catch (e) {
        console.warn('API fetch company fallback to demo:', e);
      }

      if (!compData) {
        compData = DEMO_COMPANIES[compId] || DEMO_COMPANIES[1];
      }

      setCompany(compData);

      // Fetch live jobs for this company
      try {
        const jobsRes = await jobService.getJobs();
        const allJobs = jobsRes?.content || jobsRes || [];
        const filtered = allJobs.filter((j) =>
          j.companyName?.toLowerCase().includes(compData.name.toLowerCase()) ||
          j.company?.name?.toLowerCase().includes(compData.name.toLowerCase())
        );
        setOpenJobs(filtered.length > 0 ? filtered : allJobs.slice(0, 3));
      } catch (jErr) {
        console.warn('Could not fetch jobs:', jErr);
      }

      // Load social reviews — try reviewService API, fall back to stored/demo seeds
      let apiReviews = [];
      try {
        const revRes = await reviewService.getCompanyReviews(compId);
        if (revRes && revRes.content && revRes.content.length > 0) {
          apiReviews = revRes.content.map(r => ({
            id: r.id,
            reviewer: r.reviewerName || r.jobTitle || 'Employee',
            rating: Math.round(r.rating || 5),
            title: r.reviewTitle,
            pros: r.pros,
            cons: r.cons,
            recommended: r.isRecommended !== false,
            createdAt: r.createdAt ? r.createdAt.slice(0, 10) : 'Recent',
            helpful: r.helpfulCount || 0,
          }));
        }
      } catch (err) {
        console.warn('API reviews fetch notice:', err);
      }

      const storedReviews = (() => { try { return JSON.parse(localStorage.getItem(`hh_reviews_${compId}`) || '[]'); } catch { return []; } })();
      setReviews([...apiReviews, ...storedReviews, ...(DEMO_REVIEWS[compId] || DEMO_REVIEWS[1])]);
      const storedInts = (() => { try { return JSON.parse(localStorage.getItem(`hh_interviews_${compId}`) || '[]'); } catch { return []; } })();
      setInterviewExps([...storedInts, ...(DEMO_INTERVIEWS[compId] || DEMO_INTERVIEWS[1])]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.title || !reviewForm.pros) return;
    const compId = id ? parseInt(id, 10) : 1;
    const newReview = { ...reviewForm, id: 'usr-r-' + Date.now(), createdAt: new Date().toISOString().split('T')[0], helpful: 0 };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    const userAdded = updated.filter(r => r.id.startsWith('usr-r-'));
    try { localStorage.setItem(`hh_reviews_${compId}`, JSON.stringify(userAdded)); } catch {}

    // Persist to backend if possible
    try {
      await reviewService.addCompanyReview(compId, {
        reviewTitle: reviewForm.title,
        rating: reviewForm.rating,
        pros: reviewForm.pros,
        cons: reviewForm.cons,
        isRecommended: reviewForm.recommended,
        jobTitle: reviewForm.reviewer || 'Employee',
      });
    } catch (apiErr) {
      console.warn('Review saved locally, backend sync note:', apiErr?.message);
    }

    setShowReviewModal(false);
    setReviewForm({ reviewer: '', rating: 4, title: '', pros: '', cons: '', recommended: true });
  };

  const handleSubmitInterview = (e) => {
    e.preventDefault();
    if (!intForm.role || !intForm.summary) return;
    const compId = id ? parseInt(id, 10) : 1;
    const newInt = { ...intForm, id: 'usr-i-' + Date.now(), createdAt: new Date().toISOString().split('T')[0], questions: intForm.questions.split('\n').filter(Boolean), experience: 'Positive' };
    const updated = [newInt, ...interviewExps];
    setInterviewExps(updated);
    const userAdded = updated.filter(i => i.id.startsWith('usr-i-'));
    try { localStorage.setItem(`hh_interviews_${compId}`, JSON.stringify(userAdded)); } catch {}
    setShowInterviewModal(false);
    setIntForm({ role: '', rounds: 3, difficulty: 'Medium', outcome: 'Offer', summary: '', questions: '' });
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <LoadingSpinner label="Loading company life page..." size="lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Company Not Found</h2>
        <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse All Jobs</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* 1. Hero Cover Banner */}
      <div
        style={{
          position: 'relative',
          height: '280px',
          borderRadius: 'var(--radius-lg, 16px)',
          overflow: 'hidden',
          background: company.coverBannerUrl
            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.85)), url(${company.coverBannerUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem' }}>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
              }}
            >
              <Globe size={14} /> Visit Website <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* 2. Brand Identity Floating Card */}
      <div
        style={{
          margin: '-60px 1.5rem 0',
          position: 'relative',
          zIndex: 10,
          background: 'var(--bg-surface, #ffffff)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          padding: '1.75rem 2rem',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '18px',
              background: '#ffffff',
              border: '2px solid var(--border-subtle, #e2e8f0)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
              flexShrink: 0,
            }}
          >
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            ) : (
              <Building2 size={44} color="#6366f1" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {company.name}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={14} /> Verified Employer
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#6366f1',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <Star size={12} fill="#6366f1" /> Top Tier Tech
              </span>
            </div>

            <p style={{ margin: '0.35rem 0 0.65rem', fontSize: '1.02rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {company.tagline}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={14} color="#6366f1" /> {company.industry}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={14} color="#10b981" /> {company.size}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} color="#f59e0b" /> {company.location}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setActiveTab('jobs');
              document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem' }}
          >
            <Briefcase size={16} /> View {openJobs.length} Open Positions
          </button>
        </div>
      </div>

      {/* 3. Navigation Showcase Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          margin: '2rem 1.5rem 1.5rem',
          borderBottom: '2px solid var(--border-subtle, #e2e8f0)',
          paddingBottom: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'tech', label: 'Tech Stack', icon: Code2, count: company.techStack?.length },
          { id: 'benefits', label: 'Benefits', icon: Gift, count: company.benefits?.length },
          { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
          { id: 'interviews', label: 'Interviews', icon: MessageSquare, count: interviewExps.length },
          { id: 'jobs', label: `Jobs (${openJobs.length})`, icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: isActive ? 'var(--primary-600, #6366f1)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={15} />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle, #f1f5f9)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}
      <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* OVERVIEW TAB */}
        {(activeTab === 'overview' || activeTab === 'all') && (
          <>
            {/* Life at Company & Culture statement */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <Heart size={22} color="#ec4899" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Life & Culture at {company.name}</h2>
              </div>
              <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: 'var(--text-primary)', margin: '0 0 1.5rem' }}>
                {company.cultureStatement}
              </p>

              {/* Office Locations */}
              {company.officeLocations && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Major Engineering Hubs & Campuses
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {company.officeLocations.split(',').map((loc, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#d97706',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                        }}
                      >
                        <MapPin size={14} /> {loc.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Culture Pillars (Swiggy/Zepto/Flipkart style) */}
            {company.culturePillars && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={20} color="#6366f1" /> Core Engineering Values & Work Principles
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {company.culturePillars.map((pillar, pIdx) => (
                    <div
                      key={pIdx}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        borderLeft: `4px solid ${pIdx % 2 === 0 ? '#6366f1' : '#10b981'}`,
                      }}
                    >
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>
                        {pillar.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.55', color: 'var(--text-secondary)' }}>
                        {pillar.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TECH STACK TAB */}
        {(activeTab === 'tech' || activeTab === 'overview') && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Code2 size={22} color="#6366f1" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Tech Stack & Engineering Ecosystem</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Technologies and systems deployed at scale in production</p>
                </div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                {company.techStack?.length || 0} Technologies
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {company.techStack && company.techStack.map((tech, tIdx) => (
                <div
                  key={tIdx}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Sparkles size={13} color="#6366f1" />
                  {tech}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BENEFITS TAB */}
        {(activeTab === 'benefits' || activeTab === 'overview') && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <Gift size={22} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Employee Benefits & Perks</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Comprehensive rewards, wellness, and career growth benefits</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {company.benefits && company.benefits.map((benefit, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1.15rem',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.07)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPEN POSITIONS TAB */}
        <div id="open-positions" className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Briefcase size={22} color="#6366f1" />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Active Open Positions</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Join {company.name} and build world-class products</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {openJobs.length} Positions Available
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {openJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  background: 'var(--bg-card, #ffffff)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
                    <Link to={`/jobs/${job.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {job.title}
                    </Link>
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.84rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} color="#f59e0b" /> {job.location || company.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} color="#10b981" /> {job.workMode || 'Hybrid / In-Office'}
                    </span>
                    {job.salaryRange && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: '#16a34a' }}>
                        ₹ {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                  >
                    Apply Now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REVIEWS TAB ─────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (() => {
        const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
        const recommended = reviews.filter(r => r.recommended).length;
        const ceoApproval = reviews.filter(r => r.ceoApproval).length;
        const breakdown = [5,4,3,2,1].map(n => ({ n, count: reviews.filter(r => Math.round(r.rating) === n).length }));
        return (
          <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Star size={22} color="#f59e0b" fill="#f59e0b" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Employee Reviews</h2>
              </div>
              <button onClick={() => setShowReviewModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit3 size={14} /> Write a Review
              </button>
            </div>

            {/* Summary Row */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{avg}</div>
                <StarRow rating={parseFloat(avg)} size={18} />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{reviews.length} reviews</div>
              </div>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {breakdown.map(b => <RatingBar key={b.n} label={b.n} count={b.count} total={reviews.length} />)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <ThumbsUp size={16} color="#10b981" />
                  <span style={{ fontWeight: 700 }}>{reviews.length ? Math.round((recommended / reviews.length) * 100) : 0}%</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Recommend</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#6366f1" />
                  <span style={{ fontWeight: 700 }}>{reviews.length ? Math.round((ceoApproval / reviews.length) * 100) : 0}%</span>
                  <span style={{ color: 'var(--text-secondary)' }}>CEO Approval</span>
                </div>
              </div>
            </div>

            {/* Review Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.map(rv => (
                <div key={rv.id} style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{rv.title}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rv.reviewer} · {rv.createdAt}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRow rating={rv.rating} size={14} />
                      {rv.recommended && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', color: '#059669' }}>✓ Recommends</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#10b981', fontSize: '0.8rem' }}>✅ Pros</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{rv.pros}</p>
                    </div>
                    {rv.cons && (
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#ef4444', fontSize: '0.8rem' }}>⚠️ Cons</p>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{rv.cons}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    👍 {rv.helpful} people found this helpful
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── INTERVIEWS TAB ───────────────────────────────────────────── */}
      {activeTab === 'interviews' && (
        <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MessageSquare size={22} color="#6366f1" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Interview Experiences</h2>
            </div>
            <button onClick={() => setShowInterviewModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Share2 size={14} /> Share Your Experience
            </button>
          </div>

          {/* Stats Row */}
          {interviewExps.length > 0 && (() => {
            const offerRate = Math.round((interviewExps.filter(i => i.outcome === 'Offer').length / interviewExps.length) * 100);
            const avgRounds = (interviewExps.reduce((s, i) => s + (i.rounds || 3), 0) / interviewExps.length).toFixed(1);
            const diffMap = { Easy: 0, Medium: 0, Hard: 0 };
            interviewExps.forEach(i => { if (diffMap[i.difficulty] !== undefined) diffMap[i.difficulty]++; });
            return (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[{ label: 'Offer Rate', value: `${offerRate}%`, color: '#10b981' }, { label: 'Avg. Rounds', value: avgRounds, color: '#6366f1' }, { label: 'Difficulty', value: Object.entries(diffMap).sort((a,b) => b[1]-a[1])[0][0], color: '#f59e0b' }].map(s => (
                  <div key={s.label} style={{ flex: 1, minWidth: 100, padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {interviewExps.map(ie => (
              <div key={ie.id} style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{ie.role}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ie.createdAt}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <DiffBadge diff={ie.difficulty} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: ie.outcome === 'Offer' ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)', color: ie.outcome === 'Offer' ? '#059669' : '#64748b' }}>{ie.outcome}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ie.rounds} rounds</span>
                  </div>
                </div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{ie.summary}</p>
                {ie.questions?.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)' }}>Questions Asked:</p>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {ie.questions.map((q, qi) => <li key={qi}>{q}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WRITE REVIEW MODAL ──────────────────────────────────────── */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 560, width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>✍️ Write a Review for {company?.name}</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Your Role *</label><input className="input" required value={reviewForm.reviewer} onChange={e => setReviewForm({...reviewForm, reviewer: e.target.value})} placeholder="e.g. Senior Software Engineer" /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Overall Rating *</label>
                <div style={{ display: 'flex', gap: 4 }}>{[1,2,3,4,5].map(n => <button type="button" key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Star size={28} fill={n <= reviewForm.rating ? '#f59e0b' : 'none'} color="#f59e0b" /></button>)}</div>
              </div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Review Title *</label><input className="input" required value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} placeholder="Summarize your experience in one line" /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>✅ Pros *</label><textarea className="input" rows={3} required value={reviewForm.pros} onChange={e => setReviewForm({...reviewForm, pros: e.target.value})} placeholder="What do you like most?" /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>⚠️ Cons</label><textarea className="input" rows={3} value={reviewForm.cons} onChange={e => setReviewForm({...reviewForm, cons: e.target.value})} placeholder="What could be improved?" /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="rec" checked={reviewForm.recommended} onChange={e => setReviewForm({...reviewForm, recommended: e.target.checked})} />
                <label htmlFor="rec" style={{ fontSize: '0.88rem', fontWeight: 600 }}>I recommend this company to a friend</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SHARE INTERVIEW EXPERIENCE MODAL ────────────────────────── */}
      {showInterviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 560, width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🎯 Share Interview Experience — {company?.name}</h3>
              <button onClick={() => setShowInterviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Role Applied For *</label><input className="input" required value={intForm.role} onChange={e => setIntForm({...intForm, role: e.target.value})} placeholder="e.g. Senior Backend Engineer" /></div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 120 }}><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>No. of Rounds</label><input type="number" className="input" min={1} max={10} value={intForm.rounds} onChange={e => setIntForm({...intForm, rounds: parseInt(e.target.value)})} /></div>
                <div style={{ flex: 1, minWidth: 120 }}><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Difficulty</label><select className="input" value={intForm.difficulty} onChange={e => setIntForm({...intForm, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                <div style={{ flex: 1, minWidth: 120 }}><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Outcome</label><select className="input" value={intForm.outcome} onChange={e => setIntForm({...intForm, outcome: e.target.value})}><option>Offer</option><option>No Offer</option><option>Pending</option></select></div>
              </div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Interview Process Summary *</label><textarea className="input" rows={4} required value={intForm.summary} onChange={e => setIntForm({...intForm, summary: e.target.value})} placeholder="Describe the interview process, timeline, and overall experience..." /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Questions Asked (one per line)</label><textarea className="input" rows={3} value={intForm.questions} onChange={e => setIntForm({...intForm, questions: e.target.value})} placeholder="Design a rate limiter\nImplement LRU cache..." /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailsPage;
