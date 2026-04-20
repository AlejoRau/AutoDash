import api from '@/lib/api'
import type { N8nWorkflowsResponse, N8nExecutionsResponse, N8nWorkflow } from '@/types'

export const n8nService = {
  saveSettings: (data: { n8nUrl: string; n8nApiKey: string }) =>
    api.put('/api/n8n/settings', data),

  getWorkflows: () =>
    api.get<N8nWorkflowsResponse>('/api/n8n/workflows').then((r) => r.data),

  getWorkflow: (id: string) =>
    api.get<N8nWorkflow>(`/api/n8n/workflows/${id}`).then((r) => r.data),

  getExecutions: (workflowId: string) =>
    api.get<N8nExecutionsResponse>(`/api/n8n/workflows/${workflowId}/executions`).then((r) => r.data),

  activate: (workflowId: string) =>
    api.post(`/api/n8n/workflows/${workflowId}/activate`).then((r) => r.data),

  deactivate: (workflowId: string) =>
    api.post(`/api/n8n/workflows/${workflowId}/deactivate`).then((r) => r.data),

  run: (workflowId: string, body?: Record<string, unknown>) =>
    api.post(`/api/n8n/workflows/${workflowId}/run`, body ?? {}).then((r) => r.data),
}
