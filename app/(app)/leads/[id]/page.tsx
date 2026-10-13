import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

import { LeadDetalle } from '@/components/leads/lead-detalle'
import { LeadHistorial } from '@/components/leads/lead-historial'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { obtenerCuenta } from '@/lib/cuenta/datos'
import { obtenerInteraccionesDeLead, obtenerLeadPorId } from '@/lib/leads/datos'
import { obtenerPlantillas } from '@/lib/plantillas/datos'
import { cn } from '@/lib/utils'

// Los estados dependen de la fecha de hoy: no prerenderizar en el build
export const dynamic = 'force-dynamic'

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // La configuración (días sin seguimiento) y las plantillas no dependen del lead: se piden en paralelo
  const [lead, cuenta, plantillas] = await Promise.all([obtenerLeadPorId(id), obtenerCuenta(), obtenerPlantillas()])
  // El historial solo se pide si el lead existe (un id inválido no genera una segunda consulta con error)
  const interacciones = lead ? await obtenerInteraccionesDeLead(lead.id) : []

  return (
    <>
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:gap-6 md:px-8 md:py-8">
        <Link href="/" className={cn(buttonVariants({ variant: 'link' }), 'self-start px-0')}>
          <ArrowLeft aria-hidden />
          Volver a mis leads
        </Link>

        {lead ? (
          <LeadDetalle lead={lead} diasSinSeguimiento={cuenta.diasSinSeguimiento}
            plantillas={plantillas}
            historial={<LeadHistorial interacciones={interacciones} />} />
        ) : (
          <Card className="items-center py-12 text-center shadow-sm">
            <span className="grid size-12 place-items-center rounded-full bg-background text-secondary">
              <SearchX className="size-6" aria-hidden />
            </span>
            <h1 className="text-h2 text-foreground">Lead no encontrado</h1>
            <p className="text-body text-muted-foreground">Puede que se haya borrado o que el link esté mal.</p>
            <Link href="/" className={buttonVariants()}>
              Volver a mis leads
            </Link>
          </Card>
        )}
      </main>
    </>
  )
}
