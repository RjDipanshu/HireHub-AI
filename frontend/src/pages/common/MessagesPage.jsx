import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Check, 
  CheckCheck, 
  Paperclip, 
  Smile, 
  Clock, 
  MoreVertical,
  Briefcase
} from 'lucide-react';
import messageService from '../../services/messageService';
import useRealtimeMessages from '../../hooks/useRealtimeMessages';

export default function MessagesPage() {
    const [threads, setThreads] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const activeThreadRef = useRef(null);

    // Real-Time SSE listener with polling fallback
    const handleNewMessage = useCallback((event) => {
        if (event.threadId && activeThreadRef.current?.otherUserId === event.threadId) {
            loadMessages(event.threadId, false);
        }
        loadThreadsSilently();
    }, []);

    const { isLive, latestEvent } = useRealtimeMessages({
        onNewMessage: handleNewMessage,
        enabled: true,
    });

    useEffect(() => {
        if (!latestEvent || latestEvent.type !== 'POLL_TICK') return;
        if (!activeThreadRef.current) return;
        loadMessages(activeThreadRef.current.otherUserId, false);
    }, [latestEvent]);

    useEffect(() => {
        loadThreads();
    }, []);

    useEffect(() => {
        activeThreadRef.current = activeThread;
    }, [activeThread]);

    useEffect(() => {
        if (!activeThread) return;
        loadMessages(activeThread.otherUserId, true);
    }, [activeThread]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, activeThread?.otherUserId]);

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
            setThreads((prev) =>
                prev.map((t) => (t.otherUserId === userId ? { ...t, unreadCount: 0 } : t))
            );
        } catch (err) {
            console.error('Failed to load conversation:', err);
        } finally {
            if (showSpinner) setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!replyText.trim() || !activeThread || sending) return;

        const textToSend = replyText.trim();
        setReplyText('');
        setSending(true);

        const optimisticMessage = {
            id: 'temp-' + Date.now(),
            senderId: 'current-user',
            senderName: 'You',
            senderRole: 'CANDIDATE',
            messageText: textToSend,
            createdAt: new Date().toISOString(),
            isPending: true,
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            await messageService.sendMessage({
                recipientId: activeThread.otherUserId,
                messageText: textToSend,
                subject: activeThread.lastMessageSubject || 'InMail Response',
            });

            await loadMessages(activeThread.otherUserId, false);

            setThreads((prev) =>
                prev.map((t) =>
                    t.otherUserId === activeThread.otherUserId
                        ? {
                              ...t,
                              lastMessageText: textToSend,
                              lastMessageAt: new Date().toISOString(),
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

    const quickReplies = [
        "Yes, I am actively open to discussing this opportunity.",
        "Could you share more details regarding the tech stack and compensation range?",
        "I would be glad to schedule an introductory call this week.",
        "Thank you for reaching out! Let's connect."
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                        Messages & Direct InMail
                    </h1>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Connect directly with verified corporate recruiters and engineering managers.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            background: isLive ? '#ecfdf5' : '#fffbeb',
                            color: isLive ? '#057642' : '#b25e00',
                            border: `1px solid ${isLive ? '#bbf7d0' : '#fde68a'}`,
                        }}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: isLive ? '#10b981' : '#f59e0b' }} />
                        <span>{isLive ? 'Real-Time Connected' : 'Adaptive Polling'}</span>
                    </div>
                </div>
            </div>

            {/* InMail Chat Container */}
            <div className="inmail-container">
                {/* Left Panel: Conversation Threads */}
                <div className="inmail-sidebar">
                    <div className="inmail-sidebar-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                <MessageSquare size={16} color="var(--color-primary)" />
                                <span>Conversations</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#eff6ff', color: 'var(--color-primary)' }}>
                                {threads.length} active
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="inmail-search-box">
                            <Search size={15} color="#94a3b8" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations or contacts..."
                                className="inmail-search-input"
                            />
                        </div>
                    </div>

                    {/* Threads List */}
                    <div className="inmail-threads-list">
                        {loadingThreads ? (
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[1, 2, 3].map((n) => (
                                    <div key={n} style={{ height: '60px', background: '#f1f5f9', borderRadius: '8px' }} />
                                ))}
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <MessageSquare size={32} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No conversations found</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    Recruiters who message you will appear here.
                                </div>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => {
                                const isSelected = activeThread?.otherUserId === thread.otherUserId;
                                return (
                                    <button
                                        key={thread.otherUserId}
                                        type="button"
                                        onClick={() => setActiveThread(thread)}
                                        className={`inmail-thread-item ${isSelected ? 'active' : ''}`}
                                    >
                                        <div className="inmail-avatar">
                                            {thread.otherUserProfileImage ? (
                                                <img
                                                    src={thread.otherUserProfileImage}
                                                    alt={thread.otherUserName}
                                                    className="inmail-avatar-img"
                                                    style={{ width: '44px', height: '44px', minWidth: '44px', maxWidth: '44px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="inmail-avatar-fallback">
                                                    {(thread.otherUserName || 'U')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <span className="inmail-status-dot" />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: thread.unreadCount > 0 ? 800 : 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {thread.otherUserName?.replace(/\s*\(.*?\)/, '')}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                                                    {formatTimestamp(thread.lastMessageAt)}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.15rem' }}>
                                                {thread.lastMessageSubject || 'Direct InMail Opportunity'}
                                            </div>

                                            <div style={{ fontSize: '0.78rem', color: thread.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: thread.unreadCount > 0 ? 600 : 400 }}>
                                                {thread.lastMessageText}
                                            </div>
                                        </div>

                                        {thread.unreadCount > 0 && (
                                            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--color-primary)', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {thread.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel: Active Conversation Stream */}
                {activeThread ? (
                    <div className="inmail-chat">
                        {/* Conversation Header */}
                        <div className="inmail-chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div className="inmail-avatar" style={{ width: '42px', height: '42px', minWidth: '42px', maxWidth: '42px' }}>
                                    {activeThread.otherUserProfileImage ? (
                                        <img
                                            src={activeThread.otherUserProfileImage}
                                            alt={activeThread.otherUserName}
                                            className="inmail-avatar-img"
                                            style={{ width: '42px', height: '42px', minWidth: '42px', maxWidth: '42px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="inmail-avatar-fallback" style={{ width: '42px', height: '42px' }}>
                                            {(activeThread.otherUserName || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span className="inmail-status-dot" />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                            {activeThread.otherUserName}
                                        </h3>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', letterSpacing: '0.04em' }}>
                                            {activeThread.otherUserRole || 'RECRUITER'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                                        <Building2 size={13} color="#94a3b8" />
                                        <span>{activeThread.otherUserEmail}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#057642', fontWeight: 600, background: '#f0fdf4', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                                    <ShieldCheck size={13} />
                                    <span>Verified Recruiter</span>
                                </span>
                            </div>
                        </div>

                        {/* Messages Stream */}
                        <div className="inmail-messages-stream">
                            {/* InMail Notice Card */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 auto', maxWidth: '520px' }}>
                                <ShieldCheck size={15} color="var(--color-primary)" />
                                <span>This conversation is encrypted and protected by HireHub AI anti-spam policies.</span>
                            </div>

                            {loadingMessages ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0' }}>
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} style={{ height: '70px', width: n % 2 === 0 ? '60%' : '75%', alignSelf: n % 2 === 0 ? 'flex-end' : 'flex-start', background: '#e2e8f0', borderRadius: '12px' }} />
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No messages yet. Send a greeting to begin!</p>
                                </div>
                            ) : (
                                messages.map((m, idx) => {
                                    const isMe = m.senderRole === 'CANDIDATE' || m.senderId === 'current-user' || m.senderName === 'You';
                                    return (
                                        <div
                                            key={m.id || idx}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                                maxWidth: '80%',
                                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            {/* Sender title label */}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', padding: '0 0.5rem', fontWeight: 600 }}>
                                                {isMe ? 'You' : (m.senderName || activeThread.otherUserName)}
                                            </div>

                                            {/* Chat Bubble */}
                                            <div className={isMe ? 'inmail-bubble-out' : 'inmail-bubble-in'}>
                                                {m.subject && !isMe && idx === 0 && (
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary-dark, #004182)', marginBottom: '0.4rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                                                        {m.subject}
                                                    </div>
                                                )}
                                                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                    {m.messageText}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.68rem', color: isMe ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-muted)' }}>
                                                    <span>{formatTimestamp(m.createdAt)}</span>
                                                    {isMe && <CheckCheck size={13} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* AI Quick Reply Suggestions */}
                        <div style={{ padding: '0.5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                <Sparkles size={13} />
                                <span>Quick Replies:</span>
                            </div>
                            {quickReplies.map((reply, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleQuickReply(reply)}
                                    style={{
                                        fontSize: '0.75rem',
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: '9999px',
                                        background: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        color: '#334155',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        transition: 'all var(--transition-fast)',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>

                        {/* Message Composer */}
                        <form onSubmit={handleSendMessage} className="inmail-composer">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <textarea
                                    rows={3}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={`Write a reply to ${activeThread.otherUserName}... (Press Enter to send)`}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.875rem',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 'var(--radius-md)',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        transition: 'border-color var(--transition-fast)',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                />

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            title="Attach File / Resume"
                                            style={{ border: 'none', background: 'transparent', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                                            onClick={() => alert('Resume attachment enabled')}
                                        >
                                            <Paperclip size={17} />
                                        </button>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            Shift + Enter for new line
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!replyText.trim() || sending}
                                        className="btn btn-primary"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            padding: '0.55rem 1.35rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            opacity: !replyText.trim() || sending ? 0.6 : 1,
                                        }}
                                    >
                                        <span>{sending ? 'Sending...' : 'Send InMail'}</span>
                                        <Send size={15} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: 'var(--text-secondary)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <MessageSquare size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Select a Conversation</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                Choose a thread on the left to review messages and reply.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
