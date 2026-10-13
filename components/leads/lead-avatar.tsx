import { cn } from '@/lib/utils'

const TAMANOS = {
  md: 'size-9 text-small',
  lg: 'size-16 text-h1',
}

// Inicial del nombre, sin color por estado (el color lo dan el badge y la barra)
export function LeadAvatar({ nombre, tamano = 'md' }: { nombre: string; tamano?: keyof typeof TAMANOS }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-estado-nuevo font-medium text-secondary',
        TAMANOS[tamano],
      )}
      aria-hidden
    >
      {nombre.charAt(0)}
    </span>
  )
}
