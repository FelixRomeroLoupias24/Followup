import { estadoVisual } from './leads/estado'
import type { Lead } from './leads/types'

export type Metricas = {
  ventaPerdida: number
  ventaConvertida: number
  leadsActivos: number
  tasaConversion: number
}

// Venta perdida = monto de leads perdidos o con recordatorio vencido.
// Todavía no filtra por mes: con datos reales se calcula sobre el mes en curso.
export function calcularMetricas(leads: Lead[], hoy = new Date()): Metricas {
  let ventaPerdida = 0
  let ventaConvertida = 0
  let leadsActivos = 0
  let convertidos = 0

  for (const lead of leads) {
    const estado = estadoVisual(lead, hoy)
    if (estado === 'convertido') {
      ventaConvertida += lead.monto ?? 0
      convertidos++
    } else if (estado === 'venta-perdida') {
      ventaPerdida += lead.monto ?? 0
    }
    if (lead.etapa !== 'convertido' && lead.etapa !== 'perdido') leadsActivos++
  }

  return {
    ventaPerdida,
    ventaConvertida,
    leadsActivos,
    tasaConversion: leads.length ? convertidos / leads.length : 0,
  }
}

export function formatoMonto(monto: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

// Ej. "1 oct, 10:30"
export function formatoFecha(fecha: Date): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(fecha)
}

export function formatoPorcentaje(valor: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 0 }).format(valor)
}
