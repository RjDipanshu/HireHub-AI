import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LifeBuoy,
  PlusCircle,
  Ticket,
  HelpCircle,
  Mail,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getMyTickets } from '../../services/supportService';
import CreateTicketForm from '../../components/support/CreateTicketForm';
import SupportTicketSuccessCard from '../../components/support/SupportTicketSuccessCard';
import SupportTicketList from '../../components/support/SupportTicketList';

export const SupportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'create';

  const [activeTab, setActiveTab] = useState(initialTab); // 'create' | 'tickets' | 'faq'
  const [createdTicket, setCreatedTicket] = useState(null);

  // Tickets list state
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState(0);

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    setTicketsError(null);
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error('[SupportPage] Failed to fetch tickets:', err);
      let msg = 'Failed to load your support tickets. Please try again.';
      if (err.statusCode === 401 || err.isUnauthorized) {
        msg = 'Your session has expired. Please sign in again.';
      } else if (!navigator.onLine || err.message?.includes('Network Error')) {
        msg = 'Unable to connect to HireHub AI. Please check your connection.';
      }
      setTicketsError(msg);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab === 'tickets') {
      fetchTickets();
    }
  };

  const handleTicketCreatedSuccess = (ticket) => {
    setCreatedTicket(ticket);
    // Refresh tickets in background so the badge and list are updated
    fetchTickets();
  };

  const handleCreateAnother = () => {
    setCreatedTicket(null);
    setActiveTab('create');
  };

  const handleViewTickets = () => {
    setCreatedTicket(null);
    handleTabChange('tickets');
  };

  const faqs = [
    {
      id: 0,
      question: 'How do support ticket response times work?',
      answer: 'Our customer engineering team reviews tickets based on their designated priority. Urgent and high priority inquiries receive an initial response within 2 hours, while normal requests are handled within 12 business hours.',
    },
    {
      id: 1,
      question: 'Can I track the status of my inquiry?',
      answer: 'Yes. Visit the "My Support Tickets" tab at any time to view real-time status updates (OPEN, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, CLOSED) for all inquiries associated with your account.',
    },
    {
      id: 2,
      question: 'How does HireHub AI handle billing or plan changes?',
      answer: 'For enterprise subscription inquiries or billing assistance, choose the "PAYMENTS" category when submitting your ticket. A member of our billing operations team will follow up directly.',
    },
    {
      id: 3,
      question: 'Is my account information and applicant data kept secure?',
      answer: 'Yes. All data stored on HireHub AI is encrypted at rest and in transit. Support staff only review technical diagnostics strictly relevant to resolving your inquiry.',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Page Header */}
      <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'var(--color-primary-light, #e8f3fc)',
            color: 'var(--color-primary, #0a66c2)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <LifeBuoy size={16} /> 24/7 HireHub AI Help & Support
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          Help & Support
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Need help? We're here to make your HireHub AI experience smoother.
        </p>
      </section>

      {/* Main Grid: Content Tabs + Support Info Sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left / Main Column: Support Portal */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Navigation Tabs */}
          <div
            role="tablist"
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '2px solid var(--border-subtle)',
              marginBottom: '1.75rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
            }}
          >
            <button
              type="button"
              role="tab"
              id="tab-create-ticket"
              aria-selected={activeTab === 'create'}
              onClick={() => handleTabChange('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: 'pointer',
                color: activeTab === 'create' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'create' ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
              }}
            >
              <PlusCircle size={16} />
              <span>Create Ticket</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-my-tickets"
              aria-selected={activeTab === 'tickets'}
              onClick={() => handleTabChange('tickets')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: 'pointer',
                color: activeTab === 'tickets' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'tickets' ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
              }}
            >
              <Ticket size={16} />
              <span>My Support Tickets</span>
              {tickets.length > 0 && (
                <span
                  style={{
                    background: activeTab === 'tickets' ? 'var(--color-primary)' : '#e5e7eb',
                    color: activeTab === 'tickets' ? '#ffffff' : 'var(--text-secondary)',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {tickets.length}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              id="tab-faq"
              aria-selected={activeTab === 'faq'}
              onClick={() => handleTabChange('faq')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: 'pointer',
                color: activeTab === 'faq' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'faq' ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
              }}
            >
              <HelpCircle size={16} />
              <span>Knowledge Base & FAQs</span>
            </button>
          </div>

          {/* Tab 1: Create Ticket */}
          {activeTab === 'create' && (
            <div>
              {createdTicket ? (
                <SupportTicketSuccessCard
                  ticket={createdTicket}
                  onViewTickets={handleViewTickets}
                  onCreateAnother={handleCreateAnother}
                />
              ) : (
                <div className="card" style={{ padding: '2rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      Submit a New Support Ticket
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Fill out the form below with relevant details. A unique tracking reference will be generated upon submission.
                    </p>
                  </div>
                  <CreateTicketForm onSuccess={handleTicketCreatedSuccess} />
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Support Tickets */}
          {activeTab === 'tickets' && (
            <div>
              <SupportTicketList
                tickets={tickets}
                isLoading={isLoadingTickets}
                error={ticketsError}
                onRefresh={fetchTickets}
                onCreateTicketClick={() => setActiveTab('create')}
              />
            </div>
          )}

          {/* Tab 3: FAQ & Knowledge Base */}
          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {faqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      border: isOpen ? '1px solid #cbd5e1' : '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.15rem 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        gap: '1rem',
                      }}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={18} color="var(--color-primary)" />
                      ) : (
                        <ChevronDown size={18} color="#94a3b8" />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '0 1.25rem 1.25rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '0.85rem',
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Direct Channels & SLA Info */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="card"
            style={{
              padding: '1.75rem 1.5rem',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Direct Support Channels
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Mail size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Email Operations</div>
                  <a
                    href="mailto:support@hirehub.ai"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.85rem' }}
                  >
                    support@hirehub.ai
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Clock size={18} color="var(--success, #057642)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Operating Hours</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                    Mon — Sat, 9:00 AM — 8:00 PM IST
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem' }}>
                <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Service SLA</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                    Median response &lt; 2 hours for urgent inquiries
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              background: 'var(--color-primary-light, #e8f3fc)',
              border: '1px solid #c8e1f9',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              💡 Pro Tip: Faster Resolution
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Include screenshots, specific steps to reproduce, or relevant URLs in your description so our engineering team can diagnose your issue right away.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SupportPage;
