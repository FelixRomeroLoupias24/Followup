import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Tamaños de texto del sistema de diseño (globals.css). Sin esto, tailwind-merge
// los confunde con colores y borra "text-kpi" si después viene "text-danger".
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['h1', 'h2', 'body', 'small', 'caption', 'kpi'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
