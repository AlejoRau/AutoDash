import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { automationsService } from '@/services/automations.service'
import type { AutomationStatus } from '@/types'
import AppLayout from '@/components/AppLayout'
import AutomationModal from '@/components/AutomationModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, Play, Calendar, Webhook, MousePointerClick } from 'lucide-react'

const statusColors: Record<AutomationStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-muted text-muted-foreground',
  RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const triggerIcons = {
  MANUAL: MousePointerClick,
  SCHEDULE: Calendar,
  WEBHOOK: Webhook,
}

const triggerDescriptions: Record<string, string> = {
  MANUAL: 'Se ejecuta manualmente al hacer click en Ejecutar.',
  SCHEDULE: 'Se ejecuta automáticamente según la expresión cron configurada.',
  WEBHOOK: 'Se dispara al recibir un request HTTP en su endpoint.',
}

export default function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: automation, isLoading } = useQuery({
    queryKey: ['automation', id],
    queryFn: () => automationsService.findById(Number(id)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: AutomationStatus }) =>
      automationsService.updateStatus(Number(id), status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation', id] })
      qc.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Status actualizado')
    },
    onError: () => toast.error('No se pudo cambiar el status'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => automationsService.delete(Number(id)),
    onSuccess: () => {
      toast.success('Automation eliminada')
      navigate('/dashboard')
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  function toggleStatus() {
    if (!automation || automation.status === 'RUNNING') return
    const next: AutomationStatus = automation.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    statusMutation.mutate({ status: next })
  }

  const TriggerIcon = automation ? (triggerIcons[automation.triggerType] ?? MousePointerClick) : MousePointerClick

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    )
  }

  if (!automation) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Automation no encontrada.</p>
          <Button variant="link" onClick={() => navigate('/dashboard')}>Volver al dashboard</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium truncate">{automation.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">{automation.name}</h1>
            {automation.description && (
              <p className="text-muted-foreground mt-1">{automation.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={statusColors[automation.status]} variant="outline">
                {automation.status}
              </Badge>
              {automation.status !== 'RUNNING' && (
                <div>
                  <Button
                    size="sm"
                    variant={automation.status === 'ACTIVE' ? 'outline' : 'default'}
                    onClick={toggleStatus}
                    disabled={statusMutation.isPending}
                    className="w-full"
                  >
                    {statusMutation.isPending
                      ? 'Cambiando...'
                      : automation.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trigger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <TriggerIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{automation.triggerType}</span>
              </div>
              <p className="text-xs text-muted-foreground">{triggerDescriptions[automation.triggerType]}</p>
            </CardContent>
          </Card>
        </div>

        {automation.triggerConfig && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Configuración del trigger</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
                {(() => {
                  try { return JSON.stringify(JSON.parse(automation.triggerConfig!), null, 2) }
                  catch { return automation.triggerConfig }
                })()}
              </pre>
            </CardContent>
          </Card>
        )}

        {automation.triggerType === 'MANUAL' && (
          <Card className="border-dashed">
            <CardContent className="py-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Ejecutar manualmente</p>
                <p className="text-xs text-muted-foreground mt-0.5">Disponible en la próxima fase del proyecto.</p>
              </div>
              <Button disabled size="sm">
                <Play className="w-3.5 h-3.5 mr-1" /> Ejecutar
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Creado</p>
                <p>{new Date(automation.createdAt).toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Última actualización</p>
                <p>{new Date(automation.updatedAt).toLocaleString('es-AR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AutomationModal open={modalOpen} onClose={() => setModalOpen(false)} automation={automation} />
      <DeleteConfirmDialog
        open={deleteOpen}
        title="Eliminar automation"
        description={`¿Querés eliminar "${automation.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  )
}
