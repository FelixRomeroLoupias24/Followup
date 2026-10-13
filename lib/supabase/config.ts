// Credenciales públicas del proyecto de Supabase (frontend/app/.env.local).
// La anon key es pública por diseño: lo que protege los datos son las políticas RLS de la base.
export function configSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en frontend/app/.env.local')
  }
  return { url, anonKey }
}
