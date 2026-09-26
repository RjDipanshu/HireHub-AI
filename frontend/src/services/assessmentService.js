import api from './api';
import { ASSESSMENT_CATALOG, ASSESSMENT_QUESTIONS_MAP } from '../data/assessmentsData';

const LOCAL_STORAGE_BADGES_KEY = 'hirehub_candidate_badges';

const getStoredBadges = () => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_BADGES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveStoredBadge = (badge) => {
    try {
        const existing = getStoredBadges();
        const filtered = existing.filter(
            (b) => b.topicId !== badge.topicId && b.skillName !== badge.skillName
        );
        filtered.push(badge);
        localStorage.setItem(LOCAL_STORAGE_BADGES_KEY, JSON.stringify(filtered));
    } catch (err) {
        console.warn('Could not persist badge locally:', err);
    }
};

export const assessmentService = {
    // Get catalog of all available assessments (18 trending domains)
    async getAllAssessments() {
        const storedBadges = getStoredBadges();
        const passedTopicIds = new Set(
            storedBadges.filter((b) => b.isPassed).map((b) => b.topicId)
        );

        try {
            const response = await api.get('/assessments');
            if (Array.isArray(response.data) && response.data.length >= 10) {
                return response.data.map((item) => ({
                    ...item,
                    alreadyPassed: passedTopicIds.has(item.topicId) || item.alreadyPassed
                }));
            }
        } catch (error) {
            console.debug('[AssessmentService] Using comprehensive catalog:', error.message);
        }

        // Return comprehensive 18-domain assessment catalog
        return ASSESSMENT_CATALOG.map((item) => ({
            ...item,
            alreadyPassed: passedTopicIds.has(item.topicId) || item.alreadyPassed
        }));
    },

    // Get questions for a specific quiz
    async getAssessmentQuestions(topicId) {
        try {
            const response = await api.get(`/assessments/${topicId}`);
            if (response.data && response.data.questions && response.data.questions.length > 0) {
                return response.data;
            }
        } catch (error) {
            console.debug('[AssessmentService] Using local quiz questions:', error.message);
        }

        const quizData = ASSESSMENT_QUESTIONS_MAP[topicId] || ASSESSMENT_QUESTIONS_MAP['java-spring'];
        return {
            topicId: quizData.topicId,
            title: quizData.title,
            category: quizData.category,
            durationMinutes: quizData.durationMinutes || 5,
            passingScorePercentage: quizData.passingScorePercentage || 70,
            totalQuestions: quizData.questions.length,
            // Return questions with options for the runner
            questions: quizData.questions.map((q) => ({
                id: q.id,
                question: q.question,
                options: q.options
            }))
        };
    },

    // Submit quiz answers for grading and genuine answer breakdown
    async submitAssessment(topicId, answers) {
        const quizData = ASSESSMENT_QUESTIONS_MAP[topicId] || ASSESSMENT_QUESTIONS_MAP['java-spring'];
        const questions = quizData.questions || [];
        const totalQuestions = questions.length || 5;

        let correctCount = 0;
        const questionResults = questions.map((q) => {
            const userSelected = answers[q.id] !== undefined ? Number(answers[q.id]) : null;
            const isCorrect = userSelected === q.correctOptionIndex;
            if (isCorrect) correctCount++;

            return {
                id: q.id,
                question: q.question,
                options: q.options,
                userSelected,
                correctOptionIndex: q.correctOptionIndex,
                genuineAnswer: q.options[q.correctOptionIndex],
                isCorrect,
                explanation: q.explanation
            };
        });

        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
        const passed = scorePercentage >= (quizData.passingScorePercentage || 70);

        const badge = passed
            ? {
                  id: `badge-${topicId}-${Date.now()}`,
                  topicId,
                  skillName: quizData.title,
                  badgeTitle: quizData.badgeTitle || `Verified ${quizData.title}`,
                  score: scorePercentage,
                  isPassed: true,
                  issuedAt: new Date().toISOString()
              }
            : null;

        if (badge) {
            saveStoredBadge(badge);
        }

        const localResult = {
            topicId,
            title: quizData.title,
            category: quizData.category,
            totalQuestions,
            correctCount,
            scorePercentage,
            passed,
            feedback: passed
                ? `Outstanding! You scored ${scorePercentage}%, demonstrating strong mastery in ${quizData.title}. Your verified badge has been issued!`
                : `You scored ${scorePercentage}%. The passing threshold is 70%. Review the genuine answers and technical explanations below to sharpen your knowledge.`,
            badge,
            questionResults
        };

        // Try pushing to backend if online
        try {
            const response = await api.post(`/assessments/${topicId}/submit`, {
                topicId,
                answers
            });
            if (response.data) {
                return {
                    ...response.data,
                    questionResults, // Ensure genuine answer breakdown is always preserved
                    feedback: response.data.feedback || localResult.feedback,
                    badge: response.data.badge || localResult.badge
                };
            }
        } catch (error) {
            console.debug('[AssessmentService] Backend submit fallback:', error.message);
        }

        return localResult;
    },

    // Get current candidate's badges (merged with local storage)
    async getMyBadges() {
        const localBadges = getStoredBadges();
        try {
            const response = await api.get('/assessments/badges/me');
            if (Array.isArray(response.data) && response.data.length > 0) {
                const map = new Map();
                localBadges.forEach((b) => map.set(b.topicId || b.skillName, b));
                response.data.forEach((b) => map.set(b.topicId || b.skillName, b));
                return Array.from(map.values());
            }
        } catch {
            // Backend offline, return local stored badges
        }
        return localBadges;
    },

    // Get badges for any candidate
    async getCandidateBadges(candidateId) {
        try {
            const response = await api.get(`/assessments/badges/candidate/${candidateId}`);
            return response.data;
        } catch {
            return getStoredBadges();
        }
    }
};

export default assessmentService;
