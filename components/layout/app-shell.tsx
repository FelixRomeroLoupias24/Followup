'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Header } from '@/components/layout/header'
import type { Recordatorio } from '@/components/layout/panel-notificaciones'
import { Sidebar } from '@/components/layout/sidebar'

// Estructura común de todas las pantallas: sidebar (240px en desktop) + header + contenido
export function AppShell({
  recordatorios,
  email,
  nombreNegocio,
  children,
}: {
  recordatorios: Recordatorio[]
  email: string
  nombreNegocio: string
  children: ReactNode
}) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    if (!menuAbierto) return
    const cerrarConEscape = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false)
    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [menuAbierto])

  return (
    <div className="min-h-screen">
      <Sidebar
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        email={email}
        nombreNegocio={nombreNegocio}
      />
      <div className="lg:pl-60">
        <Header recordatorios={recordatorios} onAbrirMenu={() => setMenuAbierto(true)} />
        {children}
      </div>
    </div>
  )
}
