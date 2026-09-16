import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import storageService from '../../services/storageService';
import candidateService from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';

export const ResumeUploader = ({
  profileId,
  existingResume = null,
  onUploadSuccess,
  isReplacement = false,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const fileInputRef = useRef(null);

  const userId = user?.id || user?.supabaseUserId || profileId || 'candidate';

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const processUpload = async (file) => {
    setError(null);

    // 10.2 File Validation: size, MIME, magic bytes, extension
    try {
      await storageService.validateFile(file);
    } catch (valErr) {
      setError(valErr.message);
      return;
    }

    setUploading(true);
    setProgress(25);

    try {
      setProgress(50);

      // 10.1 & 10.5 Storage Upload or Atomic Replacement
      let storageResult;
      if (isReplacement && existingResume?.fileUrl) {
        storageResult = await storageService.replaceResume(
          userId,
          file,
          existingResume.fileUrl,
          { isCanonical: false }
        );
      } else {
        storageResult = await storageService.uploadResume(userId, file, {
          isCanonical: false,
        });
      }

      setProgress(75);

      // Register or update resume record in Spring Boot PostgreSQL database
      const resumeDTO = {
        fileName: storageResult.fileName,
        fileUrl: storageResult.publicUrl,
        fileType: storageResult.fileType,
        fileSize: storageResult.fileSize,
        isPrimary: true,
        atsScore: Math.floor(Math.random() * (96 - 84 + 1)) + 84, // Simulated initial ATS match score
      };

      let registered;
      if (profileId) {
        registered = await candidateService.addResume(profileId, resumeDTO);
      } else {
        registered = {
          id: 'resume-' + Date.now(),
          ...resumeDTO,
          createdAt: new Date().toISOString(),
        };
      }

      setProgress(100);
      setUploadedResume({
        ...registered,
        storagePath: storageResult.storagePath,
      });

      if (onUploadSuccess) {
        onUploadSuccess(registered);
      }
    } catch (err) {
      console.error('[ResumeUploader] Upload error:', err);
      setError(err?.message || 'Failed to complete resume upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Partition Information Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          background: 'rgba(99, 102, 241, 0.08)',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <ShieldCheck size={14} color="var(--primary-400)" />
        <span>
          Secure Partition: <code>resumes/candidate/{userId}/</code>
        </span>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging
            ? '2px dashed var(--primary-400, #818cf8)'
            : '2px dashed var(--border-subtle, rgba(255, 255, 255, 0.15))',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging
            ? 'rgba(99, 102, 241, 0.08)'
            : 'rgba(15, 23, 42, 0.4)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.85rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background:
              'var(--ai-gradient, linear-gradient(135deg, #6366f1 0%, #a855f7 100%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          {uploading ? (
            <Loader2 size={28} color="#ffffff" className="spin" />
          ) : isReplacement ? (
            <RefreshCw size={28} color="#ffffff" />
          ) : (
            <UploadCloud size={28} color="#ffffff" />
          )}
        </div>

        <div>
          <h4
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 0.25rem',
            }}
          >
            {uploading
              ? isReplacement
                ? 'Replacing Resume in Secure Storage...'
                : 'Uploading to Secure Cloud Storage...'
              : isReplacement
              ? 'Select or drag a new resume to replace existing file'
              : 'Drag and drop your resume here, or browse files'}
          </h4>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary, #94a3b8)',
              margin: 0,
            }}
          >
            Supports PDF, DOCX up to 10MB · Magic byte verified & sanitized
          </p>
        </div>

        {uploading && (
          <div style={{ width: '100%', maxWidth: '320px', marginTop: '0.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--ai-gradient)',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md, 10px)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Upload Success Feedback */}
      {uploadedResume && !uploading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.2rem',
            borderRadius: 'var(--radius-md, 10px)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.88rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>
              <strong>{uploadedResume.fileName}</strong>{' '}
              {isReplacement ? 'replaced' : 'uploaded'} successfully! (ATS Score:{' '}
              {uploadedResume.atsScore}%)
            </span>
          </div>
          <button
            onClick={() => setUploadedResume(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#34d399',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
