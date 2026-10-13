import type { Interaccion, Lead } from './types'

// Datos de ejemplo hasta conectar Supabase. Las fechas son relativas a hoy
// para que siempre haya leads vencidos, para hoy y a futuro.
function dias(n: number, hora = 10): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hora, 30, 0, 0)
  return d
}

// Es una función (no una constante) para que las fechas se calculen en cada request
export function obtenerLeadsMock(): Lead[] {
  return [
    {
      id: '1',
      nombre: 'María Rodríguez',
      telefono: '+54 9 11 5555-1234',
      consulta: 'Precio mayorista de 50 remeras estampadas',
      etapa: 'siguiendo',
      ultimoContacto: dias(-5),
      proximoContacto: dias(-2),
      monto: 180000,
    },
    {
      id: '2',
      nombre: 'Carlos López',
      telefono: '+54 9 11 4444-9876',
      consulta: 'Costo de envío a Córdoba',
      etapa: 'contactado',
      ultimoContacto: dias(-3),
      proximoContacto: dias(-1),
      monto: 45000,
    },
    {
      id: '3',
      nombre: 'Ana Sofía Gómez',
      telefono: '+54 9 351 333-2211',
      consulta: 'Si tienen talle XL del buzo gris',
      etapa: 'contactado',
      ultimoContacto: dias(-2),
      proximoContacto: dias(0),
      monto: 38000,
    },
    {
      id: '4',
      nombre: 'Javier Pérez',
      telefono: '+54 9 11 6666-0001',
      consulta: 'Presupuesto para uniformes de 12 empleados',
      etapa: 'nuevo',
      ultimoContacto: null,
      proximoContacto: dias(0),
      monto: 240000,
    },
    {
      id: '5',
      nombre: 'Lucía Fernández',
      telefono: '+54 9 223 777-4545',
      consulta: 'Medios de pago y cuotas sin interés',
      etapa: 'nuevo',
      ultimoContacto: null,
      proximoContacto: dias(1),
      monto: null,
    },
    {
      id: '6',
      nombre: 'Martín Suárez',
      telefono: '+54 9 11 2222-8080',
      consulta: 'Reposición de stock de gorras',
      etapa: 'siguiendo',
      ultimoContacto: dias(-1),
      proximoContacto: dias(3),
      monto: 62000,
    },
    {
      id: '7',
      nombre: 'Paula Romano',
      telefono: '+54 9 11 3030-1212',
      consulta: 'Pedido de 20 tazas personalizadas',
      etapa: 'convertido',
      ultimoContacto: dias(-4),
      proximoContacto: null,
      monto: 95000,
    },
    {
      id: '8',
      nombre: 'Diego Morales',
      telefono: '+54 9 261 444-1010',
      consulta: 'Descuento por compra de 3 camperas',
      etapa: 'perdido',
      ultimoContacto: dias(-12),
      proximoContacto: null,
      monto: 120000,
    },
  ]
}

// TODO: conectar a backend — from('leads').select('*').eq('id', id).single()
export function obtenerLeadPorId(id: string): Lead | undefined {
  return obtenerLeadsMock().find((lead) => lead.id === id)
}

// Mismo historial que backend/supabase/seed.sql
// TODO: conectar a backend — from('interacciones').select('*').eq('lead_id', leadId).order('fecha', { ascending: false })
export function obtenerInteraccionesMock(leadId: string): Interaccion[] {
  const todas: Interaccion[] = [
    { id: 'i1', leadId: '1', tipo: 'mensaje_enviado', nota: 'Hola María, te paso los precios mayoristas de las remeras estampadas.', fecha: dias(-7) },
    { id: 'i2', leadId: '1', tipo: 'respuesta_recibida', nota: 'Gracias, lo veo con mi socia y te aviso.', fecha: dias(-5) },
    { id: 'i3', leadId: '2', tipo: 'mensaje_enviado', nota: 'Hola Carlos, el envío a Córdoba tarda de 3 a 5 días hábiles.', fecha: dias(-3) },
    { id: 'i4', leadId: '3', tipo: 'mensaje_enviado', nota: '¡Hola Ana! Sí, tenemos el buzo gris en talle XL.', fecha: dias(-2) },
    { id: 'i5', leadId: '6', tipo: 'respuesta_recibida', nota: 'Necesito 30 gorras para el viernes, ¿llegan?', fecha: dias(-1) },
    { id: 'i6', leadId: '7', tipo: 'mensaje_enviado', nota: 'Te paso el diseño de las tazas para que lo apruebes.', fecha: dias(-6) },
    { id: 'i7', leadId: '7', tipo: 'respuesta_recibida', nota: '¡Me encantó! Confirmo las 20.', fecha: dias(-4) },
    { id: 'i8', leadId: '8', tipo: 'mensaje_enviado', nota: 'Hola Diego, por las 3 camperas te puedo hacer un 10% de descuento.', fecha: dias(-12) },
    { id: 'i9', leadId: '8', tipo: 'nota', nota: 'Me dijo que al final compró en otro lado.', fecha: dias(-5) },
  ]
  return todas.filter((i) => i.leadId === leadId).sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}

// TODO: conectar a backend — reemplazar por POST /api/mensajes (backend/modelo-y-api.md §2.4)
export function generarMensajeMock(lead: Lead): string {
  const nombre = lead.nombre.split(' ')[0]
  const consulta = lead.consulta.charAt(0).toLowerCase() + lead.consulta.slice(1)
  const apertura = lead.ultimoContacto
    ? `Te escribo de nuevo por lo que me habías consultado: ${consulta}.`
    : `Te escribo por lo que me consultaste: ${consulta}.`
  return `¡Hola ${nombre}! ¿Cómo andás? ${apertura} ¿Pudiste pensarlo? Si querés te paso más info o lo vemos juntos. ¡Avisame!`
}
