import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/lib/utils'

// El sistema de diseño no detalla inputs: mismo borde que las cards,
// mismo radio y padding que los botones, foco en el verde primario.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 rounded-lg border border-input bg-card px-4 py-2 text-body text-foreground transition-colors outline-none placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-background disabled:opacity-50',
        'aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
