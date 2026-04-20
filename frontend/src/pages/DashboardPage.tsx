import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'

const statusColors: Record<AutomationStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-muted text-muted-foreground',
  RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const triggerLabels: Record<string, string> = {
  MANUAL: 'Manual',
  SCHEDULE: 'Schedule',
  WEBHOOK: 'Webhook',
}

export default function DashboardPage() {
  const navigate = useNavigate()
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

  const deleteMutation = useMutation({
    mutationFn: automationsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automation eliminada')
      setDeleteTarget(undefined)
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AutomationStatus }) =>
      automationsService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
    onError: () => toast.error('No se pudo cambiar el status'),
  })

  function toggleStatus(a: Automation) {
    if (a.status === 'RUNNING') return
    const next: AutomationStatus = a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    statusMutation.mutate({ id: a.id, status: next })
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Automations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data ? `${data.totalElements} automation${data.totalElements !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <Button onClick={() => { setEditing(undefined); setModalOpen(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Nueva automation
          </Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="max-w-xs"
          />
          <Select value={status} onValueChange={(v) => { setStatus(v as AutomationStatus | 'ALL'); setPage(0) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="RUNNING">Running</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nombre</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-28 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-muted-foreground">No hay automations todavía</p>
                    <Button variant="link" className="mt-1" onClick={() => { setEditing(undefined); setModalOpen(true) }}>
                      Crear la primera
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                data?.content.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <button
                        className="font-medium text-left hover:underline flex items-center gap-1 group"
                        onClick={() => navigate(`/automations/${a.id}`)}
                      >
                        {a.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </button>
                      {a.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{triggerLabels[a.triggerType] ?? a.triggerType}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[a.status]} variant="outline">
                          {a.status}
                        </Badge>
                        {a.status !== 'RUNNING' && (
                          <button
                            onClick={() => toggleStatus(a)}
                            className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                          >
                            {a.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setModalOpen(true) }} title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(a)} title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
        title="Eliminar automation"
        description={`¿Querés eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(undefined)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  )
}
