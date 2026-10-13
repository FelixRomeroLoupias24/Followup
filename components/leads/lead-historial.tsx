import { ArrowRightLeft, MessageCircle, Send, StickyNote, type LucideIcon } from 'lucide-react'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { textoHaceDias } from '@/lib/leads/estado'
import type { Interaccion, TipoInteraccion } from '@/lib/leads/types'
import { formatoFecha } from '@/lib/metricas'
import { cn } from '@/lib/utils'

// Punto de la línea de tiempo: verde primario lo que mandó el negocio, gris secundario lo que respondió
// el lead; notas y cambios de etapa en el mismo gris pero huecos (sin agregar un tercer color).
const TIPOS: Record<TipoInteraccion, { texto: string; icono: LucideIcon; punto: string }> = {
  mensaje_enviado: { texto: 'Mensaje enviado', icono: Send, punto: 'bg-primary text-primary-foreground' },
  respuesta_recibida: { texto: 'Respuesta recibida', icono: MessageCircle, punto: 'bg-secondary text-primary-foreground' },
  nota: { texto: 'Nota', icono: StickyNote, punto: 'border-2 border-secondary bg-card text-secondary' },
  cambio_etapa: { texto: 'Cambio de etapa', icono: ArrowRightLeft, punto: 'border-2 border-secondary bg-card text-secondary' },
}

// Recibe las interacciones ya ordenadas (más reciente primero)
export function LeadHistorial({ interacciones }: { interacciones: Interaccion[] }) {
  return (
    <Card className="gap-4 shadow-sm lg:self-start">
      <CardHeader>
        <CardTitle>Historial</CardTitle>
      </CardHeader>

      {interacciones.length === 0 ? (
        <p className="text-small text-muted-foreground">Todavía no hay movimientos con este lead.</p>
      ) : (
        <ol className="flex flex-col">
          {interacciones.map((i, indice) => {
            const { texto, icono: Icono, punto } = TIPOS[i.tipo]
            const esUltimo = indice === interacciones.length - 1
            return (
              <li key={i.id} className={cn('relative flex gap-3', !esUltimo && 'pb-5')}>
                {!esUltimo && <span className="absolute top-8 bottom-0 left-3.5 w-px bg-secondary/25" aria-hidden />}
                <span className={cn('relative grid size-7 shrink-0 place-items-center rounded-full', punto)}>
                  <Icono className="size-3.5" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-medium text-foreground">{texto}</p>
                    <time
                      dateTime={i.fecha.toISOString()}
                      title={formatoFecha(i.fecha)}
                      className="text-caption text-muted-foreground"
                    >
                      {textoHaceDias(i.fecha)}
                    </time>
                  </div>
                  {i.nota && <p className="text-small text-muted-foreground">{i.nota}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}
