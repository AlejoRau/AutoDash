import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { n8nService } from '@/services/n8n.service'
import { useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Play, RefreshCw, Settings, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { N8nWorkflow } from '@/types'
import N8nExecutionsDialog from '@/components/N8nExecutionsDialog'

export default function N8nPage() {
  const { user, login, token } = useAuth()
  const qc = useQueryClient()
  const [showSettings, setShowSettings] = useState(!user?.n8nConfigured)
  const [n8nUrl, setN8nUrl] = useState('')
  const [n8nApiKey, setN8nApiKey] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null)

  const { data: workflowsData, isLoading, refetch } = useQuery({
    queryKey: ['n8n-workflows'],
    queryFn: n8nService.getWorkflows,
    enabled: !!user?.n8nConfigured,
    retry: false,
  })

  const saveMutation = useMutation({
    mutationFn: n8nService.saveSettings,
    onSuccess: async () => {
      toast.success('Credenciales guardadas')
      const { authService } = await import('@/services/auth.service')
      const profile = await authService.me()
      login(token!, profile)
      setShowSettings(false)
      qc.invalidateQueries({ queryKey: ['n8n-workflows'] })
    },
    onError: () => toast.error('No se pudo guardar'),
  })

  const activateMutation = useMutation({
    mutationFn: n8nService.activate,
    onSuccess: () => { toast.success('Workflow activado'); qc.invalidateQueries({ queryKey: ['n8n-workflows'] }) },
    onError: () => toast.error('Error al activar'),
  })

  const deactivateMutation = useMutation({
    mutationFn: n8nService.deactivate,
    onSuccess: () => { toast.success('Workflow desactivado'); qc.invalidateQueries({ queryKey: ['n8n-workflows'] }) },
    onError: () => toast.error('Error al desactivar'),
  })

  const runMutation = useMutation({
    mutationFn: (id: string) => n8nService.run(id),
    onSuccess: () => toast.success('Workflow ejecutado'),
    onError: () => toast.error('Error al ejecutar'),
  })

  const workflows = workflowsData?.data ?? []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">n8n Workflows</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Controlá tus workflows de n8n desde AutoDash
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={!user?.n8nConfigured}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="w-4 h-4 mr-1.5" />
              Configurar
            </Button>
          </div>
        </div>

        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Credenciales de n8n</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>URL de tu instancia n8n</Label>
                <Input
                  placeholder="https://tu-n8n.ejemplo.com"
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="n8n_api_..."
                  value={n8nApiKey}
                  onChange={(e) => setN8nApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  En n8n: Settings → API → Create an API key
                </p>
              </div>
              <Button
                onClick={() => saveMutation.mutate({ n8nUrl, n8nApiKey })}
                disabled={saveMutation.isPending || !n8nUrl || !n8nApiKey}
              >
                Guardar
              </Button>
            </CardContent>
          </Card>
        )}

        {!user?.n8nConfigured && !showSettings && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Configurá tus credenciales de n8n para ver tus workflows</p>
          </div>
        )}

        {user?.n8nConfigured && (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Actualizado</th>
                  <th className="text-right px-4 py-3 font-medium w-48">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : workflows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No hay workflows en tu instancia de n8n
                    </td>
                  </tr>
                ) : (
                  workflows.map((wf) => (
                    <tr key={wf.id} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{wf.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={wf.active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'}>
                          {wf.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(wf.updatedAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost" size="icon"
                            title="Ver ejecuciones"
                            onClick={() => setSelectedWorkflow(wf)}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            title="Ejecutar ahora"
                            onClick={() => runMutation.mutate(wf.id)}
                            disabled={runMutation.isPending}
                          >
                            <Play className="w-4 h-4 text-blue-600" />
                          </Button>
                          {wf.active ? (
                            <Button
                              variant="ghost" size="icon"
                              title="Desactivar"
                              onClick={() => deactivateMutation.mutate(wf.id)}
                              disabled={deactivateMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost" size="icon"
                              title="Activar"
                              onClick={() => activateMutation.mutate(wf.id)}
                              disabled={activateMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedWorkflow && (
        <N8nExecutionsDialog
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
        />
      )}
    </AppLayout>
  )
}
