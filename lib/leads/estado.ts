import type { Etapa, Lead } from './types'

// Etapas que se guardan y se pueden elegir a mano. "Contactar hoy" y la venta perdida
// por vencimiento NO están acá: salen de la fecha (ver estadoVisual).
export const ETAPAS: { valor: Etapa; texto: string }[] = [
  { valor: 'nuevo', texto: 'Nuevo' },
  { valor: 'contactado', texto: 'Contactado' },
  { valor: 'siguiendo', texto: 'En seguimiento' },
  { valor: 'convertido', texto: 'Convertido' },
  { valor: 'perdido', texto: 'Perdido' },
]

export function estaCerrado(lead: Pick<Lead, 'etapa'>): boolean {
  return lead.etapa === 'convertido' || lead.etapa === 'perdido'
}

// Mismo efecto que el trigger de la base (backend regla §3.4): al cerrar se limpia el recordatorio
export function conEtapa(lead: Lead, etapa: Etapa): Lead {
  const actualizado = { ...lead, etapa }
  return estaCerrado(actualizado) ? { ...actualizado, proximoContacto: null } : actualizado
}

// Estado que se muestra (badge + color de fila). Uno por fila de la tabla 4.1
// del sistema de diseño. Se deriva de la etapa guardada + la fecha de próximo contacto.
export type EstadoVisual = 'venta-perdida' | 'contactar-hoy' | 'nuevo' | 'en-seguimiento' | 'convertido'

export const ESTADOS: { valor: EstadoVisual; texto: string }[] = [
  { valor: 'nuevo', texto: 'Nuevo' },
  { valor: 'en-seguimiento', texto: 'En seguimiento' },
  { valor: 'contactar-hoy', texto: 'Contactar hoy' },
  { valor: 'venta-perdida', texto: 'Venta perdida' },
  { valor: 'convertido', texto: 'Convertido' },
]

// Días de calendario desde hoy hasta la fecha (negativo = en el pasado)
export function diasHasta(fecha: Date, hoy = new Date()): number {
  const a = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const b = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  return Math.round((b - a) / 86_400_000)
}

export function estadoVisual(lead: Lead, hoy = new Date()): EstadoVisual {
  if (lead.etapa === 'convertido') return 'convertido'
  if (lead.etapa === 'perdido') return 'venta-perdida'
  if (lead.proximoContacto) {
    const dias = diasHasta(lead.proximoContacto, hoy)
    if (dias < 0) return 'venta-perdida'
    if (dias === 0) return 'contactar-hoy'
  }
  return lead.etapa === 'nuevo' ? 'nuevo' : 'en-seguimiento'
}

// Vencidos primero, después los de hoy, nuevos, en seguimiento, y al final los cerrados
function prioridad(lead: Lead, hoy: Date): number {
  if (lead.etapa === 'perdido') return 5
  const orden: Record<EstadoVisual, number> = {
    'venta-perdida': 0,
    'contactar-hoy': 1,
    nuevo: 2,
    'en-seguimiento': 3,
    convertido: 4,
  }
  return orden[estadoVisual(lead, hoy)]
}

export function ordenarPorUrgencia(leads: Lead[], hoy = new Date()): Lead[] {
  const fecha = (l: Lead) => l.proximoContacto?.getTime() ?? Number.MAX_SAFE_INTEGER
  return [...leads].sort((a, b) => prioridad(a, hoy) - prioridad(b, hoy) || fecha(a) - fecha(b))
}

// Leads abiertos con el recordatorio vencido o para hoy (panel de la campanita), los más urgentes primero
export function leadsPendientes(leads: Lead[], hoy = new Date()): Lead[] {
  return ordenarPorUrgencia(leads, hoy).filter((l) => {
    if (estaCerrado(l)) return false
    const estado = estadoVisual(l, hoy)
    return estado === 'venta-perdida' || estado === 'contactar-hoy'
  })
}

export function textoHaceDias(fecha: Date, hoy = new Date()): string {
  const dias = -diasHasta(fecha, hoy)
  if (dias === 0) return 'Hoy'
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`
}

export function textoUltimoContacto(lead: Lead, hoy = new Date()): string {
  return lead.ultimoContacto ? textoHaceDias(lead.ultimoContacto, hoy) : 'Sin contactar'
}

// null = no hay recordatorio pendiente (lead cerrado o sin fecha)
export function textoProximoContacto(lead: Lead, hoy = new Date()): string | null {
  if (estaCerrado(lead) || !lead.proximoContacto) return null
  const dias = diasHasta(lead.proximoContacto, hoy)
  if (dias < 0) return dias === -1 ? 'Vencido hace 1 día' : `Vencido hace ${-dias} días`
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}
