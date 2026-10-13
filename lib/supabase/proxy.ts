import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { configSupabase } from './config'

// Única ruta que no pide sesión
const RUTA_LOGIN = '/login'

// Patrón estándar de @supabase/ssr para Next: refresca la sesión (cookies) en cada request y, como chequeo rápido,
// manda a /login a quien no tenga sesión. La verificación con autoridad está además en app/(app)/layout.tsx.
export async function actualizarSesion(request: NextRequest) {
  const { url, anonKey } = configSupabase()
  let respuesta = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesASetear, headers) {
        cookiesASetear.forEach(({ name, value }) => request.cookies.set(name, value))
        respuesta = NextResponse.next({ request })
        cookiesASetear.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options))
        // Que ningún CDN cachee una respuesta con la sesión de alguien
        Object.entries(headers).forEach(([clave, valor]) => respuesta.headers.set(clave, valor))
      },
    },
  })

  // No poner código entre createServerClient y getClaims: es lo que refresca el token si venció
  const { data } = await supabase.auth.getClaims()
  const conSesion = !!data?.claims

  const { pathname, search } = request.nextUrl
  const enLogin = pathname === RUTA_LOGIN

  if (!conSesion && !enLogin) {
    const destino = request.nextUrl.clone()
    destino.pathname = RUTA_LOGIN
    destino.search = ''
    // Para volver a donde iba después de iniciar sesión
    if (pathname !== '/') destino.searchParams.set('volver', pathname + search)
    return redirigirConCookies(destino, respuesta)
  }

  if (conSesion && enLogin) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/'
    destino.search = ''
    return redirigirConCookies(destino, respuesta)
  }

  return respuesta
}

// Una redirección nueva perdería las cookies recién refrescadas: se copian
function redirigirConCookies(destino: URL, base: NextResponse) {
  const redireccion = NextResponse.redirect(destino)
  base.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie))
  return redireccion
}
