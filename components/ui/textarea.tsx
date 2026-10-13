import * as React from 'react'

import { cn } from '@/lib/utils'

// Mismo estilo que Input, en varias líneas
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-28 w-full rounded-lg border border-input bg-card px-4 py-2 text-body text-foreground transition-colors outline-none placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-background disabled:opacity-50',
        'aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
