// Datos de la cuenta y del negocio hasta que haya login y backend.
// TODO: conectar a backend — leer de Supabase Auth (email) y de una tabla de configuración del negocio

export const RUBROS = ['Indumentaria', 'Gastronomía', 'Servicios', 'Otro'] as const
export type Rubro = (typeof RUBROS)[number]

export type Cuenta = {
  nombreNegocio: string
  rubro: Rubro
  email: string
  diasSinSeguimiento: number
  notificacionesVencidos: boolean
}

export const cuentaMock: Cuenta = {
  nombreNegocio: 'Mi negocio',
  rubro: 'Indumentaria',
  email: 'cuenta@followup.app',
  diasSinSeguimiento: 2,
  notificacionesVencidos: true,
}
