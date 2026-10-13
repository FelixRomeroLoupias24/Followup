import { PlantillasLista } from '@/components/plantillas/plantillas-lista'
import { obtenerPlantillas } from '@/lib/plantillas/datos'

export default async function PlantillasPage() {
  const plantillas = await obtenerPlantillas()

  return (
    <main className="mx-auto flex max-w-3xl flex-col px-4 py-6 md:px-8 md:py-8">
      <PlantillasLista iniciales={plantillas} />
    </main>
  )
}
