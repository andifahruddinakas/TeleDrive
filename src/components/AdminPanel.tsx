import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Trash2, XCircle, Loader2 } from 'lucide-react'
import {
  getPendingRegistrations,
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  promoteUserToAdmin,
  demoteAdminToUser,
  type UserRegistration,
  type UserProfile,
} from '@/lib/admin-api'

export function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState<UserRegistration[]>([])
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    userId: string | null
    reason: string
  }>({ open: false, userId: null, reason: '' })

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pending, all] = await Promise.all([
        getPendingRegistrations(),
        getAllUsers(),
      ])
      setPendingUsers(pending)
      setAllUsers(all)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId)
      await approveUser(userId)
      // Remove dari pending dan update semua users
      setPendingUsers(pendingUsers.filter(u => u.user_id !== userId))
      await loadData()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to approve user'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (userId: string) => {
    setRejectDialog({ open: true, userId, reason: '' })
  }

  const handleRejectConfirm = async () => {
    if (!rejectDialog.userId) return

    try {
      setActionLoading(rejectDialog.userId)
      await rejectUser(rejectDialog.userId, rejectDialog.reason || undefined)
      setPendingUsers(
        pendingUsers.filter(u => u.user_id !== rejectDialog.userId)
      )
      setRejectDialog({ open: false, userId: null, reason: '' })
      await loadData()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to reject user'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(userId)
      await deleteUser(userId)
      setAllUsers(allUsers.filter(u => u.user_id !== userId))
      await loadData()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete user'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromoteAdmin = async (userId: string) => {
    try {
      setActionLoading(userId)
      await promoteUserToAdmin(userId)
      await loadData()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to promote user'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemoteAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) {
      return
    }

    try {
      setActionLoading(userId)
      await demoteAdminToUser(userId)
      await loadData()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to demote user'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return variants[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage user registrations and permissions</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Registrations ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Users ({allUsers.length})</TabsTrigger>
        </TabsList>

        {/* Pending Registrations Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No pending registrations</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending User Registrations</CardTitle>
                <CardDescription>
                  Review and approve or reject new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map(user => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-mono text-sm">{user.email}</TableCell>
                          <TableCell>{user.display_name || '-'}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(user.user_id)}
                              disabled={actionLoading === user.user_id}
                            >
                              {actionLoading === user.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(user.user_id)}
                              disabled={actionLoading === user.user_id}
                            >
                              {actionLoading === user.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map(user => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-mono text-sm">{user.email}</TableCell>
                        <TableCell>{user.display_name || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {user.role === 'user' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromoteAdmin(user.user_id)}
                              disabled={actionLoading === user.user_id}
                            >
                              {actionLoading === user.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Make Admin'
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDemoteAdmin(user.user_id)}
                              disabled={actionLoading === user.user_id}
                            >
                              {actionLoading === user.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Remove Admin'
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user.user_id)}
                            disabled={actionLoading === user.user_id}
                          >
                            {actionLoading === user.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open =>
        setRejectDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this user (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Reason for rejection..."
              value={rejectDialog.reason}
              onChange={e =>
                setRejectDialog(prev => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, userId: null, reason: '' })
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
