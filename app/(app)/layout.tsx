import { redirect } from 'next/navigation'

import { AppShell } from '@/components/layout/app-shell'
import type { Recordatorio } from '@/components/layout/panel-notificaciones'
import { obtenerCuenta } from '@/lib/cuenta/datos'
import { obtenerLeads } from '@/lib/leads/datos'
import { estadoVisual, leadsPendientes, textoProximoContacto } from '@/lib/leads/estado'
import { crearClienteServidor } from '@/lib/supabase/server'

// Depende de la sesión y de la fecha de hoy: siempre se renderiza por request
export const dynamic = 'force-dynamic'

// Panel de la campanita: leads con recordatorio vencido o para hoy, ya con el texto y el estado para el color
// (lee los leads reales: con los del mock los links apuntarían a ids que no existen en la base)
async function obtenerRecordatorios(): Promise<Recordatorio[]> {
  const hoy = new Date()
  // TODO: refrescar al cambiar una etapa o un recordatorio (hoy se actualiza al recargar o navegar con refresh)
  return leadsPendientes(await obtenerLeads(), hoy).map((lead) => ({
    id: lead.id,
    nombre: lead.nombre,
    estado: estadoVisual(lead, hoy),
    texto: textoProximoContacto(lead, hoy) ?? '',
  }))
}

// Todas las pantallas de la app (Dashboard, leads, plantillas, analíticas, configuración) pasan por acá.
// proxy.ts ya redirige sin sesión; esta es la verificación con autoridad, del lado del servidor.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // getClaims queda solo para el chequeo de sesión: obtenerCuenta() no distingue "sin sesión" (devuelve valores por defecto)
  const supabase = await crearClienteServidor()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')

  // Nombre del negocio (de Configuración, o el valor por defecto si nunca se guardó) y email real
  const [cuenta, recordatorios] = await Promise.all([obtenerCuenta(), obtenerRecordatorios()])

  return (
    <AppShell recordatorios={recordatorios} email={cuenta.email} nombreNegocio={cuenta.nombreNegocio}>
      {children}
    </AppShell>
  )
}
