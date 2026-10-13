import { createBrowserClient } from '@supabase/ssr'

import { configSupabase } from './config'

// Cliente para Client Components (login, cerrar sesión). Guarda la sesión en cookies,
// así el servidor y el proxy la ven en el próximo request.
export function crearClienteNavegador() {
  const { url, anonKey } = configSupabase()
  return createBrowserClient(url, anonKey)
}
