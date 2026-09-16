import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import telemetryService from '../../services/telemetryService';

/**
 * Production React Error Boundary
 * Catches unhandled JavaScript exceptions in child component trees,
 * reports telemetry, and renders an elegant recovery screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    telemetryService.recordError('REACT_RENDER_CRASH', {
      message: error?.message || 'Unknown render error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main, #0f172a)',
            padding: '2rem',
            color: 'var(--text-primary, #f8fafc)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              background: 'var(--bg-card, rgba(30, 41, 59, 0.8))',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something Went Wrong
            </h2>

            <p
              style={{
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
              }}
            >
              An unexpected error occurred while rendering this view. The issue has been recorded in our telemetry monitor.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  marginBottom: '1.75rem',
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  overflowX: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Technical Details
                </summary>
                <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={this.handleReset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={15} /> Reload Page
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleGoHome}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Home size={15} /> Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
