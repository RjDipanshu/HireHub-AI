import React, { useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Layers,
  Key,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function AiJobMatchModal({ isOpen, onClose, matchData, loading, onApply }) {
  // Keyboard navigation (Escape to close) and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Category labels and icons mapping
  const categoryConfig = [
    { key: 'skills', label: 'Skills Alignment', icon: Award, color: '#3b82f6' },
    { key: 'experience', label: 'Experience Level', icon: Briefcase, color: '#10b981' },
    { key: 'education', label: 'Education Match', icon: GraduationCap, color: '#8b5cf6' },
    { key: 'projects', label: 'Project Relevance', icon: Layers, color: '#ec4899' },
    { key: 'keywords', label: 'ATS Keywords', icon: Key, color: '#f59e0b' },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getBadgeColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'EXCELLENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'GOOD':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-job-match-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn"
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-slate-700/70 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto"
        id="ai-job-match-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-violet-500/30 border border-indigo-500/40 text-indigo-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-job-match-modal-title" className="text-xl font-bold tracking-tight text-white">AI Job Match Intelligence</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  2.0 Powered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {matchData?.jobTitle ? `${matchData.jobTitle} • ${matchData.companyName || ''}` : 'Target Job Match Analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close match intelligence modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            id="close-job-match-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Synthesizing Candidate & Job DNA</h4>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Comparing your skills, experiences, and verified resume against employer requirements...
              </p>
            </div>
          </div>
        ) : matchData ? (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/40 rounded-xl p-5 border border-slate-700/60 backdrop-blur-sm">
              {/* Overall Match Circle */}
              <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 md:border-r border-slate-700/60 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Overall Match</span>
                <div className={`text-4xl font-extrabold my-1 ${getScoreColor(matchData.overallMatchScore || 0).split(' ')[0]}`}>
                  {matchData.overallMatchScore ?? 0}
                  <span className="text-lg text-slate-500 font-normal">/100</span>
                </div>
                <div className={`mt-1 text-xs font-semibold px-3 py-0.5 rounded-full border ${getBadgeColor(matchData.matchLevel)}`}>
                  {matchData.matchLevel || 'ANALYZED'}
                </div>
              </div>

              {/* Recommendation & Verdict */}
              <div className="md:col-span-2 flex flex-col justify-center space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Recommendation: {matchData.recommendation || 'HIGHLY RECOMMENDED'}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {matchData.explanation || 'You have strong alignment with this role based on verified skills and background.'}
                </p>
              </div>
            </div>

            {/* Category Scores */}
            {matchData.categoryScores && (
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Category Breakdown
                </h4>
                <div className="space-y-3.5">
                  {categoryConfig.map(({ key, label, icon: Icon, color }) => {
                    const score = matchData.categoryScores[key] ?? 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-2 text-slate-300">
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                            {label}
                          </span>
                          <span className="text-slate-200 font-semibold">{score}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, score))}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matching & Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matching Skills ({matchData.matchingSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchData.matchingSkills && matchData.matchingSkills.length > 0 ? (
                    matchData.matchingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No direct matching skills recorded</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Skills To Acquire ({matchData.missingSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchData.missingSkills && matchData.missingSkills.length > 0 ? (
                    matchData.missingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">All target job skills satisfied!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Strengths and Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Strengths */}
              {matchData.strengths && matchData.strengths.length > 0 && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Key Strengths
                  </h5>
                  <ul className="space-y-2">
                    {matchData.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps to Address */}
              {matchData.gaps && matchData.gaps.length > 0 && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Gaps & Advice
                  </h5>
                  <ul className="space-y-2">
                    {matchData.gaps.map((gap, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Phase 29.0: AI Fairness & Responsible Hiring Notice */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                {matchData.fairnessDisclaimer || "HireHub AI Assistive Intelligence: Match evaluations and scores are based strictly on documented job-related qualifications, skills, and technical experience. Final hiring decisions rest exclusively with human hiring authorities."}
              </span>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">HireHub AI • Prompt Version 2.0-job-match</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                {onApply && (
                  <button
                    onClick={() => {
                      onClose();
                      onApply();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <span>Proceed to Apply</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p>Could not load match data. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
