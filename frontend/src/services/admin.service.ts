import api from '@/lib/api'

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED'
export type UserRole = 'USER' | 'ADMIN'

export interface UserSummary {
  id: number
  name: string
  email: string
  status: UserStatus
  role: UserRole
  createdAt: string
}

export const adminService = {
  getAllUsers: () => api.get<UserSummary[]>('/api/admin/users').then(r => r.data),
  getPendingUsers: () => api.get<UserSummary[]>('/api/admin/users/pending').then(r => r.data),
  approveUser: (id: number) => api.patch<UserSummary>(`/api/admin/users/${id}/approve`).then(r => r.data),
  rejectUser: (id: number) => api.patch<UserSummary>(`/api/admin/users/${id}/reject`).then(r => r.data),
}
