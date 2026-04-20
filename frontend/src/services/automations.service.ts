import api from '@/lib/api'
import type { Automation, AutomationStatus, PagedResponse, TriggerType } from '@/types'

export interface AutomationFilters {
  page?: number
  size?: number
  status?: AutomationStatus
  search?: string
}

export interface AutomationPayload {
  name: string
  description?: string
  triggerType: TriggerType
  triggerConfig?: string
}

export const automationsService = {
  findAll: (filters: AutomationFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.set('page', String(filters.page))
    if (filters.size !== undefined) params.set('size', String(filters.size))
    if (filters.status) params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)
    return api.get<PagedResponse<Automation>>(`/api/automations?${params}`).then((r) => r.data)
  },

  findById: (id: number) =>
    api.get<Automation>(`/api/automations/${id}`).then((r) => r.data),

  create: (data: AutomationPayload) =>
    api.post<Automation>('/api/automations', data).then((r) => r.data),

  update: (id: number, data: AutomationPayload) =>
    api.put<Automation>(`/api/automations/${id}`, data).then((r) => r.data),

  updateStatus: (id: number, status: AutomationStatus) =>
    api.patch<Automation>(`/api/automations/${id}/status?status=${status}`).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/automations/${id}`),
}
