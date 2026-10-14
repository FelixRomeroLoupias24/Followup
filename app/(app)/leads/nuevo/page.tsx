import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { NuevoLeadForm } from '@/components/leads/nuevo-lead-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Header y sidebar los pone app/(app)/layout.tsx. El formulario guarda en memoria (ProveedorDemo).
export default function DemoNuevoLeadPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 md:gap-6 md:px-8 md:py-8">
      <Link href="/" className={cn(buttonVariants({ variant: 'link' }), 'self-start px-0')}>
        <ArrowLeft aria-hidden />
        Volver a mis leads
      </Link>

      <h1 className="text-foreground">Nuevo lead</h1>

      <NuevoLeadForm />
    </main>
  )
}
