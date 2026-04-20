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
  n8nConfigured: boolean
}

export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  tags: { id: string; name: string }[]
}

export interface N8nExecution {
  id: string
  finished: boolean
  mode: string
  startedAt: string
  stoppedAt: string | null
  status: 'success' | 'error' | 'running' | 'waiting'
}

export interface N8nWorkflowsResponse {
  data: N8nWorkflow[]
  nextCursor: string | null
}

export interface N8nExecutionsResponse {
  data: N8nExecution[]
  nextCursor: string | null
}
