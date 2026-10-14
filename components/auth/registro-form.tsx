'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { crearClienteNavegador } from '@/lib/supabase/client'

// Mínimo por defecto de Supabase Auth; si se sube en el panel, la base igual responde weak_password
const LARGO_MINIMO_CLAVE = 6

// Cuenta nueva con email y contraseña. Los datos de cada usuario quedan aislados por RLS (user_id = auth.uid()),
// así que no hace falta crear nada más: la configuración del negocio usa los valores por defecto hasta que la guarde.
export function RegistroForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [repetirClave, setRepetirClave] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function crearCuenta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAviso(null)
    if (!email.trim() || !clave || !repetirClave) {
      setError('Completá el email y las dos contraseñas.')
      return
    }
    if (clave.length < LARGO_MINIMO_CLAVE) {
      setError(`La contraseña es muy corta: tiene que tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`)
      return
    }
    if (clave !== repetirClave) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    setError(null)

    const { data, error } = await crearClienteNavegador().auth.signUp({ email: email.trim(), password: clave })
    if (error) {
      setError(
        error.code === 'user_already_exists' || error.code === 'email_exists'
          ? 'Ya hay una cuenta con ese email. Probá iniciar sesión.'
          : error.code === 'weak_password'
            ? 'La contraseña es muy corta o muy fácil. Probá con una más larga.'
            : error.code === 'email_address_invalid' || error.code === 'validation_failed'
              ? 'Ese email no es válido.'
              : error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit'
                ? 'Hubo demasiados intentos. Esperá unos minutos y probá de nuevo.'
                : error.code === 'signup_disabled'
                  ? 'Por ahora no se pueden crear cuentas nuevas.'
                  : 'No se pudo crear la cuenta. Probá de nuevo en unos minutos.',
      )
      setEnviando(false)
      return
    }

    if (!data.session) {
      // Con "Confirm email" activo, Supabase no da error si el email ya existe: devuelve un usuario sin identidades
      if (data.user && data.user.identities?.length === 0) {
        setError('Ya hay una cuenta con ese email. Probá iniciar sesión.')
      } else {
        setAviso('Te mandamos un email para confirmar la cuenta. Abrí el link y después iniciá sesión.')
      }
      setEnviando(false)
      return
    }

    // Con sesión: directo al Dashboard. replace: que "atrás" no vuelva al login; refresh: que el servidor lea la cookie nueva
    router.replace('/')
    router.refresh()
  }

  const describeError = error ? 'registro-error' : undefined

  return (
    <Card className="shadow-sm">
      <form onSubmit={crearCuenta} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="registro-email" className="text-small font-medium text-foreground">
            Email
          </label>
          <Input
            id="registro-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={describeError}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="registro-clave" className="text-small font-medium text-foreground">
            Contraseña
          </label>
          <Input
            id="registro-clave"
            type="password"
            autoComplete="new-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={describeError ?? 'registro-clave-ayuda'}
          />
          <p id="registro-clave-ayuda" className="text-small text-muted-foreground">
            Al menos {LARGO_MINIMO_CLAVE} caracteres.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="registro-repetir-clave" className="text-small font-medium text-foreground">
            Repetir contraseña
          </label>
          <Input
            id="registro-repetir-clave"
            type="password"
            autoComplete="new-password"
            value={repetirClave}
            onChange={(e) => setRepetirClave(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={describeError}
          />
        </div>

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>

        {error && (
          <p id="registro-error" role="alert" className="text-small text-danger">
            {error}
          </p>
        )}
        {aviso && (
          <p role="status" className="text-small text-foreground">
            {aviso}
          </p>
        )}
      </form>
    </Card>
  )
}
