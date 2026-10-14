'use client'

import { AlertTriangle } from 'lucide-react'

import { useDemo } from '@/components/demo/proveedor-demo'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { LeadsList } from '@/components/leads/leads-list'
import { calcularMetricas, formatoMonto, formatoPorcentaje } from '@/lib/metricas'

// Dashboard: KPIs de dinero arriba de la lista (sistema de diseño §5), con los leads de ejemplo en memoria
export default function DemoDashboard() {
  const { leads } = useDemo()
  const metricas = calcularMetricas(leads)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4" aria-label="Resumen">
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
  )
}
