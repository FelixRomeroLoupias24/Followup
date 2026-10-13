import { crearClienteServidor } from '@/lib/supabase/server'

import type { Plantilla } from './plantilla'

// Plantillas del usuario con sesión (RLS ya filtra por user_id), las más nuevas primero.
// Tabla: backend/supabase/migrations/20261008130000_plantillas.sql
export async function obtenerPlantillas(): Promise<Plantilla[]> {
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase
    .from('plantillas')
    .select('id, nombre, texto')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('No se pudieron leer las plantillas:', error.message)
    return []
  }
  return data as Plantilla[]
}
