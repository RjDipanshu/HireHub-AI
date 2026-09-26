import React, { useState } from 'react';
import alertService from '../../services/alertService';

export default function AlertPreferencesModal({ isOpen, onClose }) {
    const [preferences, setPreferences] = useState({
        whatsappAlertsEnabled: true,
        emailAlertsEnabled: true,
        smsAlertsEnabled: true,
        interviewRemindersEnabled: true,
        weeklyDigestEnabled: true,
        digestFrequency: 'WEEKLY',
        digestKeywords: 'Java, React, Full Stack',
        digestLocation: 'Bengaluru, Remote',
    });

    const [testPhone, setTestPhone] = useState('+919876543210');
    const [testEmail, setTestEmail] = useState('candidate@hirehub.dev');
    const [testingWhatsApp, setTestingWhatsApp] = useState(false);
    const [testingDigest, setTestingDigest] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [digestResult, setDigestResult] = useState(null);

    if (!isOpen) return null;

    const handleToggle = (key) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleTestWhatsApp = async () => {
        setTestingWhatsApp(true);
        setTestResult(null);
        try {
            const res = await alertService.sendWhatsAppAlert({
                phoneNumber: testPhone,
                candidateName: 'Rahul Sharma',
                jobTitle: 'Lead Java Engineer',
                companyName: 'Infosys',
                status: 'INTERVIEW SCHEDULED'
            });
            setTestResult(res);
        } catch (err) {
            setTestResult({ error: err.message || 'WhatsApp dispatch failed' });
        } finally {
            setTestingWhatsApp(false);
        }
    };

    const handleTestDigest = async () => {
        setTestingDigest(true);
        setDigestResult(null);
        try {
            const res = await alertService.sendWeeklyDigestPreview(testEmail);
            setDigestResult(res);
        } catch (err) {
            setDigestResult({ error: err.message || 'Failed to dispatch email digest preview' });
        } finally {
            setTestingDigest(false);
        }
    };

    const handleSave = async () => {
        await alertService.savePreferences(preferences);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn my-8">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">🔔</span>
                        <h3 className="text-base font-bold text-slate-900">
                            Alerts, Weekly Digest & Notifications
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Toggles */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Notification Channels
                        </h4>

                        {[
                            {
                                id: 'weeklyDigestEnabled',
                                title: '📬 Weekly AI Job Digest Email',
                                desc: 'Personalized weekly curation of high-match jobs matching your skills (every Monday morning).'
                            },
                            {
                                id: 'whatsappAlertsEnabled',
                                title: '📱 WhatsApp Instant Alerts',
                                desc: 'Receive instant WhatsApp templates for interview invites & application status changes.'
                            },
                            {
                                id: 'emailAlertsEnabled',
                                title: '📧 Transactional Email Alerts',
                                desc: 'Receive formatted HTML status emails via SendGrid / Resend.'
                            },
                            {
                                id: 'interviewRemindersEnabled',
                                title: '⏰ 24h & 1h Interview Reminders',
                                desc: 'Automated calendar reminders before scheduled interview slots.'
                            }
                        ].map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                            >
                                <div className="pr-4">
                                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggle(item.id)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        preferences[item.id] ? 'bg-emerald-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            preferences[item.id] ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Weekly Digest Preferences (Indeed / LinkedIn Style) */}
                    {preferences.weeklyDigestEnabled && (
                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                    <span>📬</span> Weekly Job Digest Configuration
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                                    Indeed Style
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label className="font-semibold text-slate-600 block mb-1">Keywords</label>
                                    <input
                                        type="text"
                                        value={preferences.digestKeywords}
                                        onChange={(e) => setPreferences({ ...preferences, digestKeywords: e.target.value })}
                                        className="w-full px-2.5 py-1.5 text-xs border border-blue-200 rounded-lg bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-600 block mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={preferences.digestLocation}
                                        onChange={(e) => setPreferences({ ...preferences, digestLocation: e.target.value })}
                                        className="w-full px-2.5 py-1.5 text-xs border border-blue-200 rounded-lg bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="your-email@example.com"
                                    className="flex-1 px-3 py-1.5 text-xs border border-blue-300 rounded-lg bg-white text-slate-900"
                                />
                                <button
                                    type="button"
                                    disabled={testingDigest}
                                    onClick={handleTestDigest}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                                >
                                    {testingDigest ? 'Dispatching...' : 'Preview Digest'}
                                </button>
                            </div>

                            {digestResult && (
                                <div className="p-3 bg-white border border-blue-200 rounded-lg text-xs space-y-2">
                                    <div className="font-bold text-blue-800 flex items-center justify-between">
                                        <span>✓ Email Digest Dispatched</span>
                                        <span className="text-[10px] text-slate-500">{digestResult.recipient}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {digestResult.digestJobs?.map((j, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-50 rounded border border-slate-100">
                                                <div>
                                                    <div className="font-semibold text-slate-900">{j.title}</div>
                                                    <div className="text-[10px] text-slate-500">{j.company} • {j.location} • {j.salary}</div>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    {j.matchScore} match
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* WhatsApp Test Sandbox */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                <span>📲</span> Test Twilio WhatsApp Dispatch
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                WhatsApp Sandbox
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                placeholder="+91..."
                                className="flex-1 px-3 py-1.5 text-xs border border-emerald-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                type="button"
                                disabled={testingWhatsApp}
                                onClick={handleTestWhatsApp}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                            >
                                {testingWhatsApp ? 'Testing...' : 'Send Test WhatsApp'}
                            </button>
                        </div>

                        {testResult && (
                            <div className="p-3 bg-white border border-emerald-200 rounded-lg text-xs space-y-1">
                                {testResult.error ? (
                                    <div className="text-red-600 font-semibold">{testResult.error}</div>
                                ) : (
                                    <>
                                        <div className="font-bold text-emerald-800 flex items-center justify-between">
                                            <span>✓ Status: {testResult.status}</span>
                                            <span className="font-mono text-[10px] text-slate-500">{testResult.whatsappMessageId}</span>
                                        </div>
                                        <div className="text-slate-600 text-[11px] font-mono whitespace-pre-line mt-1 bg-slate-50 p-2 rounded">
                                            {testResult.messageBody}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
