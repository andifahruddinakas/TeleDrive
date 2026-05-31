-- Migration: Restore Sharing Functionality & Security
-- Description: Adds sharing security columns and collaboration table

-- 1. Add security columns to files table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='share_password') THEN
        ALTER TABLE public.files ADD COLUMN share_password TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='share_expires_at') THEN
        ALTER TABLE public.files ADD COLUMN share_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Create file_shares table for collaboration
CREATE TABLE IF NOT EXISTS public.file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(file_id, shared_with)
);

-- 3. Enable RLS on file_shares
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for file_shares

-- Owners can see who they shared with
CREATE POLICY "Users can see shares for their own files" ON public.file_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.files 
            WHERE files.id = file_shares.file_id 
            AND files.user_id = auth.uid()
        )
    );

-- Recipients can see shares directed to them
CREATE POLICY "Users can see files shared with them" ON public.file_shares
    FOR SELECT USING (user_id = auth.uid());

-- Owners can manage (insert/delete) shares
CREATE POLICY "Owners can manage file shares" ON public.file_shares
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.files 
            WHERE files.id = file_shares.file_id 
            AND files.user_id = auth.uid()
        )
    );

-- 5. Update Files RLS to allow access to shared users
-- This policy allows users to SELECT files that have been shared with them explicitly
CREATE POLICY "Users can access shared files" ON public.files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.file_shares 
            WHERE file_shares.file_id = files.id 
            AND file_shares.user_id = auth.uid()
        )
    );
