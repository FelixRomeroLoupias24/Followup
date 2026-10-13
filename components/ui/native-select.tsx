import * as React from 'react'

import { cn } from '@/lib/utils'

// <select> nativo con el mismo estilo que Input (borde, radio 8px, foco verde)
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground outline-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
