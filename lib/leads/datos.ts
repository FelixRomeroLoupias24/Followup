import { crearClienteServidor } from '@/lib/supabase/server'

import type { Etapa, Interaccion, Lead, TipoInteraccion } from './types'

// Lectura de leads e interacciones desde Supabase (solo servidor). RLS ya filtra por el usuario con sesión.

// Filas tal como las devuelve Supabase (snake_case). Columnas: backend/supabase/migrations
type FilaLead = {
  id: string
  nombre: string
  telefono: string
  consulta: string
  etapa: Etapa
  monto: number | string | null
  ultimo_contacto: string | null
  proximo_contacto: string | null
}

type FilaInteraccion = {
  id: string
  lead_id: string
  tipo: TipoInteraccion
  nota: string | null
  fecha: string
}

// proximo_contacto es `date` ("2026-10-08"): new Date(texto) lo leería en UTC y en Argentina quedaría un día antes
function fechaLocal(valor: string): Date {
  const [anio, mes, dia] = valor.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

function filaAUnLead(fila: FilaLead): Lead {
  return {
    id: fila.id,
    nombre: fila.nombre,
    telefono: fila.telefono,
    consulta: fila.consulta,
    etapa: fila.etapa,
    // numeric puede llegar como string según la versión de PostgREST
    monto: fila.monto === null ? null : Number(fila.monto),
    // timestamptz trae zona horaria: new Date() lo interpreta bien
    ultimoContacto: fila.ultimo_contacto ? new Date(fila.ultimo_contacto) : null,
    proximoContacto: fila.proximo_contacto ? fechaLocal(fila.proximo_contacto) : null,
  }
}

function filaAUnaInteraccion(fila: FilaInteraccion): Interaccion {
  return {
    id: fila.id,
    leadId: fila.lead_id,
    tipo: fila.tipo,
    nota: fila.nota,
    fecha: new Date(fila.fecha),
  }
}

export async function obtenerLeads(): Promise<Lead[]> {
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('No se pudieron leer los leads:', error.message)
    return []
  }
  return (data as FilaLead[]).map(filaAUnLead)
}

export async function obtenerLeadPorId(id: string): Promise<Lead | undefined> {
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.from('leads').select('*').eq('id', id).maybeSingle()
  // Un id que no es uuid (ej. /leads/abc) también vuelve como error: se trata igual que "no existe"
  if (error || !data) return undefined
  return filaAUnLead(data as FilaLead)
}

export async function obtenerInteraccionesDeLead(leadId: string): Promise<Interaccion[]> {
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase
    .from('interacciones')
    .select('*')
    .eq('lead_id', leadId)
    .order('fecha', { ascending: false })
  if (error) {
    console.error('No se pudo leer el historial del lead:', error.message)
    return []
  }
  return (data as FilaInteraccion[]).map(filaAUnaInteraccion)
}
