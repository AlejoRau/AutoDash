import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function DeleteConfirmDialog({ open, title, description, onConfirm, onCancel, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title ?? '¿Estás seguro?'}</DialogTitle>
          <DialogDescription>
            {description ?? 'Esta acción no se puede deshacer.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
