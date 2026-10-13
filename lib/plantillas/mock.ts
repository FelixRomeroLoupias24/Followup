import type { Plantilla } from './plantilla'

// Plantillas precargadas de ejemplo.
// TODO: conectar a backend — tabla plantillas en Supabase (una por usuario, con RLS como leads)
export const plantillasMock: Plantilla[] = [
  {
    id: 'primer-contacto',
    nombre: 'Primer contacto',
    texto:
      '¡Hola {{nombre}}! Gracias por escribirnos. Te paso la info de lo que consultaste. ¿Tenés alguna duda o querés que te arme un presupuesto?',
  },
  {
    id: 'recordatorio',
    nombre: 'Recordatorio',
    texto:
      '¡Hola {{nombre}}! ¿Cómo andás? Te escribo para saber si pudiste ver lo que te pasé. Si querés lo vemos juntos o te cuento más. ¡Avisame!',
  },
  {
    id: 'cierre',
    nombre: 'Cierre',
    texto:
      '¡Hola {{nombre}}! Te confirmo que quedó todo listo con tu pedido. Cualquier cosa que necesites, escribime por acá. ¡Gracias por elegirnos!',
  },
]
