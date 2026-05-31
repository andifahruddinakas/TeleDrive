-- Add role and status columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN rejection_reason TEXT;

-- Create user registrations table to track pending signups
CREATE TABLE public.user_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_status ON public.user_registrations(status);
CREATE INDEX idx_registrations_user ON public.user_registrations(user_id);
CREATE INDEX idx_registrations_email ON public.user_registrations(email);

ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_registrations
CREATE POLICY "Admins can view all registrations" ON public.user_registrations FOR SELECT 
  TO authenticated 
  USING (
    EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own registration" ON public.user_registrations FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- Function to approve user registration
CREATE OR REPLACE FUNCTION public.approve_user_registration(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_exists BOOLEAN;
  v_user_exists BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if requester is admin
  v_admin_exists := EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
  
  IF NOT v_admin_exists THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;

  -- Check if user exists
  v_user_exists := EXISTS(
    SELECT 1 FROM auth.users WHERE id = p_user_id
  );
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update profile status
  UPDATE profiles 
  SET status = 'approved', updated_at = now()
  WHERE user_id = p_user_id;

  -- Update registration status
  UPDATE user_registrations 
  SET status = 'approved', approved_at = now(), updated_at = now()
  WHERE user_id = p_user_id;

  v_result := json_build_object(
    'success', true,
    'message', 'User approved successfully',
    'user_id', p_user_id
  );

  RETURN v_result;
END; $$;

-- Function to reject user registration
CREATE OR REPLACE FUNCTION public.reject_user_registration(p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_exists BOOLEAN;
  v_user_exists BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if requester is admin
  v_admin_exists := EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
  
  IF NOT v_admin_exists THEN
    RAISE EXCEPTION 'Only admins can reject users';
  END IF;

  -- Check if user exists
  v_user_exists := EXISTS(
    SELECT 1 FROM auth.users WHERE id = p_user_id
  );
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update profile status
  UPDATE profiles 
  SET status = 'rejected', rejection_reason = p_reason, updated_at = now()
  WHERE user_id = p_user_id;

  -- Update registration status
  UPDATE user_registrations 
  SET status = 'rejected', rejection_reason = p_reason, rejected_at = now(), updated_at = now()
  WHERE user_id = p_user_id;

  v_result := json_build_object(
    'success', true,
    'message', 'User rejected successfully',
    'user_id', p_user_id,
    'reason', p_reason
  );

  RETURN v_result;
END; $$;

-- Function to delete user (soft delete via setting status)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_exists BOOLEAN;
  v_user_exists BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if requester is admin
  v_admin_exists := EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
  
  IF NOT v_admin_exists THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Prevent admin from deleting themselves
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Check if user exists
  v_user_exists := EXISTS(
    SELECT 1 FROM auth.users WHERE id = p_user_id
  );
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Mark registration as deleted
  UPDATE user_registrations 
  SET status = 'deleted', updated_at = now()
  WHERE user_id = p_user_id;

  -- Delete user from auth (cascade will clean up profiles, files, etc)
  -- Note: This requires admin access to auth.users table
  DELETE FROM auth.users WHERE id = p_user_id;

  v_result := json_build_object(
    'success', true,
    'message', 'User deleted successfully',
    'user_id', p_user_id
  );

  RETURN v_result;
END; $$;

-- Function to list pending registrations (for admin)
CREATE OR REPLACE FUNCTION public.get_pending_registrations()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  status TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_exists BOOLEAN;
BEGIN
  -- Check if requester is admin
  v_admin_exists := EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
  
  IF NOT v_admin_exists THEN
    RAISE EXCEPTION 'Only admins can view registrations';
  END IF;

  RETURN QUERY
  SELECT 
    ur.user_id,
    ur.email,
    ur.display_name,
    ur.created_at,
    ur.status
  FROM user_registrations ur
  WHERE ur.status = 'pending'
  ORDER BY ur.created_at DESC;
END; $$;

-- Function to get all users for admin management
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_exists BOOLEAN;
BEGIN
  -- Check if requester is admin
  v_admin_exists := EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
  
  IF NOT v_admin_exists THEN
    RAISE EXCEPTION 'Only admins can view users';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    au.email,
    p.display_name,
    p.role,
    p.status,
    p.created_at
  FROM profiles p
  JOIN auth.users au ON p.user_id = au.id
  ORDER BY p.created_at DESC;
END; $$;

-- Update trigger untuk auto-create registration on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    'pending'
  );

  INSERT INTO public.user_registrations (user_id, email, display_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'pending'
  );

  RETURN NEW;
END; $$;

-- Create index untuk quick lookup
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
