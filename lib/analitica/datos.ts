import { cache } from 'react'

import { obtenerLeads } from '@/lib/leads/datos'
import type { Etapa } from '@/lib/leads/types'
import { calcularMetricas } from '@/lib/metricas'
import { crearClienteServidor } from '@/lib/supabase/server'

import type { PuntoMensual, PuntoSemanal } from './mock'

// Analíticas con datos reales. Los meses y semanas sin movimiento van en cero: en una cuenta nueva
// el historial se va llenando solo con el uso (no se rellena nada).

type LeadAnalitica = { etapa: Etapa; monto: number; creadoEn: Date; cerradoEn: Date | null }

type FilaLeadAnalitica = {
  etapa: Etapa
  monto: number | string | null
  created_at: string
  cerrado_at: string | null
}

// cache(): las tres funciones de abajo la usan en la misma página, pero la consulta se hace una sola vez por request
const obtenerLeadsParaAnalitica = cache(async (): Promise<LeadAnalitica[]> => {
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.from('leads').select('etapa, monto, created_at, cerrado_at')
  if (error) {
    console.error('No se pudieron leer los leads para analíticas:', error.message)
    return []
  }
  return (data as FilaLeadAnalitica[]).map((fila) => ({
    etapa: fila.etapa,
    // numeric llega como string ("38000.00")
    monto: fila.monto === null ? 0 : Number(fila.monto),
    // timestamptz: new Date() lo interpreta bien (no es como proximo_contacto, que es solo fecha)
    creadoEn: new Date(fila.created_at),
    cerradoEn: fila.cerrado_at ? new Date(fila.cerrado_at) : null,
  }))
})

// Formatos de fecha (copiados de mock.ts para no depender de ese archivo)
const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'short' })
const fmtDia = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
const sinPunto = (s: string) => s.replace('.', '')

// "oct" → "Oct"
function nombreMes(desplazamiento: number, hoy: Date): string {
  const texto = sinPunto(fmtMes.format(new Date(hoy.getFullYear(), hoy.getMonth() + desplazamiento, 1)))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Mismo mes calendario (en la zona horaria del servidor)
function mismoMes(fecha: Date, mes: Date): boolean {
  return fecha.getFullYear() === mes.getFullYear() && fecha.getMonth() === mes.getMonth()
}

const sumarMontos = (leads: LeadAnalitica[]) => leads.reduce((total, l) => total + l.monto, 0)

// Últimos 6 meses (5 anteriores + el actual), del más viejo al más reciente
export async function obtenerSerieMensual(hoy = new Date()): Promise<PuntoMensual[]> {
  const [leads, leadsDashboard] = await Promise.all([obtenerLeadsParaAnalitica(), obtenerLeads()])

  return Array.from({ length: 6 }, (_, i) => {
    const desplazamiento = i - 5
    const mes = new Date(hoy.getFullYear(), hoy.getMonth() + desplazamiento, 1)

    const creadosEnElMes = leads.filter((l) => mismoMes(l.creadoEn, mes))
    // Ventas por mes de cierre, sin importar cuándo entró el lead (backend/modelo-y-api.md §3.8): si se filtrara
    // a los creados en el mes, un lead creado en septiembre y convertido en octubre no contaría en ningún mes
    const cerradosEnElMes = leads.filter((l) => l.cerradoEn && mismoMes(l.cerradoEn, mes))
    const convertidosEnElMes = cerradosEnElMes.filter((l) => l.etapa === 'convertido')
    const perdidosEnElMes = cerradosEnElMes.filter((l) => l.etapa === 'perdido')

    const leadsConvertidos = convertidosEnElMes.length
    const tasaPropia = creadosEnElMes.length ? leadsConvertidos / creadosEnElMes.length : 0

    if (desplazamiento < 0) {
      return {
        mes: nombreMes(desplazamiento, hoy),
        ventaPerdida: sumarMontos(perdidosEnElMes),
        ventaConvertida: sumarMontos(convertidosEnElMes),
        tasaConversion: tasaPropia,
        leadsConvertidos,
      }
    }

    // Mes actual: mismos números que el Dashboard (venta perdida incluye los recordatorios vencidos hoy)
    const metricas = calcularMetricas(leadsDashboard, hoy)
    return {
      mes: nombreMes(0, hoy),
      ventaPerdida: metricas.ventaPerdida,
      ventaConvertida: metricas.ventaConvertida,
      tasaConversion: creadosEnElMes.length ? tasaPropia : metricas.tasaConversion,
      leadsConvertidos,
    }
  })
}

// Últimas 8 semanas (lunes a domingo), etiquetadas por el lunes de cada una: "8 sep"
export async function obtenerSerieSemanal(hoy = new Date()): Promise<PuntoSemanal[]> {
  const leads = await obtenerLeadsParaAnalitica()
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7))

  return Array.from({ length: 8 }, (_, i) => {
    const inicio = new Date(lunes)
    inicio.setDate(lunes.getDate() - 7 * (7 - i))
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 7)
    return {
      semana: sinPunto(fmtDia.format(inicio)),
      leadsNuevos: leads.filter((l) => l.creadoEn >= inicio && l.creadoEn < fin).length,
    }
  })
}

// Monto convertido ÷ cantidad de conversiones sobre los 6 meses de la serie (0 si no hubo ninguna)
export function obtenerTicketPromedio(serieMensual: PuntoMensual[]): number {
  const conversiones = serieMensual.reduce((total, m) => total + m.leadsConvertidos, 0)
  const monto = serieMensual.reduce((total, m) => total + m.ventaConvertida, 0)
  return conversiones ? monto / conversiones : 0
}

const MS_POR_DIA = 86_400_000

// Días promedio entre que entra un lead y se convierte, sobre todo el historial. null si todavía no hay datos.
export async function obtenerTiempoPromedioConversion(): Promise<number | null> {
  const leads = await obtenerLeadsParaAnalitica()
  const duraciones = leads
    .filter((l) => l.etapa === 'convertido' && l.cerradoEn)
    .map((l) => (l.cerradoEn!.getTime() - l.creadoEn.getTime()) / MS_POR_DIA)
    // Un cierre anterior a la creación es un dato inconsistente (pasa con los leads del seed, cargados ya
    // convertidos con fecha de cierre en el pasado): se deja afuera en vez de promediar días negativos
    .filter((dias) => dias >= 0)
  if (duraciones.length === 0) return null
  return duraciones.reduce((total, d) => total + d, 0) / duraciones.length
}
