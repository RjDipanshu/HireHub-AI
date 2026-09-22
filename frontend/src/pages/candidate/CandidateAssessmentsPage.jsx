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
  BookOpen
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
                loadAssessmentsAndBadges();
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
                    (b.skillName?.toLowerCase().includes(topic.title?.toLowerCase()) ||
                        b.badgeTitle?.toLowerCase().includes(topic.title?.toLowerCase()) ||
                        b.skillName?.toLowerCase().includes(topic.topicId?.toLowerCase()))
            )
        );
    };

    const categories = ['ALL', 'Backend Engineering', 'Frontend Engineering', 'Database & Infrastructure', 'Architecture & Scalability', 'DevOps & Automation'];

    const filteredAssessments = assessments.filter((item) => {
        if (selectedCategory === 'ALL') return true;
        return item.category?.toLowerCase() === selectedCategory.toLowerCase();
    });

    const passedCount = badges.filter((b) => b.isPassed).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* 1. Hero Header Banner with KPIs */}
            <div className="assessment-hero">
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: '#eff6ff', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        <ShieldCheck size={14} />
                        <span>HIREHUB AI VERIFIED CREDENTIALS</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                        Skill Assessments & Verified Badges
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.5 }}>
                        Prove your technical expertise with standardized timed skill assessments. Earn verifiable digital badges recognized by hiring teams and highlighted in recruiter searches.
                    </p>
                </div>

                <div className="assessment-kpi-grid">
                    <div className="assessment-kpi-card">
                        <div className="assessment-kpi-number">{assessments.length || 5}</div>
                        <div className="assessment-kpi-label">Available</div>
                    </div>
                    <div className="assessment-kpi-card">
                        <div className="assessment-kpi-number" style={{ color: '#057642' }}>{passedCount}</div>
                        <div className="assessment-kpi-label">Badges Earned</div>
                    </div>
                    <div className="assessment-kpi-card">
                        <div className="assessment-kpi-number" style={{ color: 'var(--text-primary)' }}>70%</div>
                        <div className="assessment-kpi-label">Pass Threshold</div>
                    </div>
                </div>
            </div>

            {/* 2. Earned Credentials Showcase Ribbon */}
            {passedCount > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Award size={18} color="#057642" />
                            <span>Your Verified Credentials Showcase</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                            {passedCount} active badge{passedCount > 1 ? 's' : ''} on your public profile
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {badges.filter((b) => b.isPassed).map((b, idx) => (
                            <div key={b.id || idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#ffffff', border: '1px solid #86efac', padding: '0.5rem 0.85rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                            border: selectedCategory === cat ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                            background: selectedCategory === cat ? '#e8f3fc' : '#ffffff',
                            color: selectedCategory === cat ? 'var(--color-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                    >
                        {cat === 'ALL' ? 'All Assessments' : cat}
                    </button>
                ))}
            </div>

            {/* 4. Assessment Cards Grid */}
            <div className="assessment-grid">
                {filteredAssessments.map((topic) => {
                    const passed = isTopicPassed(topic);
                    return (
                        <div key={topic.topicId} className="assessment-card">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="assessment-icon-box">
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
                                    }}
                                >
                                    {passed ? (
                                        <>
                                            <RotateCcw size={15} />
                                            <span>Retake Assessment</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Take Skill Assessment</span>
                                            <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 5. Interactive Assessment Runner Modal */}
            {activeQuiz && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '680px', padding: '0', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '1.25rem 1.75rem', background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {activeQuiz.category || 'Skill Assessment'}
                                </div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                                    {activeQuiz.title}
                                </h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Countdown Clock */}
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
                                {!quizResult && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to exit? Your progress in this assessment will be lost.')) {
                                                setActiveQuiz(null);
                                            }
                                        }}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                                        title="Exit Assessment"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.75rem' }}>
                            {quizResult ? (
                                /* Result View */
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: quizResult.passed ? '#dcfce7' : '#fee2e2',
                                        color: quizResult.passed ? '#15803d' : '#b91c1c',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.75rem',
                                        margin: '0 auto 1.25rem auto',
                                        fontWeight: 800,
                                    }}>
                                        {quizResult.passed ? '✓' : '✕'}
                                    </div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                                        {quizResult.passed ? 'Congratulations! Badge Earned 🎉' : 'Assessment Completed'}
                                    </h2>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                                        {quizResult.passed
                                            ? `You scored ${quizResult.scorePercentage || Math.round((quizResult.correctAnswers / (quizResult.totalQuestions || 5)) * 100)}%, exceeding the 70% threshold. This verified skill badge is now added to your profile!`
                                            : `You scored ${quizResult.scorePercentage || Math.round((quizResult.correctAnswers / (quizResult.totalQuestions || 5)) * 100)}%. The pass threshold is 70%. Review the topics and feel free to retake the quiz anytime.`}
                                    </p>

                                    <div style={{ display: 'inline-flex', gap: '2rem', padding: '1rem 2rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
                                        <div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: quizResult.passed ? '#057642' : 'var(--text-primary)' }}>
                                                {quizResult.scorePercentage || Math.round((quizResult.correctAnswers / (quizResult.totalQuestions || 5)) * 100)}%
                                            </div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Your Score</div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                {quizResult.correctAnswers || 0} / {quizResult.totalQuestions || 5}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Correct Answers</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveQuiz(null)}
                                            className="btn btn-primary"
                                            style={{ minWidth: '160px', padding: '0.65rem 1.5rem', fontWeight: 700 }}
                                        >
                                            Done & Close
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStartQuiz(activeQuiz.topicId)}
                                            className="btn btn-outline"
                                            style={{ minWidth: '140px', padding: '0.65rem 1.5rem', fontWeight: 600 }}
                                        >
                                            Retake Quiz
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Question Runner View */
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
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
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
                                                        >
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                border: isSelected ? '6px solid var(--color-primary)' : '2px solid #cbd5e1',
                                                                background: '#ffffff',
                                                                flexShrink: 0,
                                                                transition: 'all var(--transition-fast)',
                                                            }} />
                                                            <span style={{ fontSize: '0.875rem', color: isSelected ? 'var(--color-primary-dark, #004182)' : 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
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
                                                style={{ background: '#057642', borderColor: '#057642', padding: '0.55rem 1.5rem', fontSize: '0.825rem', fontWeight: 700 }}
                                            >
                                                {submitting ? 'Scoring Assessment...' : 'Submit Assessment'}
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
