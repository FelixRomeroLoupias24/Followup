'use client'

import {
  GraficoConvertidos,
  GraficoEstados,
  GraficoLeadsNuevos,
  GraficoTasa,
  GraficoVentas,
} from '@/components/analitica/graficos'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { useDemo } from '@/components/demo/proveedor-demo'
import { formatoDias } from '@/lib/analitica/formato'
import { contarLeadsPorEstado } from '@/lib/analitica/leads-por-estado'
import {
  obtenerSerieMensual,
  obtenerSerieSemanal,
  obtenerTicketPromedio,
  obtenerTiempoPromedioConversion,
} from '@/lib/analitica/mock'
import { formatoMonto } from '@/lib/metricas'

// Los meses anteriores salen del histórico de ejemplo
// (lib/analitica/mock.ts); el mes actual y los estados, de los leads de la demo (con los cambios del visitante).
export default function DemoAnaliticasPage() {
  const { leads } = useDemo()
  const hoy = new Date()
  const serieMensual = obtenerSerieMensual(hoy, leads)
  const serieSemanal = obtenerSerieSemanal(hoy)
  const mesActual = serieMensual[serieMensual.length - 1]
  const ticketPromedio = obtenerTicketPromedio(serieMensual)
  const porEstado = contarLeadsPorEstado(leads, hoy)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground">Analíticas</h1>
        <p className="text-small text-muted-foreground">Cómo evolucionan tus ventas y tu seguimiento mes a mes.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3" aria-label="Resumen">
        <KpiCard className="col-span-2 lg:col-span-1" label="Ticket promedio" valor={formatoMonto(ticketPromedio)} />
        <KpiCard label="Leads convertidos este mes" valor={String(mesActual.leadsConvertidos)} tono="conversion" />
        <KpiCard label="Tiempo promedio hasta conversión" valor={formatoDias(obtenerTiempoPromedioConversion())} />
      </section>

      <section className="grid gap-6 md:gap-8 lg:grid-cols-2" aria-label="Gráficos">
        <GraficoVentas datos={serieMensual} />
        <GraficoTasa datos={serieMensual} />
        <GraficoEstados datos={porEstado} />
        <GraficoLeadsNuevos datos={serieSemanal} />
        <GraficoConvertidos datos={serieMensual} />
      </section>
    </main>
  )
}
