/**
 * Admin User Management API
 * Helper functions untuk approve/reject/delete users
 * 
 * Hanya accessible oleh users dengan role 'admin'
 */

import { supabase } from '@/integrations/supabase/client'

export interface UserRegistration {
  user_id: string
  email: string
  display_name: string | null
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface UserProfile {
  user_id: string
  email: string
  display_name: string | null
  role: 'user' | 'admin'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface AdminResponse {
  success: boolean
  message: string
  user_id?: string
  reason?: string
}

/**
 * Get all pending user registrations
 * Only admins can access this
 */
export async function getPendingRegistrations(): Promise<UserRegistration[]> {
  try {
    const { data, error } = await supabase.rpc('get_pending_registrations')

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching pending registrations:', error)
    throw error
  }
}

/**
 * Get all users (for admin management)
 * Only admins can access this
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase.rpc('get_all_users_for_admin')

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Approve user registration
 * Admin only - makes user account active
 */
export async function approveUser(userId: string): Promise<AdminResponse> {
  try {
    const { data, error } = await supabase.rpc('approve_user_registration', {
      p_user_id: userId,
    })

    if (error) throw error

    return data as AdminResponse
  } catch (error) {
    console.error('Error approving user:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to approve user - you may not have permission'
    )
  }
}

/**
 * Reject user registration
 * Admin only - sets user status to rejected
 */
export async function rejectUser(
  userId: string,
  reason?: string
): Promise<AdminResponse> {
  try {
    const { data, error } = await supabase.rpc('reject_user_registration', {
      p_user_id: userId,
      p_reason: reason || null,
    })

    if (error) throw error

    return data as AdminResponse
  } catch (error) {
    console.error('Error rejecting user:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to reject user - you may not have permission'
    )
  }
}

/**
 * Delete user by admin
 * Admin only - hard delete user account
 * Cannot delete own account
 */
export async function deleteUser(userId: string): Promise<AdminResponse> {
  try {
    const { data, error } = await supabase.rpc('delete_user_by_admin', {
      p_user_id: userId,
    })

    if (error) throw error

    return data as AdminResponse
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to delete user - you may not have permission'
    )
  }
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return data?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Make user admin
 * Admin only - promote user to admin role
 */
export async function promoteUserToAdmin(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    throw error
  }
}

/**
 * Remove admin role
 * Admin only - demote admin to regular user
 */
export async function demoteAdminToUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error demoting admin:', error)
    throw error
  }
}
