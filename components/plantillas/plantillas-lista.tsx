'use client'

import { useState, type ReactNode } from 'react'
import { AlertTriangle, MessageSquareText, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { plantillasMock } from '@/lib/plantillas/mock'
import { MARCADOR_NOMBRE, type Plantilla } from '@/lib/plantillas/plantilla'
import { crearClienteNavegador } from '@/lib/supabase/client'

type Borrador = { id?: string; nombre: string; texto: string }

const ERROR_GUARDAR = 'No se pudo guardar la plantilla. Probá de nuevo.'

// Mismo estilo que los errores al guardar de nuevo-lead-form.tsx y Configuración
function AvisoError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg bg-estado-perdido p-3 text-small text-estado-perdido-foreground">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}

// Lista + alta/edición/baja de plantillas contra la tabla `plantillas` de Supabase.
// La lista local se actualiza con lo que devuelve la base (no antes), así nunca muestra algo que no se guardó.
export function PlantillasLista({ iniciales }: { iniciales: Plantilla[] }) {
  const [plantillas, setPlantillas] = useState(iniciales)
  const [borrador, setBorrador] = useState<Borrador | null>(null)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [errorLista, setErrorLista] = useState<string | null>(null)

  // Devuelve un mensaje de error para mostrar en el formulario, o null si salió bien
  async function guardar(b: Borrador): Promise<string | null> {
    const supabase = crearClienteNavegador()
    // Solo nombre y texto: id, user_id y fechas los completa la base (permisos por columna)
    const consulta = b.id
      ? supabase.from('plantillas').update({ nombre: b.nombre, texto: b.texto }).eq('id', b.id)
      : supabase.from('plantillas').insert({ nombre: b.nombre, texto: b.texto })
    const { data, error } = await consulta.select('id, nombre, texto').single()

    if (error || !data) {
      console.error('No se pudo guardar la plantilla:', error?.message)
      return ERROR_GUARDAR
    }
    const guardada = data as Plantilla
    setPlantillas((ps) => (b.id ? ps.map((p) => (p.id === guardada.id ? guardada : p)) : [guardada, ...ps]))
    setBorrador(null)
    return null
  }

  async function eliminar(id: string) {
    setOcupado(true)
    setErrorLista(null)
    const { error } = await crearClienteNavegador().from('plantillas').delete().eq('id', id)
    setOcupado(false)
    if (error) {
      console.error('No se pudo eliminar la plantilla:', error.message)
      setErrorLista('No se pudo eliminar la plantilla. Probá de nuevo.')
      return
    }
    setPlantillas((ps) => ps.filter((p) => p.id !== id))
    setConfirmandoBorrar(null)
  }

  // Solo con la lista vacía: carga las 3 plantillas de ejemplo (lib/plantillas/mock.ts) como plantillas propias
  async function cargarEjemplos() {
    setOcupado(true)
    setErrorLista(null)
    const { data, error } = await crearClienteNavegador()
      .from('plantillas')
      .insert(plantillasMock.map(({ nombre, texto }) => ({ nombre, texto })))
      .select('id, nombre, texto')
    setOcupado(false)
    if (error || !data) {
      console.error('No se pudieron cargar las plantillas de ejemplo:', error?.message)
      setErrorLista('No se pudieron cargar las plantillas de ejemplo. Probá de nuevo.')
      return
    }
    setPlantillas(data as Plantilla[])
  }

  const creando = borrador !== null && !borrador.id

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground">Plantillas</h1>
          <p className="text-small text-muted-foreground">
            Mensajes listos para usar desde la ficha de cada lead.
          </p>
        </div>
        <Button onClick={() => setBorrador({ nombre: '', texto: '' })} disabled={borrador !== null || ocupado}>
          <Plus aria-hidden />
          Nueva plantilla
        </Button>
      </div>

      {errorLista && <AvisoError>{errorLista}</AvisoError>}

      {creando && <FormPlantilla inicial={borrador} onGuardar={guardar} onCancelar={() => setBorrador(null)} />}

      {plantillas.length === 0 && !creando ? (
        <Card className="items-center py-12 text-center shadow-sm">
          <span className="grid size-12 place-items-center rounded-full bg-background text-secondary">
            <MessageSquareText className="size-6" aria-hidden />
          </span>
          <p className="text-body text-foreground">Todavía no tenés plantillas</p>
          <p className="max-w-sm text-small text-muted-foreground">
            Creá la tuya o empezá con tres de ejemplo (primer contacto, recordatorio y cierre) y editalas a tu gusto.
          </p>
          <Button variant="secondary" onClick={cargarEjemplos} disabled={ocupado}>
            {ocupado ? 'Cargando…' : 'Cargar plantillas de ejemplo'}
          </Button>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {plantillas.map((p) =>
            borrador?.id === p.id ? (
              <li key={p.id}>
                <FormPlantilla inicial={borrador} onGuardar={guardar} onCancelar={() => setBorrador(null)} />
              </li>
            ) : (
              <li key={p.id}>
                <Card className="gap-3 shadow-sm">
                  <CardTitle className="text-body font-medium">{p.nombre}</CardTitle>
                  <p className="line-clamp-2 text-small text-muted-foreground">{p.texto}</p>

                  {confirmandoBorrar === p.id ? (
                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3" role="group" aria-label="Confirmar eliminación">
                      <span className="text-small text-foreground">¿Eliminar «{p.nombre}»?</span>
                      <Button variant="secondary" onClick={() => eliminar(p.id)} disabled={ocupado}>
                        {ocupado ? 'Eliminando…' : 'Sí, eliminar'}
                      </Button>
                      <Button variant="link" onClick={() => setConfirmandoBorrar(null)} disabled={ocupado}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 border-t border-border pt-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setConfirmandoBorrar(null)
                          setErrorLista(null)
                          setBorrador(p)
                        }}
                        disabled={borrador !== null || ocupado}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setErrorLista(null)
                          setConfirmandoBorrar(p.id)
                        }}
                        disabled={borrador !== null || ocupado}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </Card>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}

function FormPlantilla({
  inicial,
  onGuardar,
  onCancelar,
}: {
  inicial: Borrador
  onGuardar: (b: Borrador) => Promise<string | null>
  onCancelar: () => void
}) {
  const [nombre, setNombre] = useState(inicial.nombre)
  const [texto, setTexto] = useState(inicial.texto)
  const [intento, setIntento] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const errorNombre = intento && !nombre.trim() ? 'Poné un nombre para reconocerla.' : undefined
  const errorTexto = intento && !texto.trim() ? 'Escribí el texto del mensaje.' : undefined
  const prefijo = inicial.id ? `editar-${inicial.id}` : 'nueva'

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntento(true)
    if (guardando || !nombre.trim() || !texto.trim()) return
    // Deshabilitado mientras viaja el pedido: un doble clic crearía la plantilla dos veces
    setGuardando(true)
    setErrorGuardado(null)
    const error = await onGuardar({ id: inicial.id, nombre: nombre.trim(), texto: texto.trim() })
    // Si salió bien, el formulario se desmonta; si no, queda abierto con el error y lo escrito
    if (error) {
      setErrorGuardado(error)
      setGuardando(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <CardTitle>{inicial.id ? 'Editar plantilla' : 'Nueva plantilla'}</CardTitle>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefijo}-nombre`} className="text-small font-medium text-foreground">
            Nombre
          </label>
          <Input
            id={`${prefijo}-nombre`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Seguimiento de presupuesto"
            aria-invalid={!!errorNombre || undefined}
            aria-describedby={errorNombre ? `${prefijo}-nombre-error` : undefined}
            autoFocus
          />
          {errorNombre && (
            <p id={`${prefijo}-nombre-error`} className="text-caption text-danger">
              {errorNombre}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefijo}-texto`} className="text-small font-medium text-foreground">
            Mensaje
          </label>
          <Textarea
            id={`${prefijo}-texto`}
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-invalid={!!errorTexto || undefined}
            aria-describedby={errorTexto ? `${prefijo}-texto-error` : `${prefijo}-texto-ayuda`}
          />
          {errorTexto ? (
            <p id={`${prefijo}-texto-error`} className="text-caption text-danger">
              {errorTexto}
            </p>
          ) : (
            <p id={`${prefijo}-texto-ayuda`} className="text-caption text-muted-foreground">
              Escribí {MARCADOR_NOMBRE} donde va el nombre del lead: se reemplaza solo al usarla.
            </p>
          )}
        </div>

        {errorGuardado && <AvisoError>{errorGuardado}</AvisoError>}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar plantilla'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
