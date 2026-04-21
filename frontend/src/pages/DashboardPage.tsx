import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { automationsService } from '@/services/automations.service'
import { useDebounce } from '@/hooks/useDebounce'
import type { Automation, AutomationStatus } from '@/types'
import AppLayout from '@/components/AppLayout'
import AutomationModal from '@/components/AutomationModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Play, Zap, Clock, Globe,
  CheckCircle2, CircleDashed, Loader2, LayoutGrid, Activity,
} from 'lucide-react'

const statusColors: Record<AutomationStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-muted text-muted-foreground',
  RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const triggerIcons: Record<string, React.ReactNode> = {
  MANUAL: <Zap className="w-3.5 h-3.5" />,
  SCHEDULE: <Clock className="w-3.5 h-3.5" />,
  WEBHOOK: <Globe className="w-3.5 h-3.5" />,
}

const triggerLabels: Record<string, string> = {
  MANUAL: 'Manual',
  SCHEDULE: 'Schedule',
  WEBHOOK: 'Webhook',
}

function parseWebhookUrl(triggerConfig: string | null): string | null {
  if (!triggerConfig) return null
  try {
    const parsed = JSON.parse(triggerConfig)
    return parsed.url ?? null
  } catch {
    if (triggerConfig.startsWith('http')) return triggerConfig
    return null
  }
}

export default function DashboardPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AutomationStatus | 'ALL'>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Automation | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Automation | undefined>()
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['automations', page, debouncedSearch, status],
    queryFn: () => automationsService.findAll({
      page,
      size: 20,
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : status,
    }),
  })

  const { data: statsData } = useQuery({
    queryKey: ['automations-stats'],
    queryFn: () => automationsService.findAll({ size: 100 }),
    staleTime: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: automationsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] })
      qc.invalidateQueries({ queryKey: ['automations-stats'] })
      toast.success('Quick action eliminada')
      setDeleteTarget(undefined)
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AutomationStatus }) =>
      automationsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] })
      qc.invalidateQueries({ queryKey: ['automations-stats'] })
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  const runWebhookMutation = useMutation({
    mutationFn: async ({ url, id }: { url: string; id: number }) => {
      automationsService.updateStatus(id, 'RUNNING')
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Webhook returned error')
    },
    onSuccess: (_, { id }) => {
      toast.success('Webhook ejecutado')
      setTimeout(() => {
        automationsService.updateStatus(id, 'ACTIVE')
        qc.invalidateQueries({ queryKey: ['automations'] })
        qc.invalidateQueries({ queryKey: ['automations-stats'] })
      }, 2000)
    },
    onError: () => toast.error('No se pudo ejecutar el webhook'),
  })

  function toggleStatus(a: Automation) {
    if (a.status === 'RUNNING') return
    const next: AutomationStatus = a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    statusMutation.mutate({ id: a.id, status: next })
  }

  const allItems = statsData?.content ?? []
  const stats = {
    total: statsData?.totalElements ?? 0,
    active: allItems.filter((a) => a.status === 'ACTIVE').length,
    inactive: allItems.filter((a) => a.status === 'INACTIVE').length,
    running: allItems.filter((a) => a.status === 'RUNNING').length,
  }

  const automations = data?.content ?? []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Quick Actions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tus shortcuts para ejecutar y controlar automations
            </p>
          </div>
          <Button onClick={() => { setEditing(undefined); setModalOpen(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Nueva
          </Button>
        </div>

        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <LayoutGrid className="w-8 h-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Activas</p>
                    <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.active}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500/25" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Inactivas</p>
                    <p className="text-3xl font-bold mt-1 text-muted-foreground">{stats.inactive}</p>
                  </div>
                  <CircleDashed className="w-8 h-8 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Ejecutando</p>
                    <p className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.running}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500/25" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="max-w-xs"
          />
          <Select value={status} onValueChange={(v) => { setStatus(v as AutomationStatus | 'ALL'); setPage(0) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ACTIVE">Activas</SelectItem>
              <SelectItem value="INACTIVE">Inactivas</SelectItem>
              <SelectItem value="RUNNING">Ejecutando</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : automations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No hay quick actions todavía</p>
            <Button variant="link" className="mt-1" onClick={() => { setEditing(undefined); setModalOpen(true) }}>
              Crear la primera
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {automations.map((a) => {
              const webhookUrl = a.triggerType === 'WEBHOOK' ? parseWebhookUrl(a.triggerConfig) : null
              const isRunning = a.status === 'RUNNING'
              return (
                <Card key={a.id} className={`flex flex-col transition-opacity ${a.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight truncate">{a.name}</h3>
                        {a.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(a); setModalOpen(true) }} title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(a)} title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={statusColors[a.status]}>
                        {isRunning && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {a.status === 'ACTIVE' ? 'Activa' : a.status === 'INACTIVE' ? 'Inactiva' : 'Ejecutando'}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {triggerIcons[a.triggerType]}
                        {triggerLabels[a.triggerType]}
                      </span>
                    </div>

                    <div className="mt-auto pt-2 flex gap-2">
                      {webhookUrl ? (
                        <Button
                          className="flex-1"
                          size="sm"
                          disabled={isRunning || runWebhookMutation.isPending}
                          onClick={() => runWebhookMutation.mutate({ url: webhookUrl, id: a.id })}
                        >
                          {isRunning
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Ejecutando...</>
                            : <><Play className="w-3.5 h-3.5 mr-1.5" /> Ejecutar</>
                          }
                        </Button>
                      ) : (
                        <Button
                          className="flex-1"
                          size="sm"
                          variant="outline"
                          disabled={isRunning || statusMutation.isPending}
                          onClick={() => toggleStatus(a)}
                        >
                          {a.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                      {webhookUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isRunning}
                          onClick={() => toggleStatus(a)}
                          title={a.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        >
                          {a.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Creada {new Date(a.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Página {page + 1} de {data.totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <AutomationModal open={modalOpen} onClose={() => setModalOpen(false)} automation={editing} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Eliminar quick action"
        description={`¿Querés eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(undefined)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  )
}
