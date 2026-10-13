import type { LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TONOS = {
  neutro: 'text-foreground',
  perdida: 'text-danger',
  conversion: 'text-success',
}

// Sistema de diseño §4.2 — label chico arriba, número grande abajo
export function KpiCard({
  label,
  valor,
  tono = 'neutro',
  icono: Icono,
  className,
}: {
  className?: string
  label: string
  valor: string
  tono?: keyof typeof TONOS
  icono?: LucideIcon
}) {
  return (
    <Card className={cn('gap-2', className)}>
      <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
        {Icono && <Icono className={cn('size-3.5', TONOS[tono])} aria-hidden />}
        {label}
      </p>
      <p className={cn('text-kpi leading-none', TONOS[tono])}>{valor}</p>
    </Card>
  )
}
