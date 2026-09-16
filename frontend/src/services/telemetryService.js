/**
 * HireHub AI — Frontend Telemetry & Performance Monitoring Service (Phase 19)
 * Captures client-side runtime errors, API latency benchmarks, and navigation events.
 */

class TelemetryService {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.listeners = new Set();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // Listen for uncaught JavaScript runtime errors
    window.addEventListener('error', (event) => {
      this.recordError('UNCAUGHT_EXCEPTION', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });
  }

  /**
   * Record an error event
   */
  recordError(type, errorDetails) {
    const entry = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...errorDetails,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notifyListeners(entry);

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Telemetry][${type}]`, entry);
    }

    return entry;
  }

  /**
   * Record API latency and status telemetry
   */
  recordApiMetric(endpoint, durationMs, status, error = null) {
    const entry = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'API_METRIC',
      timestamp: new Date().toISOString(),
      endpoint,
      durationMs,
      status,
      error: error ? String(error) : null,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return entry;
  }

  /**
   * Retrieve recent logs (for admin debugging or telemetry export)
   */
  getRecentLogs(limit = 20) {
    return this.logs.slice(0, limit);
  }

  /**
   * Clear in-memory logs
   */
  clearLogs() {
    this.logs = [];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[Telemetry] Error in listener callback:', err);
      }
    });
  }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
