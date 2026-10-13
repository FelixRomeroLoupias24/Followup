import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { configSupabase } from './config'

// Cliente para Server Components y Server Actions. Crear uno por request (no reutilizar entre requests).
export async function crearClienteServidor() {
  const { url, anonKey } = configSupabase()
  const almacen = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return almacen.getAll()
      },
      setAll(cookiesASetear) {
        try {
          cookiesASetear.forEach(({ name, value, options }) => almacen.set(name, value, options))
        } catch {
          // Un Server Component no puede escribir cookies: no pasa nada, porque proxy.ts ya refresca la sesión
        }
      },
    },
  })
}
