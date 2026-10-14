'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, Copy, MessageCircle, Send } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useAcciones } from '@/lib/datos/acciones'
import { estaCerrado } from '@/lib/leads/estado'
import type { Lead } from '@/lib/leads/types'
import { aplicarPlantilla, type Plantilla } from '@/lib/plantillas/plantilla'
import { cn } from '@/lib/utils'

function hoyMasDias(dias: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d
}

// Mensaje de seguimiento armado desde una plantilla (sin IA): se edita, se copia para pegar en WhatsApp
// y, aparte, se marca como enviado (eso es lo que queda en el historial y agenda el próximo contacto).
export function GeneradorMensaje({
  lead,
  diasSinSeguimiento,
  plantillas,
}: {
  lead: Lead
  diasSinSeguimiento: number
  plantillas: Plantilla[]
}) {
  const acciones = useAcciones()
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [copia, setCopia] = useState<'nada' | 'copiado' | 'error'>('nada')
  const [plantillaId, setPlantillaId] = useState('')
  // Texto que ya quedó registrado como enviado. Si el texto actual es el mismo, el botón queda en "Enviado";
  // al elegir otra plantilla o editar el texto a mano deja de coincidir y se puede volver a marcar.
  const [textoRegistrado, setTextoRegistrado] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)

  const yaEnviado = mensaje !== null && mensaje === textoRegistrado

  function usarPlantilla(id: string) {
    setPlantillaId(id)
    const plantilla = plantillas.find((p) => p.id === id)
    if (!plantilla) return
    setMensaje(aplicarPlantilla(plantilla.texto, lead.nombre))
    setCopia('nada')
    setTextoRegistrado(null)
    setErrorEnvio(null)
  }

  // "Marcar como enviado": queda en el historial y se agenda el próximo contacto
  async function registrarEnvio(texto: string) {
    if (enviando || texto === textoRegistrado) return
    setEnviando(true)
    setErrorEnvio(null)
    const [envioOk, recordatorioOk] = await Promise.all([
      acciones.registrarMensajeEnviado(lead.id, texto),
      // Un lead convertido o perdido no lleva recordatorio: no se toca
      estaCerrado(lead) ? Promise.resolve(true) : acciones.agendarProximoContacto(lead.id, hoyMasDias(diasSinSeguimiento)),
    ])
    setEnviando(false)

    if (!envioOk) {
      // Sin registro en el historial no cuenta como enviado: el botón queda habilitado para reintentar
      setErrorEnvio('No se pudo marcar como enviado. Probá de nuevo.')
    } else {
      setTextoRegistrado(texto)
    }
    if (!recordatorioOk && envioOk) setErrorEnvio('Se marcó como enviado, pero no se pudo agendar el próximo contacto.')
  }

  // Solo copia al portapapeles: no registra nada
  async function copiar() {
    if (!mensaje) return
    try {
      await navigator.clipboard.writeText(mensaje)
      setCopia('copiado')
    } catch {
      // Sin permiso de portapapeles (o sin HTTPS): seleccionar el texto y probar el método clásico
      textarea.current?.select()
      setCopia(document.execCommand('copy') ? 'copiado' : 'error')
    }
    setTimeout(() => setCopia((c) => (c === 'copiado' ? 'nada' : c)), 2000)
  }

  const selectorPlantilla = (
    <NativeSelect
      value={plantillaId}
      onChange={(e) => usarPlantilla(e.target.value)}
      aria-label="Usar plantilla"
      className="w-full sm:w-auto"
    >
      <option value="">Usar plantilla…</option>
      {plantillas.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nombre}
        </option>
      ))}
    </NativeSelect>
  )

  return (
    <Card className="gap-4 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" aria-hidden />
          Mensaje de seguimiento
        </CardTitle>
        {mensaje !== null && (
          <CardDescription>Copialo, mandalo por WhatsApp y después marcalo como enviado.</CardDescription>
        )}
      </CardHeader>

      {plantillas.length === 0 ? (
        // Sin plantillas no hay de dónde armar el mensaje: llevar a crearlas
        <div className="flex flex-col items-start gap-2">
          <p className="text-small text-muted-foreground">Todavía no tenés plantillas para armar el mensaje.</p>
          <Link href="/plantillas" className={cn(buttonVariants({ variant: 'link' }), 'px-0')}>
            Crear una plantilla
          </Link>
        </div>
      ) : mensaje === null ? (
        <div className="flex flex-col gap-2">
          <p className="text-small text-muted-foreground">Elegí una plantilla para armar el mensaje.</p>
          {selectorPlantilla}
        </div>
      ) : (
        <>
          <Textarea
            ref={textarea}
            value={mensaje}
            onChange={(e) => {
              setMensaje(e.target.value)
              setCopia('nada')
              setErrorEnvio(null)
            }}
            aria-label="Mensaje de seguimiento"
            rows={5}
            className="border-secondary/30 bg-background leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={copiar}>
              {copia === 'copiado' ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copia === 'copiado' ? 'Copiado' : 'Copiar mensaje'}
            </Button>
            <Button onClick={() => registrarEnvio(mensaje)} disabled={enviando || yaEnviado}>
              {yaEnviado ? <Check aria-hidden /> : <Send aria-hidden />}
              {enviando ? 'Guardando…' : yaEnviado ? 'Enviado' : 'Marcar como enviado'}
            </Button>
            <div className="w-full sm:ml-auto sm:w-auto">{selectorPlantilla}</div>
          </div>
          {copia === 'error' && (
            <p className="text-small text-muted-foreground" role="status">
              No se pudo copiar automáticamente. El texto quedó seleccionado: copialo con Ctrl+C (o Cmd+C).
            </p>
          )}
          {errorEnvio && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-estado-perdido p-3 text-small text-estado-perdido-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {errorEnvio}
            </p>
          )}
        </>
      )}
    </Card>
  )
}
