import type { Cuenta } from '@/lib/cuenta/mock'
import { obtenerInteraccionesMock, obtenerLeadsMock } from '@/lib/leads/mock'
import type { Interaccion, Lead } from '@/lib/leads/types'
import { plantillasMock } from '@/lib/plantillas/mock'
import type { Plantilla } from '@/lib/plantillas/plantilla'

// Estado inicial de la demo (/demo). Vive solo en memoria del navegador: al recargar se vuelve a esto.
export type DatosDemo = {
  leads: Lead[]
  interacciones: Interaccion[]
  plantillas: Plantilla[]
  cuenta: Cuenta
}

// Mismo criterio que lib/leads/mock.ts: fechas relativas a hoy, para que siempre haya vencidos, de hoy y a futuro
function dias(n: number, hora = 10): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hora, 30, 0, 0)
  return d
}

// Dos más que el mock, para que la demo tenga 10 leads y más de un convertido
function leadsExtra(): Lead[] {
  return [
    {
      id: '9',
      nombre: 'Romina Giménez',
      telefono: '+54 9 341 555-7788',
      consulta: 'Remeras con logo para un evento de 80 personas',
      etapa: 'siguiendo',
      ultimoContacto: dias(-2),
      proximoContacto: dias(2),
      monto: 310000,
    },
    {
      id: '10',
      nombre: 'Gustavo Ibarra',
      telefono: '+54 9 381 422-6060',
      consulta: 'Camisetas para el equipo de fútbol del club',
      etapa: 'convertido',
      ultimoContacto: dias(-6),
      proximoContacto: null,
      monto: 150000,
    },
  ]
}

function interaccionesExtra(): Interaccion[] {
  return [
    { id: 'i10', leadId: '9', tipo: 'respuesta_recibida', nota: '¿Me pasás precio con el logo bordado y estampado?', fecha: dias(-3) },
    { id: 'i11', leadId: '9', tipo: 'mensaje_enviado', nota: 'Hola Romina, te mando las dos opciones con precio por unidad.', fecha: dias(-2) },
    { id: 'i12', leadId: '10', tipo: 'mensaje_enviado', nota: 'Hola Gustavo, te paso el presupuesto de las 18 camisetas con número.', fecha: dias(-8) },
    { id: 'i13', leadId: '10', tipo: 'respuesta_recibida', nota: 'Perfecto, avanzamos. Te transfiero la seña hoy.', fecha: dias(-6) },
  ]
}

// Función (no constante) para que las fechas se calculen al abrir la demo
export function crearDatosDemo(): DatosDemo {
  const leads = [...obtenerLeadsMock(), ...leadsExtra()]
  return {
    leads,
    interacciones: [...leads.flatMap((l) => obtenerInteraccionesMock(l.id)), ...interaccionesExtra()],
    plantillas: plantillasMock.map((p) => ({ ...p })),
    cuenta: {
      nombreNegocio: 'Estampados del Sur',
      rubro: 'Indumentaria',
      email: 'demo@followup.app',
      diasSinSeguimiento: 2,
      notificacionesVencidos: true,
    },
  }
}
