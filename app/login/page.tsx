import type { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'

import { Acceso } from '@/components/auth/acceso'

export const metadata: Metadata = { title: 'Iniciar sesión o crear cuenta — FollowUp' }

// Solo rutas internas: evita que ?volver= mande a otro sitio después de iniciar sesión
function destinoSeguro(volver: string | string[] | undefined): string {
  return typeof volver === 'string' && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/'
}

// Única pantalla fuera de app/(app): sin sidebar ni header
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ volver?: string | string[] }> }) {
  const { volver } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <MessageCircle className="size-6" aria-hidden />
          </span>
        </div>
        <Acceso volver={destinoSeguro(volver)} />
      </div>
    </main>
  )
}
