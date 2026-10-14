'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { crearClienteNavegador } from '@/lib/supabase/client'

// Login con email y contraseña. La cuenta se crea en la pestaña "Crear cuenta" (registro-form.tsx)
export function LoginForm({ volver }: { volver: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || !clave) {
      setError('Completá el email y la contraseña.')
      return
    }
    setEnviando(true)
    setError(null)

    const { error } = await crearClienteNavegador().auth.signInWithPassword({ email: email.trim(), password: clave })
    if (error) {
      // Mismo mensaje para email inexistente o contraseña mal: no revelar cuál de los dos falló
      setError(
        error.code === 'invalid_credentials'
          ? 'Email o contraseña incorrectos.'
          : error.code === 'email_not_confirmed'
            ? 'Falta confirmar este email en Supabase antes de poder entrar.'
            : 'No se pudo iniciar sesión. Probá de nuevo en unos minutos.',
      )
      setEnviando(false)
      return
    }
    // replace: que "atrás" no vuelva al login; refresh: que el servidor lea la cookie nueva
    router.replace(volver)
    router.refresh()
  }

  return (
    <Card className="shadow-sm">
      <form onSubmit={iniciarSesion} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-small font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'login-error' : undefined}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="clave" className="text-small font-medium text-foreground">
            Contraseña
          </label>
          <Input
            id="clave"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>

        {error && (
          <p id="login-error" role="alert" className="text-small text-danger">
            {error}
          </p>
        )}
      </form>
    </Card>
  )
}
