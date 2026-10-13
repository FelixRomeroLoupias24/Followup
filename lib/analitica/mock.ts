import { obtenerLeadsMock } from '@/lib/leads/mock'
import { calcularMetricas } from '@/lib/metricas'

export type PuntoMensual = {
  mes: string
  ventaPerdida: number
  ventaConvertida: number
  tasaConversion: number
  leadsConvertidos: number
}

export type PuntoSemanal = { semana: string; leadsNuevos: number }

// Los 5 meses anteriores al actual, del más viejo al más reciente. Montos en el mismo orden de magnitud
// que el Dashboard (ticket ≈ $ 94.000, como el lead convertido del mock) y tasa = convertidos ÷ leads del mes.
// TODO: conectar a backend — reemplazar por consultas reales a Supabase (agrupar leads por mes de cerrado_at)
const HISTORICO = [
  { ventaPerdida: 410000, ventaConvertida: 180000, leadsConvertidos: 2, leadsDelMes: 20 },
  { ventaPerdida: 380000, ventaConvertida: 265000, leadsConvertidos: 3, leadsDelMes: 21 },
  { ventaPerdida: 455000, ventaConvertida: 210000, leadsConvertidos: 2, leadsDelMes: 19 },
  { ventaPerdida: 300000, ventaConvertida: 360000, leadsConvertidos: 4, leadsDelMes: 22 },
  { ventaPerdida: 270000, ventaConvertida: 395000, leadsConvertidos: 4, leadsDelMes: 21 },
]

// TODO: conectar a backend — reemplazar por consultas reales a Supabase (leads por semana de created_at)
const LEADS_NUEVOS_POR_SEMANA = [5, 4, 6, 3, 5, 7, 4, 3]

const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'short' })
const fmtDia = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
const sinPunto = (s: string) => s.replace('.', '')

// "oct" → "Oct"
function nombreMes(desplazamiento: number, hoy: Date): string {
  const texto = sinPunto(fmtMes.format(new Date(hoy.getFullYear(), hoy.getMonth() + desplazamiento, 1)))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Últimos 6 meses. El mes actual sale de los mismos leads que el Dashboard, así ambos coinciden.
export function obtenerSerieMensual(hoy = new Date()): PuntoMensual[] {
  const leads = obtenerLeadsMock()
  const actual = calcularMetricas(leads, hoy)

  const historico = HISTORICO.map((m, i) => ({
    mes: nombreMes(i - HISTORICO.length, hoy),
    ventaPerdida: m.ventaPerdida,
    ventaConvertida: m.ventaConvertida,
    tasaConversion: m.leadsConvertidos / m.leadsDelMes,
    leadsConvertidos: m.leadsConvertidos,
  }))

  return [
    ...historico,
    {
      mes: nombreMes(0, hoy),
      ventaPerdida: actual.ventaPerdida,
      ventaConvertida: actual.ventaConvertida,
      tasaConversion: actual.tasaConversion,
      leadsConvertidos: leads.filter((l) => l.etapa === 'convertido').length,
    },
  ]
}

// Últimas 8 semanas (lunes a domingo), etiquetadas por el lunes de cada una: "8 sep"
export function obtenerSerieSemanal(hoy = new Date()): PuntoSemanal[] {
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7))
  return LEADS_NUEVOS_POR_SEMANA.map((leadsNuevos, i) => {
    const inicio = new Date(lunes)
    inicio.setDate(lunes.getDate() - 7 * (LEADS_NUEVOS_POR_SEMANA.length - 1 - i))
    return { semana: sinPunto(fmtDia.format(inicio)), leadsNuevos }
  })
}

// Monto total convertido ÷ cantidad de conversiones, sobre los últimos 6 meses
export function obtenerTicketPromedio(hoy = new Date()): number {
  const serie = obtenerSerieMensual(hoy)
  const conversiones = serie.reduce((total, m) => total + m.leadsConvertidos, 0)
  const monto = serie.reduce((total, m) => total + m.ventaConvertida, 0)
  return conversiones ? monto / conversiones : 0
}

// Días promedio entre que entra un lead y se convierte
// TODO: conectar a backend — promedio de (cerrado_at - created_at) de los leads convertidos
export function obtenerTiempoPromedioConversion(): number {
  return 4.5
}
