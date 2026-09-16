import React, { useState, useEffect } from 'react';
import assessmentService from '../../services/assessmentService';

export default function CandidateAssessmentsPage() {
    const [assessments, setAssessments] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active quiz state
    const [activeQuiz, setActiveQuiz] = useState(null); // full quiz object with questions
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { [qId]: optionIndex }
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(300); // 5 mins
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null); // AssessmentResultDTO

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
            setAssessments(catalog);
            setBadges(myBadges);
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
                // Refresh catalog & badges
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
                        b.badgeTitle?.toLowerCase().includes(topic.title?.toLowerCase()))
            )
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
            {/* Page Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Skill Verification Engine
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Skill Assessments & Verified Badges
                    </h1>
                    <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                        Validate your technical expertise through standardized timed assessments. Earn verified badges
                        displayed on your profile and search cards to stand out to leading recruiters.
                    </p>
                </div>
                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center px-3">
                        <div className="text-2xl font-bold text-blue-700">{assessments.length}</div>
                        <div className="text-xs text-slate-500 font-medium">Available</div>
                    </div>
                    <div className="text-center px-3 border-l border-slate-200">
                        <div className="text-2xl font-bold text-emerald-600">
                            {badges.filter((b) => b.isPassed).length}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">Earned Badges</div>
                    </div>
                    <div className="text-center px-3 border-l border-slate-200">
                        <div className="text-2xl font-bold text-slate-700">70%</div>
                        <div className="text-xs text-slate-500 font-medium">Pass Threshold</div>
                    </div>
                </div>
            </div>

            {/* Badges Earned Ribbon (if any) */}
            {badges.filter((b) => b.isPassed).length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 rounded-xl p-5">
                    <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🏅</span> Your Verified Skill Credentials
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {badges
                            .filter((b) => b.isPassed)
                            .map((b, idx) => (
                                <div
                                    key={b.id || idx}
                                    className="flex items-center gap-2 bg-white border border-blue-200 px-3.5 py-2 rounded-lg shadow-sm"
                                >
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                                        ✓
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900">{b.badgeTitle || b.skillName}</div>
                                        <div className="text-[11px] text-slate-500">
                                            Score: {b.score}% • Verified by HireHub AI
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Assessment Cards Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Standardized Technical Quizzes</h2>
                    <span className="text-xs text-slate-500">5 Multiple Choice Questions • 5-Minute Time Limit</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assessments.map((topic) => {
                            const passed = isTopicPassed(topic);
                            return (
                                <div
                                    key={topic.topicId}
                                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
                                                {topic.icon || '📝'}
                                            </div>
                                            {passed ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    ✓ Verified
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                                    {topic.category}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
                                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                                            {topic.description}
                                        </p>
                                    </div>

                                    <div className="pt-5 border-t border-slate-100 mt-4">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                                            <span>⏱️ {topic.durationMinutes || 5} Mins</span>
                                            <span>❓ {topic.totalQuestions || 5} Questions</span>
                                            <span>🎯 Pass: 70%</span>
                                        </div>

                                        <button
                                            onClick={() => handleStartQuiz(topic.topicId)}
                                            className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                                passed
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                            }`}
                                        >
                                            {passed ? 'Retake Quiz' : 'Take Skill Quiz'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quiz Modal */}
            {activeQuiz && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
                        {/* Result View */}
                        {quizResult ? (
                            <div className="p-8 text-center space-y-6">
                                <div
                                    className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl ${
                                        quizResult.passed
                                            ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                                    }`}
                                >
                                    {quizResult.passed ? '🏅' : '💡'}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {quizResult.passed ? 'Skill Verified!' : 'Assessment Completed'}
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                                        {quizResult.feedback}
                                    </p>
                                </div>

                                <div className="max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-around">
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">
                                            {quizResult.scorePercentage}%
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Your Score</div>
                                    </div>
                                    <div className="h-8 border-l border-slate-300"></div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">
                                            {quizResult.correctCount} / {quizResult.totalQuestions}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Correct Answers</div>
                                    </div>
                                    <div className="h-8 border-l border-slate-300"></div>
                                    <div>
                                        <div
                                            className={`text-sm font-bold uppercase tracking-wider ${
                                                quizResult.passed ? 'text-emerald-600' : 'text-amber-700'
                                            }`}
                                        >
                                            {quizResult.passed ? 'PASSED' : 'RETRY'}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Result</div>
                                    </div>
                                </div>

                                {quizResult.passed && quizResult.badge && (
                                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-left flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                                            🛡️
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                                                New Credential Earned
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">
                                                {quizResult.badge.badgeTitle}
                                            </div>
                                            <div className="text-xs text-slate-600 mt-0.5">
                                                Automatically attached to your profile and search result cards.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setActiveQuiz(null);
                                            setQuizResult(null);
                                        }}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                                    >
                                        Done & View Badges
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Active Quiz Question View */
                            <div>
                                {/* Quiz Header */}
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">{activeQuiz.title}</h3>
                                        <span className="text-xs text-slate-500">
                                            Question {currentQIndex + 1} of {activeQuiz.questions.length}
                                        </span>
                                    </div>
                                    <div
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                                            timeLeftSeconds < 60
                                                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                                                : 'bg-white text-slate-800 border-slate-200'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>{formatTimer(timeLeftSeconds)}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 h-1.5">
                                    <div
                                        className="bg-blue-600 h-1.5 transition-all duration-300"
                                        style={{
                                            width: `${((currentQIndex + 1) / activeQuiz.questions.length) * 100}%`
                                        }}
                                    />
                                </div>

                                {/* Question Body */}
                                {activeQuiz.questions[currentQIndex] && (
                                    <div className="p-6 space-y-5">
                                        <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                                            {activeQuiz.questions[currentQIndex].question}
                                        </h4>

                                        <div className="space-y-2.5">
                                            {activeQuiz.questions[currentQIndex].options.map((option, optIdx) => {
                                                const qId = activeQuiz.questions[currentQIndex].id;
                                                const isSelected = answers[qId] === optIdx;
                                                return (
                                                    <label
                                                        key={optIdx}
                                                        onClick={() => handleSelectOption(qId, optIdx)}
                                                        className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                                                            isSelected
                                                                ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${qId}`}
                                                            checked={isSelected}
                                                            onChange={() => handleSelectOption(qId, optIdx)}
                                                            className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                                                        />
                                                        <span
                                                            className={`text-sm leading-snug ${
                                                                isSelected
                                                                    ? 'font-medium text-slate-900'
                                                                    : 'text-slate-700'
                                                            }`}
                                                        >
                                                            {option}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Footer Controls */}
                                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    'Are you sure you want to exit? Your progress will be discarded.'
                                                )
                                            ) {
                                                setActiveQuiz(null);
                                            }
                                        }}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        Abandon Quiz
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={currentQIndex === 0}
                                            onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                                            className="px-3.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>

                                        {currentQIndex < activeQuiz.questions.length - 1 ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentQIndex((prev) =>
                                                        Math.min(activeQuiz.questions.length - 1, prev + 1)
                                                    )
                                                }
                                                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                                            >
                                                Next Question
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={submitting}
                                                onClick={handleSubmitQuiz}
                                                className="px-5 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50"
                                            >
                                                {submitting ? 'Grading...' : 'Submit Assessment'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
