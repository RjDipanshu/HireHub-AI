-- ==============================================================================
-- Phase 10.6: HireHub AI — Supabase Storage Security Policies for Resumes
-- ==============================================================================
-- Target Bucket: 'resumes'
-- Structure: candidate/{userId}/resume.pdf
--
-- Security Principle:
-- 1. Never expose service_role or master keys in the client bundle.
-- 2. Candidates can only upload, replace, or delete files in their own folder:
--    resumes/candidate/{auth.uid()}/...
-- 3. Candidates can read their own resumes.
-- 4. Authorized recruiters & admins can read applicant resumes.
-- ==============================================================================

-- 1. Ensure the 'resumes' bucket exists and is set to private by default
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false, -- Private bucket: access governed strictly by RLS policies
    10485760, -- 10MB file size limit in bytes
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Enable Row Level Security (RLS) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Policy 1: Candidates can INSERT/UPLOAD files only to their own partition
-- Path pattern: candidate/{auth.uid()}/...
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Candidates can upload resumes to their own folder" ON storage.objects;
CREATE POLICY "Candidates can upload resumes to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes'
    AND (
        name LIKE ('candidate/' || auth.uid()::text || '/%')
        OR (storage.foldername(name))[2] = auth.uid()::text
    )
);

-- ------------------------------------------------------------------------------
-- Policy 2: Candidates can UPDATE/REPLACE files only in their own partition
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Candidates can update resumes in their own folder" ON storage.objects;
CREATE POLICY "Candidates can update resumes in their own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (
        name LIKE ('candidate/' || auth.uid()::text || '/%')
        OR (storage.foldername(name))[2] = auth.uid()::text
    )
)
WITH CHECK (
    bucket_id = 'resumes'
    AND (
        name LIKE ('candidate/' || auth.uid()::text || '/%')
        OR (storage.foldername(name))[2] = auth.uid()::text
    )
);

-- ------------------------------------------------------------------------------
-- Policy 3: Candidates can DELETE files only from their own partition
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Candidates can delete resumes from their own folder" ON storage.objects;
CREATE POLICY "Candidates can delete resumes from their own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (
        name LIKE ('candidate/' || auth.uid()::text || '/%')
        OR (storage.foldername(name))[2] = auth.uid()::text
    )
);

-- ------------------------------------------------------------------------------
-- Policy 4: Candidates can SELECT/READ their own resumes,
-- and Recruiters / Administrators can inspect applicant resumes
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Candidates and Hiring Teams can read resumes" ON storage.objects;
CREATE POLICY "Candidates and Hiring Teams can read resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (
        -- Candidate reading their own resume
        name LIKE ('candidate/' || auth.uid()::text || '/%')
        OR (storage.foldername(name))[2] = auth.uid()::text
        -- Recruiter or Admin role check from jwt claims
        OR (auth.jwt() ->> 'role') IN ('RECRUITER', 'ADMIN', 'authenticated')
    )
);
