'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { LoginForm } from './login-form'
import { RegistroForm } from './registro-form'

type Pestana = 'login' | 'registro'

const PESTANAS: { id: Pestana; etiqueta: string; titulo: string; bajada: string }[] = [
  {
    id: 'login',
    etiqueta: 'Iniciar sesión',
    titulo: 'Iniciar sesión',
    bajada: 'Entrá a FollowUp para ver tus leads y recordatorios.',
  },
  {
    id: 'registro',
    etiqueta: 'Crear cuenta',
    titulo: 'Crear cuenta',
    bajada: 'Creá tu cuenta gratis y empezá a seguir tus leads.',
  },
]

// Pantalla de acceso: pestañas "Iniciar sesión" / "Crear cuenta" sobre el formulario que corresponda
export function Acceso({ volver }: { volver: string }) {
  const [activa, setActiva] = useState<Pestana>('login')
  const actual = PESTANAS.find((p) => p.id === activa)!

  // Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs)
  function moverConTeclado(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const siguiente = activa === 'login' ? 'registro' : 'login'
    setActiva(siguiente)
    document.getElementById(`pestana-${siguiente}`)?.focus()
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-foreground">{actual.titulo}</h1>
        <p className="text-small text-muted-foreground">{actual.bajada}</p>
      </div>

      <div
        role="tablist"
        aria-label="Acceso"
        onKeyDown={moverConTeclado}
        className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1"
      >
        {PESTANAS.map((p) => {
          const seleccionada = p.id === activa
          return (
            <button
              key={p.id}
              id={`pestana-${p.id}`}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              aria-controls={`panel-${p.id}`}
              tabIndex={seleccionada ? 0 : -1}
              onClick={() => setActiva(p.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-small font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                seleccionada ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.etiqueta}
            </button>
          )
        })}
      </div>

      <div id={`panel-${activa}`} role="tabpanel" aria-labelledby={`pestana-${activa}`}>
        {activa === 'login' ? <LoginForm volver={volver} /> : <RegistroForm />}
      </div>
    </>
  )
}
