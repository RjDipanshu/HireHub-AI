import React, { useState, useEffect, useRef, useCallback } from 'react';
import messageService from '../../services/messageService';
import useRealtimeMessages from '../../hooks/useRealtimeMessages';

export default function MessagesPage() {
    const [threads, setThreads]           = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages]         = useState([]);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [replyText, setReplyText]       = useState('');
    const [sending, setSending]           = useState(false);
    const [searchQuery, setSearchQuery]   = useState('');
    const messagesEndRef = useRef(null);
    const activeThreadRef = useRef(null); // stable ref for callbacks

    // ── Real-Time: SSE with adaptive polling fallback ──────────────────────────
    const handleNewMessage = useCallback((event) => {
        // If event belongs to the active thread, reload messages immediately
        if (event.threadId && activeThreadRef.current?.otherUserId === event.threadId) {
            loadMessages(event.threadId, false);
        }
        // Always refresh thread list to update unread counts
        loadThreadsSilently();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { isLive, latestEvent } = useRealtimeMessages({
        onNewMessage: handleNewMessage,
        enabled: true,
    });

    // Respond to POLL_TICK events from the hook's fallback polling
    useEffect(() => {
        if (!latestEvent || latestEvent.type !== 'POLL_TICK') return;
        if (!activeThreadRef.current) return;
        loadMessages(activeThreadRef.current.otherUserId, false);
    }, [latestEvent]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadThreads();
    }, []);

    // Keep ref in sync with state for stable callbacks
    useEffect(() => {
        activeThreadRef.current = activeThread;
    }, [activeThread]);

    useEffect(() => {
        if (!activeThread) return;
        loadMessages(activeThread.otherUserId, true);
        // Polling is now handled by useRealtimeMessages hook — no setInterval needed
    }, [activeThread]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadThreads = async () => {
        setLoadingThreads(true);
        try {
            const data = await messageService.getThreads();
            setThreads(data || []);
            if (data && data.length > 0 && !activeThreadRef.current) {
                setActiveThread(data[0]);
            }
        } catch (err) {
            console.error('Failed to load message threads:', err);
        } finally {
            setLoadingThreads(false);
        }
    };

    // Silent refresh for thread list (unread counts) without full loading state
    const loadThreadsSilently = async () => {
        try {
            const data = await messageService.getThreads();
            if (data) setThreads(data);
        } catch (_) {}
    };

    const loadMessages = async (userId, showSpinner = true) => {
        if (showSpinner) setLoadingMessages(true);
        try {
            const data = await messageService.getConversation(userId);
            setMessages(data || []);
            // Mark unread as read in thread count
            setThreads((prev) =>
                prev.map((t) => (t.otherUserId === userId ? { ...t, unreadCount: 0 } : t))
            );
        } catch (err) {
            console.error('Failed to load conversation:', err);
        } finally {
            if (showSpinner) setLoadingMessages(false);
        }
    };

    const handleSendReply = async (e) => {
        if (e) e.preventDefault();
        if (!replyText.trim() || !activeThread || sending) return;

        setSending(true);
        const textToSend = replyText.trim();
        setReplyText('');

        try {
            const sentMsg = await messageService.sendMessage({
                recipientId: activeThread.otherUserId,
                subject: `Re: ${activeThread.lastMessageSubject || 'Conversation'}`,
                messageText: textToSend
            });

            // Append to current messages
            const optimisticMsg = {
                id: sentMsg.id || 'temp-' + Date.now(),
                senderId: 'current-user',
                senderName: 'You',
                senderRole: 'ME',
                subject: sentMsg.subject || 'Direct Message',
                messageText: textToSend,
                createdAt: new Date().toISOString(),
                isRead: true
            };
            setMessages((prev) => [...prev, optimisticMsg]);

            // Update thread list preview
            setThreads((prev) =>
                prev.map((t) =>
                    t.otherUserId === activeThread.otherUserId
                        ? {
                              ...t,
                              lastMessageText: textToSend,
                              lastMessageAt: new Date().toISOString()
                          }
                        : t
                )
            );
        } catch (err) {
            alert('Failed to send message: ' + err.message);
            setReplyText(textToSend);
        } finally {
            setSending(false);
        }
    };

    const handleQuickReply = (text) => {
        setReplyText(text);
    };

    const filteredThreads = threads.filter(
        (t) =>
            t.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.lastMessageSubject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimestamp = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else {
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[600px]">
                {/* Left Sidebar: Threads List */}
                <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>💬</span> Direct Messages
                            </h2>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {threads.length} threads
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or message..."
                                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                            />
                            <svg
                                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {loadingThreads ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <p className="text-xs">No conversations found.</p>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => {
                                const isSelected = activeThread?.otherUserId === thread.otherUserId;
                                return (
                                    <button
                                        key={thread.otherUserId}
                                        onClick={() => setActiveThread(thread)}
                                        className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50/80 border-l-4 border-blue-600'
                                                : 'hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <div className="relative">
                                            {thread.otherUserProfileImage ? (
                                                <img
                                                    src={thread.otherUserProfileImage}
                                                    alt={thread.otherUserName}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                                                    {(thread.otherUserName || 'U')[0]}
                                                </div>
                                            )}
                                            {thread.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span
                                                    className={`text-xs truncate ${
                                                        thread.unreadCount > 0
                                                            ? 'font-bold text-slate-900'
                                                            : 'font-semibold text-slate-800'
                                                    }`}
                                                >
                                                    {thread.otherUserName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                    {formatTimestamp(thread.lastMessageAt)}
                                                </span>
                                            </div>

                                            <div className="text-[11px] font-medium text-slate-500 truncate">
                                                {thread.lastMessageSubject || 'InMail Message'}
                                            </div>
                                            <p
                                                className={`text-xs truncate mt-0.5 ${
                                                    thread.unreadCount > 0
                                                        ? 'font-semibold text-slate-900'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                {thread.lastMessageText}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel: Active Chat Thread */}
                {activeThread ? (
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Thread Header */}
                        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {activeThread.otherUserProfileImage ? (
                                    <img
                                        src={activeThread.otherUserProfileImage}
                                        alt={activeThread.otherUserName}
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                        {(activeThread.otherUserName || 'U')[0]}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        {activeThread.otherUserName}
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                            {activeThread.otherUserRole || 'Verified Member'}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500">{activeThread.otherUserEmail}</p>
                                </div>
                            </div>
                            {/* Real-time connection status badge */}
                            <div
                                title={isLive ? 'Server-Sent Events active — messages push instantly' : 'Adaptive polling mode — updates every 1.5 s'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    background: isLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                    color: isLive ? '#059669' : '#d97706',
                                    border: `1px solid ${isLive ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                    userSelect: 'none',
                                }}
                            >
                                <span style={{ fontSize: '0.6rem' }}>{isLive ? '●' : '○'}</span>
                                {isLive ? 'Live' : 'Polling'}
                            </div>
                        </div>


                        {/* Messages Timeline */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                            {loadingMessages ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    <p className="text-sm">No messages in this conversation yet.</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe =
                                        msg.senderId === 'current-user' ||
                                        msg.senderRole === 'ME' ||
                                        msg.senderRole === 'CANDIDATE';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-[11px] font-bold text-slate-700">
                                                    {isMe ? 'You' : msg.senderName || activeThread.otherUserName}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {formatTimestamp(msg.createdAt)}
                                                </span>
                                            </div>

                                            <div
                                                className={`max-w-xl p-4 rounded-xl shadow-xs border text-sm leading-relaxed ${
                                                    isMe
                                                        ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none'
                                                        : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                                                }`}
                                            >
                                                {msg.subject && !isMe && (
                                                    <div className="text-xs font-bold text-blue-800 mb-1 pb-1 border-b border-slate-100">
                                                        {msg.subject}
                                                    </div>
                                                )}
                                                <p className="whitespace-pre-line">{msg.messageText}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Reply Suggestions */}
                        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
                            <span className="text-slate-400 font-medium">Quick suggestions:</span>
                            {[
                                'Available for a brief introductory call tomorrow.',
                                'Could you please share the detailed JD and CTC band?',
                                'Thank you for connecting! Looking forward to next steps.'
                            ].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleQuickReply(suggestion)}
                                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        {/* Message Composer */}
                        <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-white">
                            <div className="flex items-end gap-3">
                                <textarea
                                    rows={2}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendReply();
                                        }
                                    }}
                                    placeholder="Write your reply... (Press Enter to send, Shift+Enter for newline)"
                                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !replyText.trim()}
                                    className="px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors flex items-center gap-1.5 h-10"
                                >
                                    {sending ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-50/30">
                        <div>
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-3">
                                ✉️
                            </div>
                            <h3 className="text-base font-bold text-slate-800">Select a conversation</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                Choose a thread from the left panel to read and respond to direct recruiter inquiries.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
