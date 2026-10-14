'use client'

import { useState, type ReactNode } from 'react'
import { AlertTriangle, MessageSquareQuote, Phone } from 'lucide-react'

import { GeneradorMensaje } from '@/components/leads/generador-mensaje'
import { LeadAvatar } from '@/components/leads/lead-avatar'
import { ESTILO_ESTADO, LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import { useAcciones } from '@/lib/datos/acciones'
import { conEtapa, ETAPAS, estadoVisual, textoProximoContacto, textoUltimoContacto } from '@/lib/leads/estado'
import type { Etapa, Lead } from '@/lib/leads/types'
import type { Plantilla } from '@/lib/plantillas/plantilla'
import { cn } from '@/lib/utils'

// Ficha del lead: encabezado, datos de la consulta, generador IA y el historial (que llega ya renderizado)
export function LeadDetalle({
  lead: leadServidor,
  historial,
  diasSinSeguimiento,
  plantillas,
}: {
  lead: Lead
  historial: ReactNode
  diasSinSeguimiento: number
  plantillas: Plantilla[]
}) {
  const acciones = useAcciones()
  // Solo se guarda la etapa optimista, no una copia del lead: así, después de guardar, se ve el lead tal como
  // quedó en ProveedorDemo (con el recordatorio limpio si se cerró). Un useState(lead) ignoraría los props nuevos.
  const [etapaOptimista, setEtapaOptimista] = useState<Etapa | null>(null)
  const [guardandoEtapa, setGuardandoEtapa] = useState(false)
  const [errorEtapa, setErrorEtapa] = useState<string | null>(null)

  const lead = etapaOptimista ? conEtapa(leadServidor, etapaOptimista) : leadServidor
  const hoy = new Date()
  const estado = estadoVisual(lead, hoy)
  const proximo = textoProximoContacto(lead, hoy)

  async function cambiarEtapa(etapa: Etapa) {
    const etapaAnterior = lead.etapa
    // Optimista: el select, el badge y el próximo contacto cambian ya, sin esperar a que se guarde
    setEtapaOptimista(etapa)
    setGuardandoEtapa(true)
    setErrorEtapa(null)

    // ProveedorDemo hace el resto: limpia el próximo contacto al cerrar y registra el cambio en el historial
    const ok = await acciones.cambiarEtapa(lead.id, etapa)
    setGuardandoEtapa(false)

    if (!ok) {
      setErrorEtapa('No se pudo guardar el cambio de etapa.')
      // Volver a la etapa anterior (la que sigue teniendo el lead guardado)
      setEtapaOptimista(etapaAnterior === leadServidor.etapa ? null : etapaAnterior)
      return
    }

    // El lead guardado ya llega por props con la etapa nueva (y la campanita se actualiza sola)
    setEtapaOptimista(null)
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Card className="shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <LeadAvatar nombre={lead.nombre} tamano="lg" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="truncate text-foreground">{lead.nombre}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-small text-muted-foreground">
                <Phone className="size-3.5 text-secondary" aria-hidden />
                {lead.telefono}
              </span>
              <LeadStatusBadge estado={estado} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:items-end">
          <label htmlFor="etapa-lead" className="text-caption text-muted-foreground">
            Etapa
          </label>
          {/* Deshabilitado mientras se guarda: dos cambios no se pisan */}
          <NativeSelect
            id="etapa-lead"
            value={lead.etapa}
            onChange={(e) => cambiarEtapa(e.target.value as Etapa)}
            disabled={guardandoEtapa}
            aria-describedby={errorEtapa ? 'etapa-error' : undefined}
            className="w-full disabled:opacity-60 sm:w-48"
          >
            {ETAPAS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.texto}
              </option>
            ))}
          </NativeSelect>
          {errorEtapa && (
            <p
              id="etapa-error"
              role="alert"
              className="flex items-center gap-1.5 rounded-lg bg-estado-perdido px-2.5 py-1.5 text-caption text-estado-perdido-foreground"
            >
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              {errorEtapa}
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 md:gap-8 lg:col-span-2">
          <Card className="gap-3 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareQuote className="size-5 text-secondary" aria-hidden />
                Consulta
              </CardTitle>
            </CardHeader>
            <p className="text-body text-foreground">{lead.consulta}</p>
            <dl className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4">
              <div className="flex flex-col gap-1">
                <dt className="text-caption text-muted-foreground">Último contacto</dt>
                <dd className="text-body font-medium text-foreground">{textoUltimoContacto(lead, hoy)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-caption text-muted-foreground">Próximo contacto</dt>
                <dd
                  className={cn(
                    'text-body font-medium',
                    proximo ? ESTILO_ESTADO[estado].proximo : 'text-muted-foreground',
                  )}
                >
                  {proximo ?? '—'}
                </dd>
              </div>
            </dl>
          </Card>

          <GeneradorMensaje lead={lead} diasSinSeguimiento={diasSinSeguimiento} plantillas={plantillas} />
        </div>

        {historial}
      </div>
    </div>
  )
}
