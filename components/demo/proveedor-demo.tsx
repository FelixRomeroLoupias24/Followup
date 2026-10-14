'use client'

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Info } from 'lucide-react'

import { AppShell } from '@/components/layout/app-shell'
import { ProveedorAcciones, type Acciones } from '@/lib/datos/acciones'
import { crearDatosDemo, type DatosDemo } from '@/lib/demo/datos-iniciales'
import { conEtapa, estadoVisual, leadsPendientes, textoProximoContacto } from '@/lib/leads/estado'
import type { Interaccion, Lead } from '@/lib/leads/types'
import { plantillasMock } from '@/lib/plantillas/mock'

// FollowUp es una demo pública, sin login ni backend: la app completa con datos de ejemplo. Todo lo que hace el
// visitante queda en el estado de este componente; al recargar la página vuelve a crearDatosDemo().

const ContextoDemo = createContext<DatosDemo | null>(null)

export function useDemo(): DatosDemo {
  const datos = useContext(ContextoDemo)
  if (!datos) throw new Error('useDemo() necesita el ProveedorDemo de app/(app)/layout.tsx')
  return datos
}

// Fecha sin hora, como una columna `date` de la base
function soloFecha(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Las operaciones de lib/datos/acciones.tsx, en memoria. Imitan también lo que hacían los triggers de la base
// (backend/supabase/migrations): limpiar el recordatorio al cerrar, registrar el cambio de etapa y el último contacto.
function crearAccionesDemo(setDatos: Dispatch<SetStateAction<DatosDemo | null>>): Acciones {
  let contador = 0
  const nuevoId = (prefijo: string) => `${prefijo}-demo-${Date.now()}-${++contador}`
  const actualizar = (cambio: (d: DatosDemo) => DatosDemo) => setDatos((d) => (d ? cambio(d) : d))
  const cambiarLead = (d: DatosDemo, id: string, cambio: (l: Lead) => Lead) => ({
    ...d,
    leads: d.leads.map((l) => (l.id === id ? cambio(l) : l)),
  })
  const interaccion = (leadId: string, tipo: Interaccion['tipo'], nota: string): Interaccion => ({
    id: nuevoId('i'),
    leadId,
    tipo,
    nota,
    fecha: new Date(),
  })

  return {
    async cambiarEtapa(leadId, etapa) {
      actualizar((d) => {
        const anterior = d.leads.find((l) => l.id === leadId)
        if (!anterior || anterior.etapa === etapa) return d
        return {
          ...cambiarLead(d, leadId, (l) => conEtapa(l, etapa)),
          interacciones: [...d.interacciones, interaccion(leadId, 'cambio_etapa', `${anterior.etapa} → ${etapa}`)],
        }
      })
      return true
    },

    async crearLead(nuevo) {
      const id = nuevoId('lead')
      // Los más nuevos primero
      actualizar((d) => ({ ...d, leads: [{ id, ...nuevo, ultimoContacto: null }, ...d.leads] }))
      return id
    },

    async registrarMensajeEnviado(leadId, texto) {
      actualizar((d) => ({
        ...cambiarLead(d, leadId, (l) => ({ ...l, ultimoContacto: new Date() })),
        interacciones: [...d.interacciones, interaccion(leadId, 'mensaje_enviado', texto)],
      }))
      return true
    },

    async agendarProximoContacto(leadId, fecha) {
      actualizar((d) => cambiarLead(d, leadId, (l) => ({ ...l, proximoContacto: soloFecha(fecha) })))
      return true
    },

    async guardarPlantilla(b) {
      const guardada = { id: b.id ?? nuevoId('plantilla'), nombre: b.nombre, texto: b.texto }
      actualizar((d) => ({
        ...d,
        plantillas: b.id ? d.plantillas.map((p) => (p.id === b.id ? guardada : p)) : [guardada, ...d.plantillas],
      }))
      return guardada
    },

    async eliminarPlantilla(id) {
      actualizar((d) => ({ ...d, plantillas: d.plantillas.filter((p) => p.id !== id) }))
      return true
    },

    async cargarPlantillasEjemplo() {
      const cargadas = plantillasMock.map(({ nombre, texto }) => ({ id: nuevoId('plantilla'), nombre, texto }))
      actualizar((d) => ({ ...d, plantillas: cargadas }))
      return cargadas
    },

    async guardarConfiguracion(cambios) {
      actualizar((d) => ({
        ...d,
        cuenta: {
          ...d.cuenta,
          nombreNegocio: cambios.nombre_negocio ?? d.cuenta.nombreNegocio,
          rubro: cambios.rubro ?? d.cuenta.rubro,
          diasSinSeguimiento: cambios.dias_sin_seguimiento ?? d.cuenta.diasSinSeguimiento,
          notificacionesVencidos: cambios.notificaciones_vencidos ?? d.cuenta.notificacionesVencidos,
        },
      }))
      return true
    },
  }
}

export function ProveedorDemo({ children }: { children: ReactNode }) {
  // Se arma recién en el navegador: las fechas relativas a "hoy" y la zona horaria son las del visitante
  // (armarlo también en el servidor daría diferencias de hidratación)
  const [datos, setDatos] = useState<DatosDemo | null>(null)
  useEffect(() => setDatos(crearDatosDemo()), [])
  const acciones = useMemo(() => crearAccionesDemo(setDatos), [])

  const hoy = new Date()
  const recordatorios = datos
    ? leadsPendientes(datos.leads, hoy).map((lead) => ({
        id: lead.id,
        nombre: lead.nombre,
        estado: estadoVisual(lead, hoy),
        texto: textoProximoContacto(lead, hoy) ?? '',
      }))
    : []

  return (
    // --alto-aviso: el header y el sidebar arrancan debajo del cartel
    <div className="pt-(--alto-aviso) [--alto-aviso:2.5rem]">
      <AvisoDemo />
      {datos && (
        <ProveedorAcciones value={acciones}>
          <ContextoDemo.Provider value={datos}>
            <AppShell recordatorios={recordatorios} email={datos.cuenta.email} nombreNegocio={datos.cuenta.nombreNegocio}>
              {children}
            </AppShell>
          </ContextoDemo.Provider>
        </ProveedorAcciones>
      )}
    </div>
  )
}

function AvisoDemo() {
  return (
    <div
      role="region"
      aria-label="Aviso de versión demo"
      className="fixed inset-x-0 top-0 z-60 flex h-(--alto-aviso) items-center justify-center bg-estado-seguimiento px-4 text-small text-estado-seguimiento-foreground"
    >
      <p className="flex min-w-0 items-center gap-2">
        <Info className="size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-medium">Versión demo:</span> los datos son de ejemplo
        </span>
      </p>
    </div>
  )
}
