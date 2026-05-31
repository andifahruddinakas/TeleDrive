-- Add email to profiles for easier searching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;

-- Update handle_new_user to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END; $$;

-- Table for sharing files with specific users
CREATE TABLE IF NOT EXISTS public.file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (file_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- Policies for file_shares
CREATE POLICY "Users can view shares they sent or received" ON public.file_shares
  FOR SELECT TO authenticated
  USING (auth.uid() = shared_by_user_id OR auth.uid() = shared_with_user_id);

CREATE POLICY "Owners can create shares" ON public.file_shares
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Owners can delete shares" ON public.file_shares
  FOR DELETE TO authenticated
  USING (auth.uid() = shared_by_user_id);

-- Update Files RLS to allow shared access
DROP POLICY IF EXISTS "Users view own files" ON public.files;
CREATE POLICY "Users view files" ON public.files 
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR is_public = true 
    OR EXISTS (
      SELECT 1 FROM public.file_shares 
      WHERE file_id = public.files.id 
      AND shared_with_user_id = auth.uid()
    )
  );

-- Update File Chunks RLS to allow shared access
DROP POLICY IF EXISTS "Users view own chunks" ON public.file_chunks;
CREATE POLICY "Users view chunks" ON public.file_chunks 
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.files WHERE id = file_chunks.file_id AND is_public = true
    )
    OR EXISTS (
      SELECT 1 FROM public.file_shares 
      WHERE file_id = file_chunks.file_id 
      AND shared_with_user_id = auth.uid()
    )
  );
