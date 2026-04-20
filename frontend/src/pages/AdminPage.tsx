import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import type { UserSummary } from '@/services/admin.service'
import AppLayout from '@/components/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

const statusColors: Record<UserSummary['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AdminPage() {
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  })

  const approveMutation = useMutation({
    mutationFn: adminService.approveUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Usuario aprobado')
    },
    onError: () => toast.error('No se pudo aprobar'),
  })

  const rejectMutation = useMutation({
    mutationFn: adminService.rejectUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Usuario rechazado')
    },
    onError: () => toast.error('No se pudo rechazar'),
  })

  const pending = users?.filter(u => u.status === 'PENDING') ?? []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestioná los usuarios que quieren acceder a AutoDash
          </p>
        </div>

        {pending.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 p-4">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              {pending.length} usuario{pending.length !== 1 ? 's' : ''} esperando aprobación
            </p>
          </div>
        )}

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-32 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.role === 'ADMIN' ? 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : ''}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.status === 'PENDING' && (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => approveMutation.mutate(user.id)}
                            disabled={approveMutation.isPending}
                            title="Aprobar"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => rejectMutation.mutate(user.id)}
                            disabled={rejectMutation.isPending}
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
