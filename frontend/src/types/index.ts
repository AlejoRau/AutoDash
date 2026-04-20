export type AutomationStatus = 'ACTIVE' | 'INACTIVE' | 'RUNNING'
export type TriggerType = 'MANUAL' | 'SCHEDULE' | 'WEBHOOK'

export interface Automation {
  id: number
  name: string
  description: string | null
  status: AutomationStatus
  triggerType: TriggerType
  triggerConfig: string | null
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  currentPage: number
  totalPages: number
  totalElements: number
}

export interface AuthResponse {
  token: string | null
  userId: number
  name: string
  email: string
}

export interface UserProfile {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}
