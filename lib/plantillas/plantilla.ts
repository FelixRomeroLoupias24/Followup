export type Plantilla = { id: string; nombre: string; texto: string }

export const MARCADOR_NOMBRE = '{{nombre}}'

// Reemplaza {{nombre}} por el nombre de pila del lead ("María Rodríguez" → "María"), como el resto de los mensajes
export function aplicarPlantilla(texto: string, nombreLead: string): string {
  const nombre = nombreLead.trim().split(/\s+/)[0] ?? ''
  return texto.replaceAll(MARCADOR_NOMBRE, nombre)
}
