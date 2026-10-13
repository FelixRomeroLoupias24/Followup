import { Badge } from '@/components/ui/badge'
import { ESTADOS, type EstadoVisual } from '@/lib/leads/estado'

// Único lugar donde un estado se traduce a color (sistema de diseño §1 y §4.1):
// badge = colores de la tabla 4.1; acento = borde izquierdo de la fila/card.
export const ESTILO_ESTADO: Record<EstadoVisual, { badge: string; acento: string; proximo: string }> = {
  'venta-perdida': {
    badge: 'bg-estado-perdido text-estado-perdido-foreground',
    acento: 'border-l-danger',
    proximo: 'text-danger font-medium',
  },
  'contactar-hoy': {
    badge: 'bg-estado-hoy text-estado-hoy-foreground',
    acento: 'border-l-warning',
    proximo: 'text-warning font-medium',
  },
  convertido: {
    badge: 'bg-estado-convertido text-estado-convertido-foreground',
    acento: 'border-l-success',
    proximo: 'text-muted-foreground',
  },
  nuevo: {
    badge: 'bg-estado-nuevo text-estado-nuevo-foreground',
    acento: 'border-l-transparent',
    proximo: 'text-muted-foreground',
  },
  'en-seguimiento': {
    badge: 'bg-estado-seguimiento text-estado-seguimiento-foreground',
    // Azul pedido según mockup-leads.png (el sistema de diseño §1 decía gris neutro)
    acento: 'border-l-estado-seguimiento-foreground',
    proximo: 'text-muted-foreground',
  },
}

// La forma de píldora (§4.1) la pone Badge; acá solo el color del estado
export function LeadStatusBadge({ estado }: { estado: EstadoVisual }) {
  const texto = ESTADOS.find((e) => e.valor === estado)?.texto
  return <Badge className={ESTILO_ESTADO[estado].badge}>{texto}</Badge>
}
