import api from '@/lib/api'
import type { AuthResponse, UserProfile } from '@/types'

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  me: () =>
    api.get<UserProfile>('/api/auth/me').then((r) => r.data),
}
