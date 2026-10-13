import {
  SeccionCuenta,
  SeccionNegocio,
  SeccionRecordatorios,
  SeccionWhatsApp,
} from '@/components/configuracion/secciones'
import { obtenerCuenta } from '@/lib/cuenta/datos'

export default async function ConfiguracionPage() {
  const cuenta = await obtenerCuenta()

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground">Configuración</h1>
        <p className="text-small text-muted-foreground">Los datos de tu negocio y cómo querés recibir los recordatorios.</p>
      </div>

      <SeccionNegocio cuenta={cuenta} />
      <SeccionRecordatorios cuenta={cuenta} />
      <SeccionWhatsApp />
      <SeccionCuenta cuenta={cuenta} />
    </main>
  )
}
