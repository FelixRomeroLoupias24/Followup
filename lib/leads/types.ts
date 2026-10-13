// Etapas guardadas del lead (ficha-proyecto.md §4)
export type Etapa = 'nuevo' | 'contactado' | 'siguiendo' | 'perdido' | 'convertido'

export type Lead = {
  id: string
  nombre: string
  telefono: string
  consulta: string
  etapa: Etapa
  ultimoContacto: Date | null
  proximoContacto: Date | null
  monto: number | null
}

// Historial del lead — misma forma que la tabla interacciones (backend/modelo-y-api.md §1.3)
export type TipoInteraccion = 'mensaje_enviado' | 'respuesta_recibida' | 'nota' | 'cambio_etapa'

export type Interaccion = {
  id: string
  leadId: string
  tipo: TipoInteraccion
  nota: string | null
  fecha: Date
}
