/**
 * PublicCandidateProfilePage — HireHub AI
 *
 * Shareable public profile for candidates.
 * URL: /candidates/:id
 *
 * - Accessible without authentication (no ProtectedRoute wrapper)
 * - Calls GET /api/v1/candidates/:id (backend must allow public read)
 * - Shows professional summary, skills, experience, education
 * - Provides "Contact Candidate" button (links to Messages if logged in)
 * - Includes shareable URL copy button (Naukri-style)
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import candidateService from '../../services/candidateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
    User,
    MapPin,
    Mail,
    Globe,
    Briefcase,
    GraduationCap,
    Award,
    Link2,
    CheckCircle2,
    ArrowLeft,
    MessageSquare,
    Share2,
    ExternalLink,
    Code2,
    Calendar,
} from 'lucide-react';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const levelColor = {
    EXPERT:        { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
    ADVANCED:      { bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
    INTERMEDIATE:  { bg: 'rgba(245,158,11,0.12)',  color: '#d97706' },
    BEGINNER:      { bg: 'rgba(148,163,184,0.12)', color: '#64748b' },
};

const levelStyle = (level) =>
    levelColor[level?.toUpperCase()] || levelColor.BEGINNER;

function SkillBadge({ skill }) {
    const s = levelStyle(skill.proficiencyLevel);
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: s.bg,
            color: s.color,
            border: `1px solid ${s.color}30`,
        }}>
            {skill.skillName || skill.name}
            {skill.proficiencyLevel && (
                <span style={{ opacity: 0.7, fontWeight: 400, fontSize: '0.7rem' }}>
                    · {skill.proficiencyLevel.charAt(0) + skill.proficiencyLevel.slice(1).toLowerCase()}
                </span>
            )}
        </span>
    );
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
export function PublicCandidateProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [copied, setCopied]     = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            try {
                const data = await candidateService.getProfileById(id);
                setProfile(data);
            } catch (err) {
                console.error('[PublicCandidateProfile] Load error:', err);
                setError('This profile is not available or does not exist.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // ── Loading ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ padding: '5rem 1rem', textAlign: 'center' }}>
                <LoadingSpinner label="Loading public profile..." size="lg" />
            </div>
        );
    }

    // ── Error / Not Found ─────────────────────────────────────────────
    if (error || !profile) {
        return (
            <div style={{ maxWidth: 600, margin: '5rem auto', padding: '0 1rem', textAlign: 'center' }}>
                <User size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Profile Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {error || 'This candidate profile does not exist or has been made private.'}
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
                    Browse Open Jobs
                </button>
            </div>
        );
    }

    const {
        fullName, headline, location, summary,
        email, portfolioUrl, linkedinUrl, githubUrl,
        skills = [], experiences = [], educations = [],
        certifications = [], yearsOfExperience,
        preferredJobType, profilePictureUrl,
    } = profile;

    const initials = (fullName || 'U')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
            {/* ── Back Navigation ─────────────────────────────────────── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(-1)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <ArrowLeft size={15} /> Back
                </button>
            </div>

            {/* ── Hero / Header Card ─────────────────────────────────── */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    {profilePictureUrl ? (
                        <img
                            src={profilePictureUrl}
                            alt={fullName}
                            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)', flexShrink: 0 }}
                        />
                    ) : (
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-400) 100%)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 800,
                        }}>
                            {initials}
                        </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
                            {fullName || 'Candidate'}
                        </h1>
                        {headline && (
                            <p style={{ fontSize: '1rem', color: 'var(--primary-400)', fontWeight: 600, margin: '0 0 0.5rem' }}>
                                {headline}
                            </p>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
                            {location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={13} /> {location}
                                </span>
                            )}
                            {yearsOfExperience != null && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Briefcase size={13} /> {yearsOfExperience}+ yrs experience
                                </span>
                            )}
                            {preferredJobType && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={13} /> {preferredJobType.replace('_', ' ')}
                                </span>
                            )}
                        </div>

                        {/* Social links */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {portfolioUrl && (
                                <a href={portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: '0.78rem' }}>
                                    <Globe size={12} /> Portfolio <ExternalLink size={11} />
                                </a>
                            )}
                            {linkedinUrl && (
                                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: '0.78rem' }}>
                                    <Link2 size={12} /> LinkedIn <ExternalLink size={11} />
                                </a>
                            )}
                            {githubUrl && (
                                <a href={githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: '0.78rem' }}>
                                    <Code2 size={12} /> GitHub <ExternalLink size={11} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                        <Link to={`/recruiter/messages?to=${id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MessageSquare size={14} /> Contact
                        </Link>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={handleCopyLink}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            {copied ? <CheckCircle2 size={14} color="#10b981" /> : <Share2 size={14} />}
                            {copied ? 'Copied!' : 'Share Profile'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Summary ────────────────────────────────────────────── */}
            {summary && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={16} color="var(--primary-400)" /> About
                    </h2>
                    <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{summary}</p>
                </div>
            )}

            {/* ── Skills ─────────────────────────────────────────────── */}
            {skills.length > 0 && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Code2 size={16} color="var(--primary-400)" /> Skills
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {skills.map((s, idx) => <SkillBadge key={s.id || idx} skill={s} />)}
                    </div>
                </div>
            )}

            {/* ── Experience ─────────────────────────────────────────── */}
            {experiences.length > 0 && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Briefcase size={16} color="var(--primary-400)" /> Work Experience
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {experiences.map((exp, idx) => (
                            <div key={exp.id || idx} style={{ paddingBottom: idx < experiences.length - 1 ? '1.25rem' : 0, borderBottom: idx < experiences.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.35rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{exp.jobTitle}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600, margin: '2px 0 0' }}>{exp.companyName}</p>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                {exp.location && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <MapPin size={11} /> {exp.location}
                                    </p>
                                )}
                                {exp.description && (
                                    <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Education ──────────────────────────────────────────── */}
            {educations.length > 0 && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <GraduationCap size={16} color="var(--primary-400)" /> Education
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {educations.map((edu, idx) => (
                            <div key={edu.id || idx} style={{ paddingBottom: idx < educations.length - 1 ? '1rem' : 0, borderBottom: idx < educations.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600, margin: '2px 0 0' }}>{edu.institutionName}</p>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {edu.startYear} – {edu.endYear || 'Present'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Certifications ─────────────────────────────────────── */}
            {certifications.length > 0 && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Award size={16} color="var(--primary-400)" /> Certifications
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {certifications.map((cert, idx) => (
                            <div key={cert.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{cert.name || cert.certificationName}</p>
                                    {cert.issuingOrganization && (
                                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {cert.issuingOrganization}{cert.issueDate && ` · ${cert.issueDate}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Footer CTA ─────────────────────────────────────────── */}
            <div className="card card-ai" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Interested in connecting with <strong>{fullName?.split(' ')[0] || 'this candidate'}</strong>?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to={`/recruiter/messages?to=${id}`} className="btn btn-primary">
                        <MessageSquare size={15} style={{ marginRight: 6 }} /> Send a Message
                    </Link>
                    <button className="btn btn-outline" onClick={handleCopyLink} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {copied ? <CheckCircle2 size={15} color="#10b981" /> : <Share2 size={15} />}
                        {copied ? 'Link Copied!' : 'Share This Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PublicCandidateProfilePage;
