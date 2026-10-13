import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '@/lib/utils'

// Interruptor on/off: verde primario encendido, gris de hover apagado, foco igual que Input
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-border p-0.5 transition-colors outline-none',
        'data-checked:border-primary data-checked:bg-primary data-unchecked:bg-accent',
        'focus-visible:ring-3 focus-visible:ring-ring/40',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block size-4.5 rounded-full bg-foreground transition-transform data-checked:translate-x-4 data-checked:bg-primary-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
