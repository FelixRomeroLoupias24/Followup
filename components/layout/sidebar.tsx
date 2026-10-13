'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChartColumn,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquareText,
  Settings,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'

import { crearClienteNavegador } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type ItemNav = { href: string; texto: string; icono: LucideIcon; activo: (ruta: string) => boolean }

// La ficha de un lead cuelga del Dashboard, así que también lo marca activo.
// Próximas secciones (ej. "Leads" si se separa del Dashboard) se agregan a esta lista.
const ITEMS: ItemNav[] = [
  { href: '/', texto: 'Dashboard', icono: LayoutDashboard, activo: (r) => r === '/' || r.startsWith('/leads') },
  { href: '/plantillas', texto: 'Plantillas', icono: MessageSquareText, activo: (r) => r.startsWith('/plantillas') },
  // ChartColumn es el BarChart3 de versiones anteriores de lucide (se renombró en la v1)
  { href: '/analiticas', texto: 'Analíticas', icono: ChartColumn, activo: (r) => r.startsWith('/analiticas') },
  { href: '/configuracion', texto: 'Configuración', icono: Settings, activo: (r) => r.startsWith('/configuracion') },
]

// Menú lateral (diseño/sistema-diseño.md §6.2): fijo en desktop, cajón con fondo oscurecido en mobile
export function Sidebar({
  abierto,
  onCerrar,
  email,
  nombreNegocio,
}: {
  abierto: boolean
  onCerrar: () => void
  email: string
  nombreNegocio: string
}) {
  const ruta = usePathname()
  const router = useRouter()
  const [saliendo, setSaliendo] = useState(false)

  async function cerrarSesion() {
    setSaliendo(true)
    await crearClienteNavegador().auth.signOut()
    // replace: que "atrás" no vuelva a una pantalla protegida; refresh: que el servidor vea la sesión cerrada
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      {abierto && <div className="fixed inset-0 z-40 bg-background/70 lg:hidden" onClick={onCerrar} aria-hidden />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-sidebar transition-transform',
          // Cerrado en mobile: fuera de pantalla e invisible (así no recibe foco con Tab)
          abierto ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible lg:translate-x-0',
        )}
        aria-label="Menú principal"
      >
        <div className="flex h-14 items-center justify-between px-5">
          <Link href="/" onClick={onCerrar} className="flex items-center gap-2 text-foreground">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="size-4" aria-hidden />
            </span>
            <span className="text-h2">FollowUp</span>
          </Link>
          <button
            type="button"
            onClick={onCerrar}
            className="grid size-8 place-items-center rounded-lg text-secondary hover:bg-accent lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {ITEMS.map(({ href, texto, icono: Icono, activo }) => {
              const esActivo = activo(ruta)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onCerrar}
                    aria-current={esActivo ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-body transition-colors',
                      esActivo
                        ? 'border-l-primary bg-accent font-medium text-primary'
                        : 'border-l-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icono className="size-4" aria-hidden />
                    {texto}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 border-t border-border px-3 py-4">
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-secondary">
              <UserRound className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-foreground" title={nombreNegocio}>
                {nombreNegocio}
              </p>
              <p className="truncate text-caption text-muted-foreground" title={email}>
                {email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            disabled={saliendo}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-body text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden />
            {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>
    </>
  )
}
