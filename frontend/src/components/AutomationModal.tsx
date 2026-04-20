import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { automationsService } from '@/services/automations.service'
import type { Automation } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  triggerType: z.enum(['MANUAL', 'SCHEDULE', 'WEBHOOK']),
  triggerConfig: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  automation?: Automation
}

export default function AutomationModal({ open, onClose, automation }: Props) {
  const qc = useQueryClient()
  const isEdit = !!automation

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { triggerType: 'MANUAL' },
  })

  const triggerType = watch('triggerType')

  useEffect(() => {
    if (automation) {
      reset({
        name: automation.name,
        description: automation.description ?? '',
        triggerType: automation.triggerType,
        triggerConfig: automation.triggerConfig ?? '',
      })
    } else {
      reset({ name: '', description: '', triggerType: 'MANUAL', triggerConfig: '' })
    }
  }, [automation, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? automationsService.update(automation!.id, data)
        : automationsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] })
      toast.success(isEdit ? 'Automation actualizada' : 'Automation creada')
      onClose()
    },
    onError: () => toast.error('Algo salió mal'),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar automation' : 'Nueva automation'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Descripción</Label>
            <Textarea {...register('description')} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Tipo de trigger</Label>
            <Select value={triggerType} onValueChange={(v) => setValue('triggerType', v as FormData['triggerType'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="SCHEDULE">Schedule (cron)</SelectItem>
                <SelectItem value="WEBHOOK">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {triggerType === 'SCHEDULE' && (
            <div className="space-y-1">
              <Label>Expresión cron</Label>
              <Input {...register('triggerConfig')} placeholder='{"cron":"0 * * * *"}' />
            </div>
          )}
          {triggerType === 'WEBHOOK' && (
            <div className="space-y-1">
              <Label>Webhook URL</Label>
              <Input {...register('triggerConfig')} placeholder='{"url":"https://..."}' />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
