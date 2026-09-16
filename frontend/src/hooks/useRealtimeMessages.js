/**
 * useRealtimeMessages — HireHub AI Real-Time Messaging Hook
 *
 * Strategy (progressive enhancement):
 *  1. Server-Sent Events (SSE) via GET /api/v1/messages/stream
 *     — Pushed by Spring's SseEmitter, zero extra infrastructure needed.
 *  2. Adaptive polling fallback (1.5 s active tab, 8 s backgrounded tab)
 *     — Used when SSE endpoint is unavailable or the browser tab is hidden.
 *
 * Returns: { isLive, latestEvent }
 *  - isLive      : true  → SSE channel open (show "● Live" badge in UI)
 *  - isLive      : false → polling mode
 *  - latestEvent : { type, threadId, messageId } | null
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Adaptive polling intervals
const POLL_ACTIVE_MS     = 1500;   // tab is in foreground
const POLL_BACKGROUND_MS = 8000;  // tab is hidden

export function useRealtimeMessages({ onNewMessage, onThreadUpdate, enabled = true } = {}) {
    const [isLive, setIsLive]           = useState(false);
    const [latestEvent, setLatestEvent] = useState(null);

    const sseRef       = useRef(null);
    const pollTimerRef = useRef(null);
    const mountedRef   = useRef(true);

    /** Retrieve fresh JWT for SSE authorization */
    const getToken = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) return session.access_token;
        } catch (_) {}
        try {
            const dev = JSON.parse(localStorage.getItem('hirehub_dev_session') || 'null');
            if (dev?.access_token) return dev.access_token;
        } catch (_) {}
        return null;
    }, []);

    /** Start adaptive polling fallback */
    const startPolling = useCallback(() => {
        if (pollTimerRef.current) return; // already running

        const tick = () => {
            if (!mountedRef.current) return;
            const interval = document.visibilityState === 'hidden'
                ? POLL_BACKGROUND_MS
                : POLL_ACTIVE_MS;
            setLatestEvent({ type: 'POLL_TICK', timestamp: Date.now() });
            pollTimerRef.current = setTimeout(tick, interval);
        };
        pollTimerRef.current = setTimeout(tick, POLL_ACTIVE_MS);
    }, []);

    /** Open SSE channel; fall back to polling on error */
    const openSse = useCallback(async () => {
        if (sseRef.current) return;
        const token = await getToken();
        if (!token) { startPolling(); return; }

        try {
            // Token passed as query param — EventSource doesn't support custom headers
            const url = `${BASE_URL}/messages/stream?token=${encodeURIComponent(token)}`;
            const es  = new EventSource(url);

            es.onopen = () => {
                if (!mountedRef.current) return;
                setIsLive(true);
                // Stop any existing polling
                if (pollTimerRef.current) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null; }
            };

            es.addEventListener('message', (event) => {
                if (!mountedRef.current) return;
                try {
                    const data = JSON.parse(event.data);
                    setLatestEvent(data);
                    if (data.type === 'NEW_MESSAGE'  && onNewMessage)   onNewMessage(data);
                    if (data.type === 'THREAD_UPDATE' && onThreadUpdate) onThreadUpdate(data);
                } catch (_) {}
            });

            es.onerror = () => {
                es.close();
                sseRef.current = null;
                if (!mountedRef.current) return;
                setIsLive(false);
                startPolling(); // SSE failed → fall back
            };

            sseRef.current = es;
        } catch (err) {
            console.warn('[useRealtimeMessages] SSE unavailable, using adaptive polling:', err?.message);
            startPolling();
        }
    }, [getToken, onNewMessage, onThreadUpdate, startPolling]);

    /** Recalibrate polling interval when tab visibility changes */
    const handleVisibilityChange = useCallback(() => {
        if (isLive) return; // SSE handles this natively
        if (document.visibilityState === 'visible') {
            if (pollTimerRef.current) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null; }
            startPolling();
        }
    }, [isLive, startPolling]);

    useEffect(() => {
        mountedRef.current = true;
        if (!enabled) return;

        openSse();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mountedRef.current = false;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (sseRef.current)       { sseRef.current.close(); sseRef.current = null; }
            if (pollTimerRef.current) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null; }
        };
    }, [enabled, openSse, handleVisibilityChange]);

    return { isLive, latestEvent };
}

export default useRealtimeMessages;
