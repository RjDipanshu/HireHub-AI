import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import InterviewCard from '../../components/interviews/InterviewCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Plus, Users, CheckCircle2, Clock, Video, AlertCircle } from 'lucide-react';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [toastMessage, setToastMessage] = useState('');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const data = await interviewService.getRecruiterInterviews();
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch recruiter interviews:', err);
      // Demo interviews
      setInterviews([
        {
          id: 'int-1',
          jobTitle: 'Senior Full Stack Engineer',
          candidateName: 'Sarah Jenkins',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          status: 'SCHEDULED',
          roundName: 'Technical Architecture Round',
        },
        {
          id: 'int-2',
          jobTitle: 'Backend Systems Specialist',
          candidateName: 'Michael Chen',
          scheduledAt: new Date(Date.now() + 172800000).toISOString(),
          meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
          status: 'SCHEDULED',
          roundName: 'Live Coding & Algorithms',
        },
        {
          id: 'int-3',
          jobTitle: 'Lead Frontend Architect',
          candidateName: 'Elena Rostova',
          scheduledAt: new Date(Date.now() - 86400000).toISOString(),
          meetingLink: 'https://meet.google.com/mno-pqrs-tuv',
          status: 'COMPLETED',
          roundName: 'Hiring Manager Behavioral',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleReschedule = async (interviewId) => {
    const current = interviews.find((i) => i.id === interviewId);
    const defaultDate = current?.scheduledAt
      ? new Date(current.scheduledAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 86400000).toISOString().slice(0, 16);

    const newTimeInput = window.prompt(
      'Enter new interview date & time (YYYY-MM-DDTHH:MM, e.g. 2026-09-12T15:00):',
      defaultDate
    );
    if (!newTimeInput) return;

    try {
      const isoTime = new Date(newTimeInput).toISOString();
      await interviewService.rescheduleInterview(interviewId, isoTime);
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, scheduledAt: isoTime } : i))
      );
      setToastMessage('Interview rescheduled successfully!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reschedule.');
    }
  };

  const handleCancel = async (interviewId) => {
    const reason = window.prompt('Please enter a cancellation reason for candidate notification:');
    if (reason === null) return;

    try {
      await interviewService.cancelInterview(interviewId, reason || 'Schedule conflict');
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, status: 'CANCELLED' } : i))
      );
      setToastMessage('Interview cancelled and candidate notified.');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to cancel interview');
    }
  };

  const handleMarkCompleted = async (interviewId) => {
    const feedback = window.prompt('Enter interview round evaluation / debrief feedback:');
    try {
      await interviewService.completeInterview(interviewId, feedback || 'Round completed successfully');
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, status: 'COMPLETED' } : i))
      );
      setToastMessage('Interview marked completed.');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to complete interview');
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (activeTab === 'UPCOMING') return item.status === 'SCHEDULED';
    if (activeTab === 'COMPLETED') return item.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return item.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return <LoadingSpinner label="Loading scheduled interview agenda..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.35rem' }}>Recruiter Interview Center</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Coordinate evaluation rounds, manage video conference links, and debrief candidate performance.
          </p>
        </div>

        <Link to="/recruiter/applications" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={16} /> Schedule via Pipeline
        </Link>
      </div>

      {toastMessage && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'UPCOMING', label: 'Upcoming Rounds' },
          { id: 'COMPLETED', label: 'Completed Debriefs' },
          { id: 'CANCELLED', label: 'Cancelled' },
          { id: 'ALL', label: 'All Interviews' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const count =
            tab.id === 'ALL'
              ? interviews.length
              : tab.id === 'UPCOMING'
              ? interviews.filter((i) => i.status === 'SCHEDULED').length
              : interviews.filter((i) => i.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
              style={{
                borderRadius: '20px',
                padding: '0.4rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  fontSize: '0.725rem',
                  background: active ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interview Grid */}
      {filteredInterviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No {activeTab.toLowerCase()} interviews</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
            Schedule interviews directly from candidate applicant profiles to see them listed here.
          </p>
          <Link to="/recruiter/applications" className="btn btn-primary btn-sm">
            View Candidate Applications
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map((item) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <InterviewCard
                interview={item}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
              {item.status === 'SCHEDULED' && (
                <div style={{ position: 'absolute', top: '1.25rem', right: '5rem' }}>
                  <button
                    onClick={() => handleMarkCompleted(item.id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#10b981' }}
                    title="Mark round as completed"
                  >
                    ✓ Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewsPage;
