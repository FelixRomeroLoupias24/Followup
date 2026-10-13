'use client'

import { Menu } from 'lucide-react'

import { PanelNotificaciones, type Recordatorio } from '@/components/layout/panel-notificaciones'

// Barra superior integrada al fondo (sin borde): hamburguesa en mobile y campanita con el panel de recordatorios.
// Logo y usuario viven en el sidebar (diseño/sistema-diseño.md §6.2).
export function Header({ recordatorios, onAbrirMenu }: { recordatorios: Recordatorio[]; onAbrirMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-8">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="grid size-9 place-items-center rounded-lg text-secondary hover:bg-accent lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <PanelNotificaciones recordatorios={recordatorios} />
      </div>
    </header>
  )
}
