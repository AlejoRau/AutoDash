import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { n8nService } from '@/services/n8n.service'
import type { N8nWorkflow, N8nExecution } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Clock, Globe, Mail, Code2, GitBranch, Zap, ArrowRight,
  Database, CheckCircle2, XCircle, Loader2, Pencil, Check, X,
  BarChart2, List, Settings2,
} from 'lucide-react'

const NODE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'n8n-nodes-base.scheduleTrigger': { label: 'Schedule Trigger', icon: <Clock className="w-4 h-4" />, color: 'text-orange-500' },
  'n8n-nodes-base.webhook': { label: 'Webhook Trigger', icon: <Globe className="w-4 h-4" />, color: 'text-blue-500' },
  'n8n-nodes-base.httpRequest': { label: 'HTTP Request', icon: <ArrowRight className="w-4 h-4" />, color: 'text-purple-500' },
  'n8n-nodes-base.gmail': { label: 'Gmail', icon: <Mail className="w-4 h-4" />, color: 'text-red-500' },
  'n8n-nodes-base.code': { label: 'Code', icon: <Code2 className="w-4 h-4" />, color: 'text-yellow-500' },
  'n8n-nodes-base.if': { label: 'If / Condition', icon: <GitBranch className="w-4 h-4" />, color: 'text-cyan-500' },
  'n8n-nodes-base.set': { label: 'Set Data', icon: <Database className="w-4 h-4" />, color: 'text-green-500' },
  'n8n-nodes-base.manualTrigger': { label: 'Manual Trigger', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-500' },
}

function getNodeMeta(type: string) {
  return NODE_META[type] ?? {
    label: type.split('.').pop() ?? type,
    icon: <Settings2 className="w-4 h-4" />,
    color: 'text-muted-foreground',
  }
}

function formatSchedule(node: N8nWorkflow['nodes'][0]): string {
  const interval = node.parameters?.rule?.interval?.[0]
  if (!interval) return 'Schedule configurado'
  const hour = interval.triggerAtHour ?? 0
  const min = interval.triggerAtMinute ?? 0
  return `Todos los días a las ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function getScheduleHour(node: N8nWorkflow['nodes'][0]): number {
  return node.parameters?.rule?.interval?.[0]?.triggerAtHour ?? 9
}

function StatusIcon({ status }: { status: N8nExecution['status'] }) {
  if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />
  if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
  return <Clock className="w-4 h-4 text-muted-foreground" />
}

type Tab = 'nodes' | 'stats' | 'edit'

interface Props {
  workflow: N8nWorkflow
  onClose: () => void
}

export default function WorkflowDetailModal({ workflow, onClose }: Props) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('nodes')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(workflow.name)
  const [scheduleHour, setScheduleHour] = useState<number>(0)

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['n8n-workflow', workflow.id],
    queryFn: () => n8nService.getWorkflow(workflow.id),
    onSuccess: (d) => {
      const schedNode = d.nodes?.find((n) => n.type === 'n8n-nodes-base.scheduleTrigger')
      if (schedNode) setScheduleHour(getScheduleHour(schedNode))
    },
  })

  const { data: execData, isLoading: loadingExecs } = useQuery({
    queryKey: ['n8n-executions', workflow.id],
    queryFn: () => n8nService.getExecutions(workflow.id),
  })

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => n8nService.updateWorkflow(workflow.id, body),
    onSuccess: () => {
      toast.success('Workflow actualizado')
      qc.invalidateQueries({ queryKey: ['n8n-workflows'] })
      qc.invalidateQueries({ queryKey: ['n8n-workflow', workflow.id] })
      setEditingName(false)
    },
    onError: () => toast.error('No se pudo actualizar'),
  })

  function saveName() {
    if (!detail) return
    updateMutation.mutate({ ...detail, name: nameValue } as Record<string, unknown>)
  }

  function saveSchedule() {
    if (!detail) return
    const updated = {
      ...detail,
      nodes: detail.nodes?.map((n) => {
        if (n.type !== 'n8n-nodes-base.scheduleTrigger') return n
        return {
          ...n,
          parameters: {
            ...n.parameters,
            rule: {
              interval: [{ ...n.parameters.rule?.interval?.[0], triggerAtHour: scheduleHour }],
            },
          },
        }
      }),
    }
    updateMutation.mutate(updated as Record<string, unknown>)
  }

  const executions = execData?.data ?? []
  const successCount = executions.filter((e) => e.status === 'success').length
  const errorCount = executions.filter((e) => e.status === 'error').length
  const successRate = executions.length > 0 ? Math.round((successCount / executions.length) * 100) : null

  const nodes = detail?.nodes ?? workflow.nodes ?? []
  const scheduleNode = nodes.find((n) => n.type === 'n8n-nodes-base.scheduleTrigger')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="h-8 text-lg font-semibold" autoFocus />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveName} disabled={updateMutation.isPending}>
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingName(false); setNameValue(workflow.name) }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <DialogTitle className="text-xl">{workflow.name}</DialogTitle>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(true)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            <Badge variant="outline" className={workflow.active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'}>
              {workflow.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex gap-1 border-b mt-2">
          {([['nodes', <List className="w-3.5 h-3.5" />, 'Pasos'], ['stats', <BarChart2 className="w-3.5 h-3.5" />, 'Estadísticas'], ['edit', <Settings2 className="w-3.5 h-3.5" />, 'Configurar']] as [Tab, React.ReactNode, string][]).map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${tab === id ? 'border-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {tab === 'nodes' && (
          <div className="space-y-2 py-2">
            {loadingDetail ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : nodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin nodos</p>
            ) : (
              nodes.map((node, i) => {
                const meta = getNodeMeta(node.type)
                return (
                  <div key={node.id ?? i}>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <div className={`mt-0.5 shrink-0 ${meta.color}`}>{meta.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{node.name}</p>
                        <p className="text-xs text-muted-foreground">{meta.label}</p>
                        {node.type === 'n8n-nodes-base.scheduleTrigger' && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">{formatSchedule(node)}</p>
                        )}
                        {node.type === 'n8n-nodes-base.webhook' && node.parameters?.path && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-mono truncate">/webhook/{node.parameters.path}</p>
                        )}
                        {node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.url && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{node.parameters.url}</p>
                        )}
                      </div>
                    </div>
                    {i < nodes.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{executions.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Exitosas</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Fallidas</p>
              </div>
            </div>

            {successRate !== null && (
              <div className="rounded-lg border p-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Tasa de éxito</span>
                  <span className="font-medium">{successRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${successRate}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium mb-2">Ejecuciones recientes</p>
              {loadingExecs ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : executions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin ejecuciones todavía</p>
              ) : (
                executions.map((exec) => (
                  <div key={exec.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <StatusIcon status={exec.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm capitalize">{exec.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exec.startedAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {exec.stoppedAt && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round((new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000)}s
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'edit' && (
          <div className="space-y-5 py-2">
            {scheduleNode ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Horario de ejecución</p>
                <p className="text-xs text-muted-foreground">Actualmente: {formatSchedule(scheduleNode)}</p>
                <div className="flex items-center gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="text-xs text-muted-foreground">Hora (0-23)</label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <Button onClick={saveSchedule} disabled={updateMutation.isPending} className="mt-5">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar horario'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  El workflow se ejecutará todos los días a las {String(scheduleHour).padStart(2, '0')}:00
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Este workflow no tiene un trigger de tipo Schedule.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
