import * as React from 'react'

import { cn } from '@/lib/utils'

// Píldora del sistema de diseño §4.1: radio completo, padding 4px 10px, texto 12px medium.
// Sin className de color queda en gris neutro (mismo que el estado "Nuevo").
function Badge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-full bg-estado-nuevo px-2.5 py-1 text-caption font-medium whitespace-nowrap text-estado-nuevo-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
