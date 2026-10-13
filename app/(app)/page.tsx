import { AlertTriangle } from 'lucide-react'

import { KpiCard } from '@/components/dashboard/kpi-card'
import { LeadsList } from '@/components/leads/leads-list'
import { obtenerLeads } from '@/lib/leads/datos'
import { calcularMetricas, formatoMonto, formatoPorcentaje } from '@/lib/metricas'

// Los estados dependen de la fecha de hoy: no prerenderizar en el build
export const dynamic = 'force-dynamic'

export default async function Home() {
  const leads = await obtenerLeads()
  const metricas = calcularMetricas(leads)

  return (
    <>
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
        {/* Sistema de diseño §5: los KPIs de dinero siempre arriba de la lista */}
        <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4" aria-label="Resumen">
          {/* Montos a ancho completo en mobile: a 32px no entran en media pantalla */}
          <KpiCard
            className="col-span-2 sm:col-span-1"
            label="Venta perdida este mes"
            valor={formatoMonto(metricas.ventaPerdida)}
            tono="perdida"
            icono={AlertTriangle}
          />
          <KpiCard
            className="col-span-2 sm:col-span-1"
            label="Venta convertida este mes"
            valor={formatoMonto(metricas.ventaConvertida)}
            tono="conversion"
          />
          <KpiCard label="Leads activos" valor={String(metricas.leadsActivos)} />
          <KpiCard label="Tasa de conversión" valor={formatoPorcentaje(metricas.tasaConversion)} />
        </section>

        <LeadsList leads={leads} />
      </main>
    </>
  )
}
