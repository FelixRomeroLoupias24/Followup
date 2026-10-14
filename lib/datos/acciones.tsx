'use client'

import { createContext, useContext } from 'react'

import type { Rubro } from '@/lib/cuenta/mock'
import type { Etapa, Lead } from '@/lib/leads/types'
import type { Plantilla } from '@/lib/plantillas/plantilla'

// Todo lo que los componentes de cliente guardan. La app es una demo pública: la única implementación es la
// de components/demo/proveedor-demo.tsx, que guarda en memoria del navegador (no hay backend ni Supabase).

export type NuevoLead = Pick<Lead, 'nombre' | 'telefono' | 'consulta' | 'etapa' | 'proximoContacto' | 'monto'>

export type BorradorPlantilla = { id?: string; nombre: string; texto: string }

// Lo que guarda cada sección de Configuración (solo sus campos, así una no pisa los valores de la otra)
export type CambiosConfiguracion = Partial<{
  nombre_negocio: string
  rubro: Rubro
  dias_sin_seguimiento: number
  notificaciones_vencidos: boolean
}>

// true = se guardó
export type Acciones = {
  cambiarEtapa: (leadId: string, etapa: Etapa) => Promise<boolean>
  // Id del lead creado, o null si no se pudo guardar
  crearLead: (lead: NuevoLead) => Promise<string | null>
  registrarMensajeEnviado: (leadId: string, texto: string) => Promise<boolean>
  agendarProximoContacto: (leadId: string, fecha: Date) => Promise<boolean>
  // La plantilla tal como quedó guardada, o null
  guardarPlantilla: (b: BorradorPlantilla) => Promise<Plantilla | null>
  eliminarPlantilla: (id: string) => Promise<boolean>
  cargarPlantillasEjemplo: () => Promise<Plantilla[] | null>
  guardarConfiguracion: (cambios: CambiosConfiguracion) => Promise<boolean>
}

const ContextoAcciones = createContext<Acciones | null>(null)

export const ProveedorAcciones = ContextoAcciones.Provider

export function useAcciones(): Acciones {
  const acciones = useContext(ContextoAcciones)
  if (!acciones) throw new Error('useAcciones() necesita el ProveedorDemo de app/(app)/layout.tsx')
  return acciones
}
