import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Target, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  X, 
  RotateCcw,
  Check,
  ShieldCheck,
  Zap,
  BookOpen,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import assessmentService from '../../services/assessmentService';

export default function CandidateAssessmentsPage() {
    const [assessments, setAssessments] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Active quiz runner state
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(300);
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'INCORRECT' | 'CORRECT'

    useEffect(() => {
        loadAssessmentsAndBadges();
    }, []);

    // Countdown timer effect
    useEffect(() => {
        if (!activeQuiz || quizResult || timeLeftSeconds <= 0) return;

        const timer = setInterval(() => {
            setTimeLeftSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeQuiz, quizResult, timeLeftSeconds]);

    const loadAssessmentsAndBadges = async () => {
        setLoading(true);
        try {
            const [catalog, myBadges] = await Promise.all([
                assessmentService.getAllAssessments(),
                assessmentService.getMyBadges()
            ]);
            setAssessments(catalog || []);
            setBadges(myBadges || []);
        } catch (err) {
            console.error('Error loading assessments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = async (topicId) => {
        try {
            const quizData = await assessmentService.getAssessmentQuestions(topicId);
            setActiveQuiz(quizData);
            setCurrentQIndex(0);
            setAnswers({});
            setTimeLeftSeconds((quizData.durationMinutes || 5) * 60);
            setQuizResult(null);
            setReviewFilter('ALL');
        } catch (err) {
            alert('Failed to start assessment: ' + err.message);
        }
    };

    const handleSelectOption = (qId, optionIdx) => {
        setAnswers((prev) => ({
            ...prev,
            [qId]: optionIdx
        }));
    };

    const handleAutoSubmit = () => {
        handleSubmitQuiz();
    };

    const handleSubmitQuiz = async () => {
        if (!activeQuiz || submitting) return;
        setSubmitting(true);
        try {
            const result = await assessmentService.submitAssessment(activeQuiz.topicId, answers);
            setQuizResult(result);
            if (result.passed) {
                await loadAssessmentsAndBadges();
            }
        } catch (err) {
            alert('Submission error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isTopicPassed = (topic) => {
        return (
            topic.alreadyPassed ||
            badges.some(
                (b) =>
                    b.isPassed &&
                    (b.topicId === topic.topicId ||
                        b.skillName?.toLowerCase().includes(topic.title?.toLowerCase()) ||
                        b.badgeTitle?.toLowerCase().includes(topic.title?.toLowerCase()))
            )
        );
    };

    // Extract categories dynamically
    const categories = ['ALL', ...Array.from(new Set(assessments.map((a) => a.category).filter(Boolean)))];

    const filteredAssessments = assessments.filter((item) => {
        if (selectedCategory === 'ALL') return true;
        return item.category?.toLowerCase() === selectedCategory.toLowerCase();
    });

    const passedCount = badges.filter((b) => b.isPassed).length;

    // Filter question results for review
    const filteredReviewQuestions = (quizResult?.questionResults || []).filter((q) => {
        if (reviewFilter === 'CORRECT') return q.isCorrect;
        if (reviewFilter === 'INCORRECT') return !q.isCorrect;
        return true;
    });

    const incorrectCount = (quizResult?.questionResults || []).filter((q) => !q.isCorrect).length;
    const correctCount = (quizResult?.questionResults || []).filter((q) => q.isCorrect).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* 1. Hero Header Banner with KPIs */}
            <div className="assessment-hero" style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
                color: '#ffffff',
                padding: '2rem 2.5rem',
                borderRadius: 'var(--radius-xl, 16px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25)'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginBottom: '0.75rem',
                        letterSpacing: '0.05em'
                    }}>
                        <ShieldCheck size={14} />
                        <span>HIREHUB AI VERIFIED CREDENTIALS</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                        Trending Technical Skill Assessments & Quizzes
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#e0f2fe', maxWidth: '650px', lineHeight: 1.5 }}>
                        Take timed assessments across 18 high-demand domains. Review genuine correct answers, test your real-world readiness, and earn verified credentials recruiters look for.
                    </p>
                </div>

                <div className="assessment-kpi-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="assessment-kpi-card" style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', minWidth: '100px', textAlign: 'center' }}>
                        <div className="assessment-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{assessments.length || 18}</div>
                        <div className="assessment-kpi-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#bae6fd', textTransform: 'uppercase' }}>Available Quizzes</div>
                    </div>
                    <div className="assessment-kpi-card" style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', minWidth: '100px', textAlign: 'center' }}>
                        <div className="assessment-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#86efac' }}>{passedCount}</div>
                        <div className="assessment-kpi-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#bae6fd', textTransform: 'uppercase' }}>Badges Earned</div>
                    </div>
                    <div className="assessment-kpi-card" style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', minWidth: '100px', textAlign: 'center' }}>
                        <div className="assessment-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fef08a' }}>70%</div>
                        <div className="assessment-kpi-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#bae6fd', textTransform: 'uppercase' }}>Pass Mark</div>
                    </div>
                </div>
            </div>

            {/* 2. Earned Credentials Showcase Ribbon */}
            {passedCount > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg, 12px)', padding: '1.25rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Award size={18} color="#057642" />
                            <span>Your Verified Credentials Showcase</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                            {passedCount} active badge{passedCount > 1 ? 's' : ''} visible on your public recruiter profile
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {badges.filter((b) => b.isPassed).map((b, idx) => (
                            <div key={b.id || idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#ffffff', border: '1px solid #86efac', padding: '0.5rem 0.85rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                    ✓
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {b.badgeTitle || b.skillName}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                                        Verified Score: {b.score}% • Active Credential
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Category Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: selectedCategory === cat ? 700 : 500,
                            borderRadius: '9999px',
                            border: selectedCategory === cat ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
                            background: selectedCategory === cat ? '#e8f3fc' : '#ffffff',
                            color: selectedCategory === cat ? 'var(--color-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {cat === 'ALL' ? `All Quizzes (${assessments.length})` : cat}
                    </button>
                ))}
            </div>

            {/* 4. Assessment Cards Grid */}
            <div className="assessment-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem'
            }}>
                {filteredAssessments.map((topic) => {
                    const passed = isTopicPassed(topic);
                    return (
                        <div key={topic.topicId} className="assessment-card" style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease',
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="assessment-icon-box" style={{
                                        width: '46px',
                                        height: '46px',
                                        borderRadius: '10px',
                                        background: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        {topic.icon || '💻'}
                                    </div>
                                    {passed ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.72rem', fontWeight: 700 }}>
                                            <Check size={12} strokeWidth={3} />
                                            <span>VERIFIED</span>
                                        </span>
                                    ) : (
                                        <span style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                                            {topic.category || 'Engineering'}
                                        </span>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                                    {topic.title}
                                </h3>
                                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, minHeight: '3.6em' }}>
                                    {topic.description}
                                </p>
                            </div>

                            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Clock size={13} color="var(--text-muted)" />
                                        <span>{topic.durationMinutes || 5} Mins</span>
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <HelpCircle size={13} color="var(--text-muted)" />
                                        <span>{topic.totalQuestions || 5} Questions</span>
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Target size={13} color="var(--text-muted)" />
                                        <span>Pass: 70%</span>
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleStartQuiz(topic.topicId)}
                                    className={passed ? 'btn btn-secondary' : 'btn btn-primary'}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.65rem 1rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        borderRadius: '8px'
                                    }}
                                >
                                    {passed ? (
                                        <>
                                            <RotateCcw size={15} />
                                            <span>Retake Quiz</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Start Skill Quiz</span>
                                            <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 5. Interactive Assessment Runner & Genuine Answer Review Modal */}
            {activeQuiz && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="modal-content" style={{
                        maxWidth: '750px',
                        width: '100%',
                        maxHeight: '92vh',
                        padding: '0',
                        overflow: 'hidden',
                        borderRadius: '16px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.25rem 1.75rem',
                            background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {activeQuiz.category || 'Skill Assessment'}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                                    {activeQuiz.title}
                                </h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Countdown Clock (only while actively taking quiz) */}
                                {!quizResult && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        background: timeLeftSeconds < 60 ? '#fee2e2' : '#e0f2fe',
                                        color: timeLeftSeconds < 60 ? '#dc2626' : 'var(--color-primary)',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        <Clock size={15} />
                                        <span>{formatTimer(timeLeftSeconds)}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (quizResult || window.confirm('Are you sure you want to exit? Your progress in this assessment will be lost.')) {
                                            setActiveQuiz(null);
                                            setQuizResult(null);
                                        }
                                    }}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                                    title="Close"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
                            {quizResult ? (
                                /* Comprehensive Genuine Answer Review Screen */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Top Score Banner */}
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        background: quizResult.passed ? 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                                        border: `1px solid ${quizResult.passed ? '#86efac' : '#fecaca'}`
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: quizResult.passed ? '#dcfce7' : '#fee2e2',
                                            color: quizResult.passed ? '#15803d' : '#b91c1c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.75rem',
                                            margin: '0 auto 0.75rem auto',
                                            fontWeight: 800,
                                        }}>
                                            {quizResult.passed ? '✓' : '✕'}
                                        </div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                                            {quizResult.passed ? 'Congratulations! Assessment Passed 🎉' : 'Assessment Completed'}
                                        </h2>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                                            {quizResult.feedback}
                                        </p>

                                        {/* Score KPI Pills */}
                                        <div style={{
                                            display: 'inline-flex',
                                            gap: '1.5rem',
                                            padding: '0.85rem 1.75rem',
                                            background: '#ffffff',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: quizResult.passed ? '#057642' : '#dc2626' }}>
                                                    {quizResult.scorePercentage}%
                                                </div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Your Score</div>
                                            </div>
                                            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    {quizResult.correctCount} / {quizResult.totalQuestions}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Correct Answers</div>
                                            </div>
                                            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#475569' }}>
                                                    70%
                                                </div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pass Target</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Genuine Answer Review Section Header with Filter Tabs */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '0.75rem',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '2px solid #f1f5f9'
                                    }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <BookOpen size={18} color="var(--color-primary)" />
                                                <span>Question-by-Question Genuine Answer Review</span>
                                            </h4>
                                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Inspect genuine correct answers, your selections, and technical explanations.
                                            </p>
                                        </div>

                                        {/* Filter Chips */}
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setReviewFilter('ALL')}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.3rem 0.65rem',
                                                    borderRadius: '6px',
                                                    fontWeight: reviewFilter === 'ALL' ? 700 : 500,
                                                    background: reviewFilter === 'ALL' ? 'var(--color-primary)' : '#f1f5f9',
                                                    color: reviewFilter === 'ALL' ? '#ffffff' : '#475569',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                All ({quizResult.totalQuestions})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setReviewFilter('CORRECT')}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.3rem 0.65rem',
                                                    borderRadius: '6px',
                                                    fontWeight: reviewFilter === 'CORRECT' ? 700 : 500,
                                                    background: reviewFilter === 'CORRECT' ? '#057642' : '#f1f5f9',
                                                    color: reviewFilter === 'CORRECT' ? '#ffffff' : '#475569',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Correct ({correctCount})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setReviewFilter('INCORRECT')}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.3rem 0.65rem',
                                                    borderRadius: '6px',
                                                    fontWeight: reviewFilter === 'INCORRECT' ? 700 : 500,
                                                    background: reviewFilter === 'INCORRECT' ? '#dc2626' : '#f1f5f9',
                                                    color: reviewFilter === 'INCORRECT' ? '#ffffff' : '#475569',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Incorrect ({incorrectCount})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Question Breakdown List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {filteredReviewQuestions.map((q, qIndex) => {
                                            const wasAnswered = q.userSelected !== null && q.userSelected !== undefined;
                                            return (
                                                <div
                                                    key={q.id || qIndex}
                                                    style={{
                                                        background: '#ffffff',
                                                        border: `1.5px solid ${q.isCorrect ? '#86efac' : '#fecaca'}`,
                                                        borderRadius: '12px',
                                                        padding: '1.25rem',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                                    }}
                                                >
                                                    {/* Question Header & Status Badge */}
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                background: q.isCorrect ? '#dcfce7' : '#fee2e2',
                                                                color: q.isCorrect ? '#15803d' : '#b91c1c',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                flexShrink: 0
                                                            }}>
                                                                {q.id}
                                                            </span>
                                                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                                                {q.question}
                                                            </span>
                                                        </div>

                                                        {/* Result Badge */}
                                                        {q.isCorrect ? (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                                padding: '0.2rem 0.55rem',
                                                                borderRadius: '9999px',
                                                                background: '#dcfce7',
                                                                color: '#15803d',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                flexShrink: 0
                                                            }}>
                                                                <CheckCircle size={13} /> Correct
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                                padding: '0.2rem 0.55rem',
                                                                borderRadius: '9999px',
                                                                background: '#fee2e2',
                                                                color: '#b91c1c',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                flexShrink: 0
                                                            }}>
                                                                <XCircle size={13} /> {wasAnswered ? 'Incorrect' : 'Skipped'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Options List with Genuine Answer Highlights */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                                        {q.options.map((opt, optIdx) => {
                                                            const isGenuine = optIdx === q.correctOptionIndex;
                                                            const isUserChoice = optIdx === q.userSelected;

                                                            let borderStyle = '1px solid #e2e8f0';
                                                            let bgStyle = '#f8fafc';
                                                            let textColor = 'var(--text-primary)';

                                                            if (isGenuine) {
                                                                borderStyle = '2px solid #22c55e';
                                                                bgStyle = '#f0fdf4';
                                                                textColor = '#14532d';
                                                            } else if (isUserChoice && !isGenuine) {
                                                                borderStyle = '2px solid #ef4444';
                                                                bgStyle = '#fef2f2';
                                                                textColor = '#7f1d1d';
                                                            }

                                                            return (
                                                                <div
                                                                    key={optIdx}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                        padding: '0.65rem 0.85rem',
                                                                        borderRadius: '8px',
                                                                        border: borderStyle,
                                                                        background: bgStyle,
                                                                        fontSize: '0.85rem',
                                                                        lineHeight: 1.4,
                                                                        gap: '0.75rem'
                                                                    }}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                        <span style={{
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            borderRadius: '50%',
                                                                            background: isGenuine ? '#22c55e' : (isUserChoice ? '#ef4444' : '#cbd5e1'),
                                                                            color: '#ffffff',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: 700,
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {isGenuine ? '✓' : (isUserChoice ? '✕' : String.fromCharCode(65 + optIdx))}
                                                                        </span>
                                                                        <span style={{ color: textColor, fontWeight: (isGenuine || isUserChoice) ? 600 : 400 }}>
                                                                            {opt}
                                                                        </span>
                                                                    </div>

                                                                    {/* Role Tag for the Option */}
                                                                    <div>
                                                                        {isGenuine && isUserChoice && (
                                                                            <span style={{
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 700,
                                                                                padding: '0.2rem 0.5rem',
                                                                                borderRadius: '6px',
                                                                                background: '#dcfce7',
                                                                                color: '#15803d',
                                                                                whiteSpace: 'nowrap'
                                                                            }}>
                                                                                ✓ Genuine Answer (Your Pick)
                                                                            </span>
                                                                        )}
                                                                        {isGenuine && !isUserChoice && (
                                                                            <span style={{
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 700,
                                                                                padding: '0.2rem 0.5rem',
                                                                                borderRadius: '6px',
                                                                                background: '#bbf7d0',
                                                                                color: '#166534',
                                                                                whiteSpace: 'nowrap'
                                                                            }}>
                                                                                ★ Genuine Correct Answer
                                                                            </span>
                                                                        )}
                                                                        {!isGenuine && isUserChoice && (
                                                                            <span style={{
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 700,
                                                                                padding: '0.2rem 0.5rem',
                                                                                borderRadius: '6px',
                                                                                background: '#fee2e2',
                                                                                color: '#b91c1c',
                                                                                whiteSpace: 'nowrap'
                                                                            }}>
                                                                                ✕ Your Pick (Incorrect)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Genuine Answer Explanation Card */}
                                                    {q.explanation && (
                                                        <div style={{
                                                            background: '#eff6ff',
                                                            border: '1px solid #bfdbfe',
                                                            borderRadius: '8px',
                                                            padding: '0.85rem 1rem',
                                                            display: 'flex',
                                                            gap: '0.65rem',
                                                            alignItems: 'flex-start'
                                                        }}>
                                                            <Lightbulb size={16} color="#1d4ed8" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                                                            <div style={{ fontSize: '0.825rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                                                                <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#1e40af' }}>
                                                                    Genuine Solution & Explanation:
                                                                </strong>
                                                                {q.explanation}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveQuiz(null);
                                                setQuizResult(null);
                                            }}
                                            className="btn btn-primary"
                                            style={{ minWidth: '160px', padding: '0.65rem 1.5rem', fontWeight: 700 }}
                                        >
                                            Done & Back to Quizzes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStartQuiz(activeQuiz.topicId)}
                                            className="btn btn-outline"
                                            style={{ minWidth: '140px', padding: '0.65rem 1.5rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            <RotateCcw size={15} />
                                            <span>Retake Quiz</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Active Question Runner View */
                                <div>
                                    {/* Progress bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        <span>Question {currentQIndex + 1} of {activeQuiz.questions?.length || 5}</span>
                                        <span>{Math.round(((currentQIndex + 1) / (activeQuiz.questions?.length || 5)) * 100)}% completed</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: `${((currentQIndex + 1) / (activeQuiz.questions?.length || 5)) * 100}%`,
                                            height: '100%',
                                            background: 'var(--color-primary)',
                                            transition: 'width 0.3s ease',
                                        }} />
                                    </div>

                                    {/* Question Card */}
                                    {activeQuiz.questions && activeQuiz.questions[currentQIndex] && (
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                                                {activeQuiz.questions[currentQIndex].question}
                                            </h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {activeQuiz.questions[currentQIndex].options.map((option, optIdx) => {
                                                    const qId = activeQuiz.questions[currentQIndex].id;
                                                    const isSelected = answers[qId] === optIdx;
                                                    return (
                                                        <div
                                                            key={optIdx}
                                                            className={`assessment-option-card ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => handleSelectOption(qId, optIdx)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.85rem',
                                                                padding: '0.85rem 1.15rem',
                                                                border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid #e2e8f0',
                                                                borderRadius: '8px',
                                                                background: isSelected ? '#eff6ff' : '#ffffff',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '22px',
                                                                height: '22px',
                                                                borderRadius: '50%',
                                                                border: isSelected ? '6px solid var(--color-primary)' : '2px solid #cbd5e1',
                                                                background: '#ffffff',
                                                                flexShrink: 0,
                                                                transition: 'all 0.15s ease',
                                                            }} />
                                                            <span style={{ fontSize: '0.9rem', color: isSelected ? 'var(--color-primary-dark, #004182)' : 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                                        <button
                                            type="button"
                                            disabled={currentQIndex === 0}
                                            onClick={() => setCurrentQIndex((prev) => prev - 1)}
                                            className="btn btn-secondary"
                                            style={{ opacity: currentQIndex === 0 ? 0.4 : 1, padding: '0.55rem 1.15rem', fontSize: '0.825rem' }}
                                        >
                                            Previous
                                        </button>

                                        {currentQIndex < (activeQuiz.questions?.length || 5) - 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.55rem 1.35rem', fontSize: '0.825rem', fontWeight: 700 }}
                                            >
                                                Next Question
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={submitting}
                                                onClick={handleSubmitQuiz}
                                                className="btn btn-primary"
                                                style={{
                                                    background: '#057642',
                                                    borderColor: '#057642',
                                                    padding: '0.65rem 1.75rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    boxShadow: '0 2px 4px rgba(5, 118, 66, 0.2)'
                                                }}
                                            >
                                                {submitting ? 'Scoring Assessment...' : 'Submit & View Genuine Answers'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
