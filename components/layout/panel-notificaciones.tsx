'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Popover } from '@base-ui/react/popover'
import { Bell, BellOff } from 'lucide-react'

import { LeadAvatar } from '@/components/leads/lead-avatar'
import { ESTILO_ESTADO } from '@/components/leads/lead-status-badge'
import type { EstadoVisual } from '@/lib/leads/estado'
import { cn } from '@/lib/utils'

// Lo que necesita el panel de cada lead; lo arma el servidor (app/layout.tsx) con estadoVisual y textoProximoContacto
export type Recordatorio = { id: string; nombre: string; estado: EstadoVisual; texto: string }

// Campanita + panel desplegable. Base UI se encarga de cerrar al clickear afuera o con Escape;
// al elegir un lead se cierra a mano antes de navegar.
export function PanelNotificaciones({ recordatorios }: { recordatorios: Recordatorio[] }) {
  const [abierto, setAbierto] = useState(false)
  const cantidad = recordatorios.length

  return (
    <Popover.Root open={abierto} onOpenChange={setAbierto}>
      <Popover.Trigger
        className="relative ml-auto grid size-9 place-items-center rounded-lg text-secondary hover:bg-accent data-popup-open:bg-accent"
        aria-label={cantidad ? `Recordatorios: ${cantidad} pendientes` : 'Recordatorios: ninguno pendiente'}
      >
        <Bell className="size-5" aria-hidden />
        {cantidad > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-danger px-1 text-caption leading-4.5 font-medium text-primary-foreground">
            {cantidad}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} collisionPadding={16} className="z-50">
          <Popover.Popup className="w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-sm outline-none">
            <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3">
              <Popover.Title className="text-body font-medium text-foreground">Recordatorios</Popover.Title>
              {cantidad > 0 && <span className="text-caption text-muted-foreground">{cantidad} para atender</span>}
            </div>

            {cantidad === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <BellOff className="size-5 text-secondary" aria-hidden />
                <p className="text-small text-muted-foreground">No tenés recordatorios pendientes</p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1">
                {recordatorios.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/leads/${r.id}`}
                      onClick={() => setAbierto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors outline-none hover:bg-accent focus-visible:bg-accent"
                    >
                      <LeadAvatar nombre={r.nombre} />
                      <span className="min-w-0 flex-1 truncate text-body text-foreground">{r.nombre}</span>
                      <span className={cn('shrink-0 text-small', ESTILO_ESTADO[r.estado].proximo)}>{r.texto}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
