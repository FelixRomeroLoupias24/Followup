'use client'

import { useDemo } from '@/components/demo/proveedor-demo'
import { PlantillasLista } from '@/components/plantillas/plantillas-lista'

// Plantillas de ejemplo en memoria (ProveedorDemo)
export default function DemoPlantillasPage() {
  const { plantillas } = useDemo()

  return (
    <main className="mx-auto flex max-w-3xl flex-col px-4 py-6 md:px-8 md:py-8">
      <PlantillasLista iniciales={plantillas} />
    </main>
  )
}
