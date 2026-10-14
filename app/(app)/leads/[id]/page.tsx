'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, SearchX } from 'lucide-react'

import { useDemo } from '@/components/demo/proveedor-demo'
import { LeadDetalle } from '@/components/leads/lead-detalle'
import { LeadHistorial } from '@/components/leads/lead-historial'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Ficha del lead, con los datos de ejemplo en memoria (ProveedorDemo)
export default function DemoLeadPage() {
  const { id } = useParams<{ id: string }>()
  const { leads, interacciones, cuenta, plantillas } = useDemo()
  const lead = leads.find((l) => l.id === id)
  const historial = interacciones
    .filter((i) => i.leadId === id)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:gap-6 md:px-8 md:py-8">
      <Link href="/" className={cn(buttonVariants({ variant: 'link' }), 'self-start px-0')}>
        <ArrowLeft aria-hidden />
        Volver a mis leads
      </Link>

      {lead ? (
        <LeadDetalle
          lead={lead}
          diasSinSeguimiento={cuenta.diasSinSeguimiento}
          plantillas={plantillas}
          historial={<LeadHistorial interacciones={historial} />}
        />
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
  )
}
