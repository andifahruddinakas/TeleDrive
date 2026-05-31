CREATE OR REPLACE FUNCTION search_users_by_email(search_query TEXT)
RETURNS TABLE (user_id UUID, email TEXT, display_name TEXT, avatar_url TEXT) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id, 
    u.email::TEXT, 
    COALESCE(p.display_name, split_part(u.email, '@', 1)) as display_name,
    p.avatar_url
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE u.email ILIKE '%' || search_query || '%'
     OR p.display_name ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION search_users_by_email(TEXT) TO authenticated;
