'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

import { LeadAvatar } from '@/components/leads/lead-avatar'
import { LeadStatusBadge, ESTILO_ESTADO } from '@/components/leads/lead-status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import {
  ESTADOS,
  estadoVisual,
  ordenarPorUrgencia,
  textoProximoContacto,
  textoUltimoContacto,
  type EstadoVisual,
} from '@/lib/leads/estado'
import type { Lead } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

type Filtro = 'todos' | EstadoVisual

export function LeadsList({ leads }: { leads: Lead[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const hoy = new Date()

  const filas = ordenarPorUrgencia(leads, hoy).map((lead) => ({
    lead,
    estado: estadoVisual(lead, hoy),
    ultimo: textoUltimoContacto(lead, hoy),
    proximo: textoProximoContacto(lead, hoy),
  }))
  const visibles = filtro === 'todos' ? filas : filas.filter((f) => f.estado === filtro)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-foreground">Mis leads</h1>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <NativeSelect
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as Filtro)}
            aria-label="Filtrar por estado"
            className="min-w-0 flex-1 sm:flex-none"
          >
            <option value="todos">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.texto}
              </option>
            ))}
          </NativeSelect>
          <Link href="/leads/nuevo" className={cn(buttonVariants())}>
            <Plus aria-hidden />
            Nuevo lead
          </Link>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-background text-secondary">
            <Users className="size-6" aria-hidden />
          </span>
          <p className="text-body text-foreground">Todavía no cargaste ningún lead</p>
          <Link href="/leads/nuevo" className={cn(buttonVariants())}>
            <Plus aria-hidden />
            Agregar mi primer lead
          </Link>
        </Card>
      ) : visibles.length === 0 ? (
        <Card className="items-center py-10 text-center">
          <p className="text-body text-muted-foreground">No hay leads con ese filtro</p>
          <Button variant="secondary" onClick={() => setFiltro('todos')}>
            Limpiar filtro
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop: tabla desde md; si aun así no entra, scrollea dentro de la card (nunca la página) */}
          <Card className="hidden min-w-0 overflow-x-auto p-0 md:flex">
            <table className="w-full text-left">
              <thead className="border-b border-border text-caption font-medium whitespace-nowrap text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 pl-5 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Consulta</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="hidden px-4 py-3 font-medium xl:table-cell">Último contacto</th>
                  <th className="px-4 py-3 font-medium">Próximo contacto</th>
                  <th className="py-3 pr-5 pl-4">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(({ lead, estado, ultimo, proximo }) => (
                  <tr key={lead.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-accent">
                    <td className={cn('border-l-3 py-3 pr-4 pl-4.5', ESTILO_ESTADO[estado].acento)}>
                      <div className="flex items-center gap-3">
                        <LeadAvatar nombre={lead.nombre} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{lead.nombre}</p>
                          <p className="text-caption whitespace-nowrap text-muted-foreground">{lead.telefono}</p>
                        </div>
                      </div>
                    </td>
                    {/* w-full + max-w-0: la consulta ocupa el espacio que sobra y se trunca */}
                    <td className="w-full max-w-0 px-4 py-3">
                      <p className="truncate text-foreground" title={lead.consulta}>
                        {lead.consulta}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge estado={estado} />
                    </td>
                    <td className="hidden px-4 py-3 text-small whitespace-nowrap text-muted-foreground xl:table-cell">{ultimo}</td>
                    <td
                      className={cn(
                        'px-4 py-3 text-small whitespace-nowrap',
                        proximo ? ESTILO_ESTADO[estado].proximo : 'text-muted-foreground',
                      )}
                    >
                      {proximo ?? '—'}
                    </td>
                    <td className="py-3 pr-5 pl-4 text-right">
                      <Link href={`/leads/${lead.id}`} className={cn(buttonVariants({ variant: 'secondary' }))}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile: cards apiladas */}
          <ul className="flex flex-col gap-3 md:hidden">
            {visibles.map(({ lead, estado, ultimo, proximo }) => (
              <li key={lead.id}>
                <Card className={cn('gap-3 border-l-3 p-4', ESTILO_ESTADO[estado].acento)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <LeadAvatar nombre={lead.nombre} />
                      <p className="truncate font-medium text-foreground">{lead.nombre}</p>
                    </div>
                    <LeadStatusBadge estado={estado} />
                  </div>
                  <p className="truncate text-foreground">{lead.consulta}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-small">
                      <p className="text-muted-foreground">Último: {ultimo}</p>
                      {proximo && <p className={ESTILO_ESTADO[estado].proximo}>Próximo: {proximo}</p>}
                    </div>
                    <Link href={`/leads/${lead.id}`} className={cn(buttonVariants({ variant: 'secondary' }))}>
                      Ver
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
