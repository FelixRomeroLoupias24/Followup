'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useAcciones, type NuevoLead } from '@/lib/datos/acciones'
import { ETAPAS, estaCerrado } from '@/lib/leads/estado'
import type { Etapa } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

type Campos = { nombre: string; telefono: string; consulta: string; etapa: Etapa; proximoContacto: string; monto: string }
type Errores = Partial<Record<keyof Campos, string>>

const VACIO: Campos = { nombre: '', telefono: '', consulta: '', etapa: 'nuevo', proximoContacto: '', monto: '' }

function validar(c: Campos): Errores {
  const errores: Errores = {}
  if (!c.nombre.trim()) errores.nombre = 'Ingresá el nombre del lead.'
  if (!c.telefono.trim()) errores.telefono = 'Ingresá un teléfono.'
  if (!c.consulta.trim()) errores.consulta = 'Contá qué consultó.'
  if (c.monto !== '' && !(Number(c.monto) >= 0)) errores.monto = 'El monto tiene que ser un número positivo.'
  return errores
}

// "2026-10-08" → Date local (new Date("2026-10-08") lo tomaría en UTC y podría correrse un día)
function fechaLocal(valor: string): Date {
  const [anio, mes, dia] = valor.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

// Date local → "2026-10-08", el formato de un input date (sin pasar por UTC)
function aFechaIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function hoyIso(): string {
  return aFechaIso(new Date())
}

export function NuevoLeadForm() {
  const router = useRouter()
  const acciones = useAcciones()
  const [campos, setCampos] = useState<Campos>(VACIO)
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  // Los errores aparecen recién después del primer intento, y desde ahí se actualizan al escribir
  const errores = intentoEnviar ? validar(campos) : {}
  const cerrado = estaCerrado({ etapa: campos.etapa })

  function cambiar<K extends keyof Campos>(campo: K, valor: Campos[K]) {
    setCampos((c) => ({ ...c, [campo]: valor }))
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnviar(true)
    if (guardando || Object.keys(validar(campos)).length > 0) return

    const lead: NuevoLead = {
      nombre: campos.nombre.trim(),
      telefono: campos.telefono.trim(),
      consulta: campos.consulta.trim(),
      etapa: campos.etapa,
      // Igual que el trigger de la base: un lead cerrado no tiene recordatorio
      proximoContacto: cerrado || !campos.proximoContacto ? null : fechaLocal(campos.proximoContacto),
      monto: campos.monto === '' ? null : Number(campos.monto),
    }

    // Mientras viaja el insert el botón queda deshabilitado: un doble clic crearía el lead dos veces
    setGuardando(true)
    setErrorGuardado(null)
    const id = await acciones.crearLead(lead)

    if (!id) {
      setErrorGuardado('No se pudo guardar el lead. Revisá tu conexión y probá de nuevo.')
      setGuardando(false)
      return
    }

    setEnviado(true)
    // Unos segundos para que se lea la confirmación; después, directo a la ficha del lead nuevo
    setTimeout(() => router.push(`/leads/${id}`), 1500)
  }

  return (
    <Card className="gap-5 shadow-sm">
      <form onSubmit={guardar} noValidate className="flex flex-col gap-5">
        {errorGuardado && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-estado-perdido p-3 text-small text-estado-perdido-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {errorGuardado}
          </p>
        )}

        <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
          <Input
            id="nombre"
            value={campos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            aria-invalid={!!errores.nombre || undefined}
            aria-describedby={errores.nombre ? 'nombre-error' : undefined}
            autoComplete="off"
          />
        </Campo>

        <Campo id="telefono" etiqueta="Teléfono" error={errores.telefono}>
          <Input
            id="telefono"
            type="tel"
            inputMode="tel"
            placeholder="+54 9 11 1234-5678"
            value={campos.telefono}
            onChange={(e) => cambiar('telefono', e.target.value)}
            aria-invalid={!!errores.telefono || undefined}
            aria-describedby={errores.telefono ? 'telefono-error' : undefined}
          />
        </Campo>

        <Campo id="consulta" etiqueta="Consulta" ayuda="Qué preguntó el lead." error={errores.consulta}>
          <Textarea
            id="consulta"
            rows={3}
            value={campos.consulta}
            onChange={(e) => cambiar('consulta', e.target.value)}
            aria-invalid={!!errores.consulta || undefined}
            aria-describedby={errores.consulta ? 'consulta-error' : 'consulta-ayuda'}
          />
        </Campo>

        <Campo id="etapa" etiqueta="Etapa inicial">
          <NativeSelect
            id="etapa"
            value={campos.etapa}
            onChange={(e) => cambiar('etapa', e.target.value as Etapa)}
            className="w-full"
          >
            {ETAPAS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.texto}
              </option>
            ))}
          </NativeSelect>
        </Campo>

        <Campo
          id="proximo"
          etiqueta="Próximo contacto"
          opcional
          ayuda={cerrado ? 'Un lead convertido o perdido no lleva recordatorio.' : 'Si lo dejás vacío, no hay recordatorio.'}
        >
          <Input
            id="proximo"
            type="date"
            min={hoyIso()}
            value={cerrado ? '' : campos.proximoContacto}
            onChange={(e) => cambiar('proximoContacto', e.target.value)}
            disabled={cerrado}
            aria-describedby="proximo-ayuda"
          />
        </Campo>

        <Campo id="monto" etiqueta="Monto estimado" opcional ayuda="En pesos. Se usa para calcular la venta perdida o convertida." error={errores.monto}>
          <Input
            id="monto"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="0"
            value={campos.monto}
            onChange={(e) => cambiar('monto', e.target.value)}
            aria-invalid={!!errores.monto || undefined}
            aria-describedby={errores.monto ? 'monto-error' : 'monto-ayuda'}
          />
        </Campo>

        {enviado && (
          <p role="status" className="flex items-start gap-2 rounded-lg bg-background p-3 text-small text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            Lead guardado. Abriendo su ficha…
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Link href="/" className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancelar
          </Link>
          <Button type="submit" disabled={guardando || enviado}>
            {guardando && !enviado ? 'Guardando…' : 'Guardar lead'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function Campo({
  id,
  etiqueta,
  opcional,
  ayuda,
  error,
  children,
}: {
  id: string
  etiqueta: string
  opcional?: boolean
  ayuda?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-foreground">
        {etiqueta}
        {opcional && <span className="font-normal text-muted-foreground"> (opcional)</span>}
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
