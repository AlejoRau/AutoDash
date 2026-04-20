import { useQuery } from '@tanstack/react-query'
import { n8nService } from '@/services/n8n.service'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { N8nWorkflow } from '@/types'

const statusColors: Record<string, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  waiting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function N8nExecutionsDialog({
  workflow,
  onClose,
}: {
  workflow: N8nWorkflow
  onClose: () => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['n8n-executions', workflow.id],
    queryFn: () => n8nService.getExecutions(workflow.id),
  })

  const executions = data?.data ?? []

  const stats = {
    total: executions.length,
    success: executions.filter((e) => e.status === 'success').length,
    error: executions.filter((e) => e.status === 'error').length,
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ejecuciones — {workflow.name}</DialogTitle>
        </DialogHeader>

        {!isLoading && executions.length > 0 && (
          <div className="flex gap-4 text-sm">
            <div className="rounded-md bg-muted px-3 py-2">
              <span className="text-muted-foreground">Total </span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-3 py-2">
              <span className="text-muted-foreground">Exitosas </span>
              <span className="font-semibold text-green-700 dark:text-green-400">{stats.success}</span>
            </div>
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2">
              <span className="text-muted-foreground">Errores </span>
              <span className="font-semibold text-red-700 dark:text-red-400">{stats.error}</span>
            </div>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Estado</th>
                <th className="text-left px-4 py-2 font-medium">Inicio</th>
                <th className="text-left px-4 py-2 font-medium">Duración</th>
                <th className="text-left px-4 py-2 font-medium">Modo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-2"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Sin ejecuciones registradas
                  </td>
                </tr>
              ) : (
                executions.map((ex) => {
                  const duration = ex.stoppedAt
                    ? Math.round((new Date(ex.stoppedAt).getTime() - new Date(ex.startedAt).getTime()) / 1000)
                    : null
                  return (
                    <tr key={ex.id} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-2">
                        <Badge variant="outline" className={statusColors[ex.status] ?? ''}>
                          {ex.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(ex.startedAt).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {duration !== null ? `${duration}s` : '—'}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{ex.mode}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
