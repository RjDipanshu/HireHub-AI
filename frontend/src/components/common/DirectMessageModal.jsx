import React, { useState } from 'react';
import messageService from '../../services/messageService';

export default function DirectMessageModal({ isOpen, onClose, recipient, job, onSent }) {
    const [subject, setSubject] = useState(
        job ? `Opportunity: ${job.title}` : `Inquiry regarding your profile`
    );
    const [messageText, setMessageText] = useState(
        recipient ? `Hi ${recipient.name || recipient.firstName || 'there'},\n\nI was impressed by your profile and verified technical skills. We would love to connect and discuss potential opportunities with our team.` : ''
    );
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !recipient) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        setSending(true);
        setError(null);

        try {
            const recipientId = recipient.userId || recipient.id;
            await messageService.sendMessage({
                recipientId,
                jobId: job?.id,
                subject: subject.trim(),
                messageText: messageText.trim()
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                if (onSent) onSent();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to send direct message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-base">
                            {(recipient.name || recipient.firstName || 'C')[0]}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                                Send InMail to {recipient.name || `${recipient.firstName} ${recipient.lastName}`}
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    Direct
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500">
                                {recipient.headline || recipient.title || recipient.email || 'Verified Candidate'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200/50"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {success ? (
                        <div className="py-8 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-2xl">
                                ✓
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900">Message Delivered!</h4>
                            <p className="text-sm text-slate-500">
                                Your message has been sent to {recipient.name || recipient.firstName}. They will receive an in-app notification.
                            </p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter conversation subject..."
                                    required
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
                                />
                            </div>

                            {job && (
                                <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                                    <span className="font-semibold">Associated Job:</span> {job.title}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Message
                                </label>
                                <textarea
                                    rows={5}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message or offer details here..."
                                    required
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white leading-relaxed resize-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    🔒 Direct & confidential InMail
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={sending}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending || !messageText.trim()}
                                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center space-x-2"
                                    >
                                        {sending ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <span>Send InMail</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
