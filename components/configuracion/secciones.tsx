'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, MessageCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { RUBROS, type Cuenta, type Rubro } from '@/lib/cuenta/mock'
import { crearClienteNavegador } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------------------------------------------
// Piezas comunes

// Aviso breve de éxito tras "Guardar cambios"
function useAviso() {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  function mostrar() {
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 4000)
  }
  return { visible, mostrar }
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-2 rounded-lg bg-background p-3 text-small text-foreground">
      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      {children}
    </p>
  )
}

// Mismo estilo que el error al guardar de nuevo-lead-form.tsx
function AvisoError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg bg-estado-perdido p-3 text-small text-estado-perdido-foreground">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}

const AVISO_GUARDADO = 'Cambios guardados.'
const ERROR_GUARDADO = 'No se pudo guardar. Probá de nuevo.'

type CambiosConfiguracion = Partial<{
  nombre_negocio: string
  rubro: Rubro
  dias_sin_seguimiento: number
  notificaciones_vencidos: boolean
}>

// Una fila por usuario: upsert la crea la primera vez y después la actualiza. user_id lo pone la base (auth.uid())
// y solo se mandan las columnas de la sección, así guardar una no pisa los valores de la otra.
async function guardarConfiguracion(cambios: CambiosConfiguracion): Promise<boolean> {
  const { error } = await crearClienteNavegador().from('configuracion_negocio').upsert(cambios, { onConflict: 'user_id' })
  if (error) console.error('No se pudo guardar la configuración:', error.message)
  return !error
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <Card className="gap-5 shadow-sm">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        {descripcion && <CardDescription>{descripcion}</CardDescription>}
      </CardHeader>
      {children}
    </Card>
  )
}

function Campo({ id, etiqueta, ayuda, error, children }: { id: string; etiqueta: string; ayuda?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-foreground">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-caption text-danger">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-ayuda`} className="text-caption text-muted-foreground">
            {ayuda}
          </p>
        )
      )}
    </div>
  )
}

function PieGuardar({ deshabilitado }: { deshabilitado?: boolean }) {
  return (
    <div className="flex border-t border-border pt-5 sm:justify-end">
      <Button type="submit" disabled={deshabilitado} className="w-full sm:w-auto">
        {deshabilitado ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 1. Datos de mi negocio

export function SeccionNegocio({ cuenta }: { cuenta: Cuenta }) {
  const router = useRouter()
  const [nombre, setNombre] = useState(cuenta.nombreNegocio)
  const [rubro, setRubro] = useState<Rubro>(cuenta.rubro)
  const [intento, setIntento] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const aviso = useAviso()
  const error = intento && !nombre.trim() ? 'Ingresá el nombre del negocio.' : undefined

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntento(true)
    if (guardando || !nombre.trim()) return
    setGuardando(true)
    setErrorGuardado(null)
    const ok = await guardarConfiguracion({ nombre_negocio: nombre.trim(), rubro })
    setGuardando(false)
    if (!ok) {
      setErrorGuardado(ERROR_GUARDADO)
      return
    }
    aviso.mostrar()
    // El layout compartido no se vuelve a pedir al navegar: refrescar para que el sidebar muestre el nombre nuevo
    router.refresh()
  }

  return (
    <Seccion titulo="Datos de mi negocio">
      <form onSubmit={guardar} noValidate className="flex flex-col gap-5">
        <Campo id="nombre-negocio" etiqueta="Nombre del negocio" error={error}>
          <Input
            id="nombre-negocio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'nombre-negocio-error' : undefined}
          />
        </Campo>
        <Campo id="rubro" etiqueta="Rubro">
          <NativeSelect id="rubro" value={rubro} onChange={(e) => setRubro(e.target.value as Rubro)} className="w-full">
            {RUBROS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </NativeSelect>
        </Campo>
        {errorGuardado ? <AvisoError>{errorGuardado}</AvisoError> : aviso.visible && <Aviso>{AVISO_GUARDADO}</Aviso>}
        <PieGuardar deshabilitado={guardando} />
      </form>
    </Seccion>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 2. Recordatorios

export function SeccionRecordatorios({ cuenta }: { cuenta: Cuenta }) {
  const [dias, setDias] = useState(String(cuenta.diasSinSeguimiento))
  const [notificaciones, setNotificaciones] = useState(cuenta.notificacionesVencidos)
  const [intento, setIntento] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const aviso = useAviso()
  const n = Number(dias)
  const error = intento && !(Number.isInteger(n) && n >= 1 && n <= 30) ? 'Elegí un número de días entre 1 y 30.' : undefined

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntento(true)
    if (guardando || !(Number.isInteger(n) && n >= 1 && n <= 30)) return
    setGuardando(true)
    setErrorGuardado(null)
    const ok = await guardarConfiguracion({ dias_sin_seguimiento: n, notificaciones_vencidos: notificaciones })
    setGuardando(false)
    if (ok) aviso.mostrar()
    else setErrorGuardado(ERROR_GUARDADO)
  }

  return (
    <Seccion titulo="Recordatorios">
      <form onSubmit={guardar} noValidate className="flex flex-col gap-5">
        <Campo
          id="dias"
          etiqueta="Avisar si no hay seguimiento después de (días)"
          ayuda="Se usa como fecha sugerida de próximo contacto después de escribirle a un lead."
          error={error}
        >
          <Input
            id="dias"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            step={1}
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'dias-error' : 'dias-ayuda'}
            className="sm:w-32"
          />
        </Campo>

        <div className="flex items-center justify-between gap-4">
          {/* Base UI pone el id en un input oculto: el nombre accesible del switch visible va por aria-labelledby */}
          <label htmlFor="notificaciones" className="flex flex-col gap-0.5">
            <span id="notificaciones-texto" className="text-small font-medium text-foreground">
              Recibir notificaciones de recordatorios vencidos
            </span>
            <span id="notificaciones-ayuda" className="text-caption text-muted-foreground">
              Aparecen en la campanita de arriba a la derecha.
            </span>
          </label>
          <Switch
            id="notificaciones"
            checked={notificaciones}
            onCheckedChange={setNotificaciones}
            aria-labelledby="notificaciones-texto"
            aria-describedby="notificaciones-ayuda"
          />
        </div>

        {errorGuardado ? <AvisoError>{errorGuardado}</AvisoError> : aviso.visible && <Aviso>{AVISO_GUARDADO}</Aviso>}
        <PieGuardar deshabilitado={guardando} />
      </form>
    </Seccion>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 3. WhatsApp Business (deshabilitado a propósito en la v1)

export function SeccionWhatsApp() {
  return (
    <Seccion titulo="WhatsApp Business">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {/* lucide no trae logos de marcas: burbuja de mensaje en el verde de marca */}
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-primary">
            <MessageCircle className="size-5" aria-hidden />
          </span>
          <p className="text-body text-muted-foreground">
            Conectá tu cuenta de WhatsApp Business para automatizar la carga de leads.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* TODO: conectar a backend — integración con la API de WhatsApp Business (fuera de alcance en la v1) */}
          <Button disabled aria-describedby="whatsapp-pronto">
            Conectar
          </Button>
          <Badge id="whatsapp-pronto">Próximamente</Badge>
        </div>
      </div>
    </Seccion>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 4. Cuenta

export function SeccionCuenta({ cuenta }: { cuenta: Cuenta }) {
  const [avisoClave, setAvisoClave] = useState(false)

  return (
    <Seccion titulo="Cuenta">
      <dl className="flex flex-col gap-1">
        <dt className="text-caption text-muted-foreground">Email</dt>
        <dd className="text-body text-foreground">{cuenta.email}</dd>
      </dl>
      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        {/* TODO: conectar a backend — supabase.auth.resetPasswordForEmail / updateUser cuando haya login */}
        <Button variant="secondary" onClick={() => setAvisoClave(true)} className="w-full sm:w-auto">
          Cambiar contraseña
        </Button>
      </div>
      {avisoClave && <Aviso>Vas a poder cambiar la contraseña cuando activemos el inicio de sesión.</Aviso>}
    </Seccion>
  )
}
