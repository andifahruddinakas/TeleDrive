-- Update the handle_new_user function to set status to 'approved' by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    'approved' -- Changed from 'pending' to 'approved'
  );

  INSERT INTO public.user_registrations (user_id, email, display_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'approved' -- Changed from 'pending' to 'approved'
  );

  RETURN NEW;
END; $$;

-- Also update any existing pending users to approved
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';
UPDATE public.user_registrations SET status = 'approved' WHERE status = 'pending';
