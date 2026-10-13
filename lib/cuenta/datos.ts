import { crearClienteServidor } from '@/lib/supabase/server'

import { cuentaMock, RUBROS, type Cuenta, type Rubro } from './mock'

// Fila de configuracion_negocio (backend/supabase/migrations/20261008120000_configuracion_negocio.sql)
type FilaConfiguracion = {
  nombre_negocio: string
  rubro: string
  dias_sin_seguimiento: number
  notificaciones_vencidos: boolean
}

// Si nunca guardó la configuración (no hay fila) se usan los valores por defecto de cuentaMock.
// El email siempre es el real, el del usuario con sesión.
export async function obtenerCuenta(): Promise<Cuenta> {
  const supabase = await crearClienteServidor()
  const [{ data: usuario }, { data: fila, error }] = await Promise.all([
    supabase.auth.getUser(),
    // Sin .eq('user_id'): RLS solo deja ver la fila propia
    supabase.from('configuracion_negocio').select('*').maybeSingle(),
  ])

  const email = usuario.user?.email ?? ''
  if (error) console.error('No se pudo leer la configuración del negocio:', error.message)
  if (error || !fila) return { ...cuentaMock, email }

  const config = fila as FilaConfiguracion
  return {
    nombreNegocio: config.nombre_negocio,
    // La base ya restringe el rubro a estas opciones; el chequeo es por si alguien cambia la lista de un solo lado
    rubro: (RUBROS as readonly string[]).includes(config.rubro) ? (config.rubro as Rubro) : cuentaMock.rubro,
    email,
    diasSinSeguimiento: config.dias_sin_seguimiento,
    notificacionesVencidos: config.notificaciones_vencidos,
  }
}
