import React, { useState } from 'react';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { createTicket } from '../../services/supportService';

export const CATEGORY_OPTIONS = [
  { value: 'TECHNICAL', label: 'Technical Bug / System Error' },
  { value: 'ACCOUNT', label: 'Account Management' },
  { value: 'LOGIN', label: 'Login & Access Issues' },
  { value: 'PASSWORD', label: 'Password Recovery' },
  { value: 'PROFILE', label: 'Profile & Resume' },
  { value: 'JOBS', label: 'Job Postings & Discovery' },
  { value: 'APPLICATION', label: 'Job Applications' },
  { value: 'INTERVIEW', label: 'Interview Scheduling & AI Interview' },
  { value: 'PAYMENTS', label: 'Payments & Subscriptions' },
  { value: 'OTHER', label: 'General Inquiries & Other' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low — Minor question or feedback' },
  { value: 'MEDIUM', label: 'Medium — Normal inquiry (Default)' },
  { value: 'HIGH', label: 'High — Blocking an important workflow' },
  { value: 'URGENT', label: 'Urgent — Critical system or payment issue' },
];

export const CreateTicketForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    const subjectTrimmed = formData.subject.trim();
    if (!subjectTrimmed) {
      newErrors.subject = 'Subject is required.';
    } else if (subjectTrimmed.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters.';
    } else if (subjectTrimmed.length > 200) {
      newErrors.subject = 'Subject cannot exceed 200 characters.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select a priority level.';
    }

    const descriptionTrimmed = formData.description.trim();
    if (!descriptionTrimmed) {
      newErrors.description = 'Description is required.';
    } else if (descriptionTrimmed.length < 10) {
      newErrors.description = 'Please provide a more detailed description (at least 10 characters).';
    } else if (descriptionTrimmed.length > 5000) {
      newErrors.description = 'Description cannot exceed 5000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Duplicate submit protection

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const createdTicket = await createTicket(formData);
      if (onSuccess) {
        onSuccess(createdTicket);
      }
    } catch (err) {
      console.error('[CreateTicketForm] Submission failed:', err);

      let errorMessage = 'Something went wrong while contacting support. Please try again.';
      if (err.statusCode === 401 || err.isUnauthorized) {
        errorMessage = 'Your session has expired. Please sign in again.';
      } else if (err.statusCode === 403 || err.isForbidden) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (err.statusCode === 409) {
        errorMessage = 'A temporary ticket reference collision occurred. Please click Submit again.';
      } else if (err.isValidationError && err.validationErrors) {
        setErrors(err.validationErrors);
        errorMessage = 'Please correct the highlighted errors in the form.';
      } else if (err.message && !err.message.includes('Network Error')) {
        errorMessage = err.message;
      } else if (!navigator.onLine || err.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to HireHub AI. Please check your connection and try again.';
      }

      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {serverError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg, #fce8e6)',
            border: '1px solid var(--danger-border, #fad2cf)',
            color: 'var(--danger, #cc1016)',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{serverError}</span>
        </div>
      )}

      {/* Subject */}
      <div>
        <label
          htmlFor="ticket-subject"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.35rem',
            color: 'var(--text-primary)',
          }}
        >
          <span>Subject <span style={{ color: 'var(--danger)' }}>*</span></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formData.subject.length}/200
          </span>
        </label>
        <input
          id="ticket-subject"
          type="text"
          className={`input ${errors.subject ? 'input-error' : ''}`}
          value={formData.subject}
          maxLength={200}
          disabled={isSubmitting}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="Brief summary of the inquiry (e.g. Unable to schedule interview)"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'ticket-subject-error' : undefined}
          style={{
            borderColor: errors.subject ? 'var(--danger, #cc1016)' : undefined,
            width: '100%',
          }}
        />
        {errors.subject && (
          <p id="ticket-subject-error" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.3rem', margin: '0.3rem 0 0' }}>
            {errors.subject}
          </p>
        )}
      </div>

      {/* Category & Priority Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Category */}
        <div>
          <label
            htmlFor="ticket-category"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.35rem',
              color: 'var(--text-primary)',
            }}
          >
            Category <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            id="ticket-category"
            className="input"
            value={formData.category}
            disabled={isSubmitting}
            onChange={(e) => handleChange('category', e.target.value)}
            style={{ width: '100%' }}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.3rem', margin: '0.3rem 0 0' }}>
              {errors.category}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="ticket-priority"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.35rem',
              color: 'var(--text-primary)',
            }}
          >
            Priority <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            id="ticket-priority"
            className="input"
            value={formData.priority}
            disabled={isSubmitting}
            onChange={(e) => handleChange('priority', e.target.value)}
            style={{ width: '100%' }}
          >
            {PRIORITY_OPTIONS.map((pri) => (
              <option key={pri.value} value={pri.value}>
                {pri.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.3rem', margin: '0.3rem 0 0' }}>
              {errors.priority}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="ticket-description"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.35rem',
            color: 'var(--text-primary)',
          }}
        >
          <span>Detailed Description <span style={{ color: 'var(--danger)' }}>*</span></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formData.description.length}/5000
          </span>
        </label>
        <textarea
          id="ticket-description"
          rows={6}
          className={`input ${errors.description ? 'input-error' : ''}`}
          value={formData.description}
          maxLength={5000}
          disabled={isSubmitting}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Please describe the issue in detail, including steps to reproduce or any relevant details..."
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'ticket-description-error' : undefined}
          style={{
            borderColor: errors.description ? 'var(--danger, #cc1016)' : undefined,
            width: '100%',
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />
        {errors.description && (
          <p id="ticket-description-error" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.3rem', margin: '0.3rem 0 0' }}>
            {errors.description}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="ticket-submit-button"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="spinner" />
            <span>Submitting Ticket...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Submit Support Ticket</span>
          </>
        )}
      </button>
    </form>
  );
};

export default CreateTicketForm;
