import { ESTADOS, estadoVisual, type EstadoVisual } from '@/lib/leads/estado'
import type { Lead } from '@/lib/leads/types'

export type ConteoEstado = { estado: EstadoVisual; texto: string; cantidad: number }

// Foto actual: cuántos leads hay en cada estado visual, en el orden de ESTADOS (datos reales, no mock nuevo)
export function contarLeadsPorEstado(leads: Lead[], hoy = new Date()): ConteoEstado[] {
  return ESTADOS.map(({ valor, texto }) => ({
    estado: valor,
    texto,
    cantidad: leads.filter((lead) => estadoVisual(lead, hoy) === valor).length,
  }))
}
