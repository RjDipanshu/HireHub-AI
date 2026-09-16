import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Clock, 
    Play, 
    Server, 
    Shield, 
    Lock, 
    Activity, 
    RefreshCw,
    Terminal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { runApiIntegrationTests } from '../../utils/apiTestRunner';
import api from '../../services/api';

export const ApiIntegrationTestPage = () => {
    const { user, session } = useAuth();
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);

    const executeTests = async () => {
        setIsRunning(true);
        try {
            const results = await runApiIntegrationTests(user, session);
            setTestResults(results);
            if (results.length > 0) {
                setSelectedTest(results[0]);
            }
        } catch (err) {
            console.error('Error running test runner:', err);
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        executeTests();
    }, []);

    const successCount = testResults.filter((r) => r.status === 'SUCCESS').length;
    const failedCount = testResults.filter((r) => r.status === 'FAILED').length;
    const warningCount = testResults.filter((r) => r.status === 'WARNING').length;
    const skippedCount = testResults.filter((r) => r.status === 'SKIPPED').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity color="var(--primary-400, #818cf8)" /> API Integration Test Console
                    </h1>
                    <p style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        Phase 3 Diagnostic Suite: Verifying Centralized Axios Client, JWT Interceptors, Spring Boot REST endpoints, and RBAC security.
                    </p>
                </div>
                <button
                    onClick={executeTests}
                    disabled={isRunning}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', cursor: isRunning ? 'not-allowed' : 'pointer' }}
                >
                    {isRunning ? <RefreshCw className="spin" size={18} /> : <Play size={18} />}
                    {isRunning ? 'Running Diagnostic...' : 'Re-run All Tests'}
                </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 'var(--radius-md, 8px)' }}>
                        <Server size={22} color="#3b82f6" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                            {api.defaults.baseURL}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>API Target Base URL</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md, 8px)' }}>
                        <CheckCircle2 size={22} color="#10b981" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{successCount}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>Passing Scenarios</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-md, 8px)' }}>
                        <XCircle size={22} color="#ef4444" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: failedCount > 0 ? '#ef4444' : 'inherit' }}>{failedCount}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>Failed Scenarios</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md, 8px)' }}>
                        <Shield size={22} color="#f59e0b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.role || 'Guest'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Identity Role</div>
                    </div>
                </div>
            </div>

            {/* Test Results Table & Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Test List (Left Column) */}
                <div className="card md:col-span-7" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={18} /> Integration Test Scenarios ({testResults.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {testResults.map((test, index) => {
                            const isSelected = selectedTest?.name === test.name;
                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedTest(test)}
                                    style={{
                                        padding: '0.9rem 1.1rem',
                                        borderRadius: '8px',
                                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
                                        border: isSelected ? '1px solid var(--primary-500, #6366f1)' : '1px solid var(--border-color, rgba(255,255,255,0.07))',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease-in-out',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {test.status === 'SUCCESS' && <CheckCircle2 size={18} color="#10b981" />}
                                        {test.status === 'FAILED' && <XCircle size={18} color="#ef4444" />}
                                        {test.status === 'WARNING' && <AlertTriangle size={18} color="#f59e0b" />}
                                        {test.status === 'SKIPPED' && <Clock size={18} color="#94a3b8" />}

                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{test.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>{test.category}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>{test.durationMs}ms</span>
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '999px',
                                                fontWeight: 700,
                                                background:
                                                    test.status === 'SUCCESS'
                                                        ? 'rgba(16, 185, 129, 0.2)'
                                                        : test.status === 'FAILED'
                                                        ? 'rgba(239, 68, 68, 0.2)'
                                                        : test.status === 'WARNING'
                                                        ? 'rgba(245, 158, 11, 0.2)'
                                                        : 'rgba(148, 163, 184, 0.2)',
                                                color:
                                                    test.status === 'SUCCESS'
                                                        ? '#10b981'
                                                        : test.status === 'FAILED'
                                                        ? '#ef4444'
                                                        : test.status === 'WARNING'
                                                        ? '#f59e0b'
                                                        : '#94a3b8',
                                            }}
                                        >
                                            {test.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Test Detail Inspector (Right Column) */}
                <div className="card md:col-span-5" style={{ padding: '1.25rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={18} /> Diagnostics Inspector
                    </h3>

                    {selectedTest ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Scenario
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{selectedTest.name}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Status & Duration
                                </div>
                                <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: selectedTest.status === 'SUCCESS' ? '#10b981' : selectedTest.status === 'FAILED' ? '#ef4444' : '#f59e0b' }}>
                                        {selectedTest.status}
                                    </span>
                                    <span>•</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)' }}>{selectedTest.durationMs} milliseconds</span>
                                    <span>•</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)' }}>{selectedTest.timestamp}</span>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Execution Details
                                </div>
                                <div
                                    style={{
                                        marginTop: '0.4rem',
                                        padding: '0.85rem',
                                        background: 'var(--bg-secondary, rgba(0,0,0,0.25))',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {selectedTest.details}
                                </div>
                            </div>

                            {selectedTest.raw && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Payload / Error Inspection
                                    </div>
                                    <pre
                                        style={{
                                            marginTop: '0.4rem',
                                            padding: '0.85rem',
                                            background: '#090d16',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            overflowX: 'auto',
                                            maxHeight: '220px',
                                            color: '#38bdf8',
                                        }}
                                    >
                                        {JSON.stringify(selectedTest.raw, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-secondary, #94a3b8)', textAlign: 'center', padding: '2rem' }}>
                            Select a test scenario to inspect execution details and response payload.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiIntegrationTestPage;
