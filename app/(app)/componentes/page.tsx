import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Vitrina temporal de componentes base — borrar cuando esté la pantalla de leads
export default function ComponentesPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 bg-background p-8">
      <h1>Componentes base</h1>

      <section className="flex flex-col gap-3">
        <h2>Botones</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Contactar ahora</Button>
          <Button variant="secondary">Ver detalle</Button>
          <Button variant="link">Ver todos</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Card</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>María Rodríguez</CardTitle>
              <CardDescription>Consultó por precio mayorista · hace 2 días</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button>Generar mensaje</Button>
              <Button variant="secondary">Editar</Button>
            </CardContent>
          </Card>
          <Card className="gap-2">
            <p className="text-caption text-muted-foreground">Venta perdida este mes</p>
            <p className="text-kpi text-danger">$1.240</p>
          </Card>
        </div>
      </section>

      <section className="flex max-w-sm flex-col gap-3">
        <h2>Input</h2>
        <Input placeholder="Nombre del lead" />
        <Input defaultValue="+54 9 11 5555-1234" />
        <Input placeholder="Teléfono inválido" aria-invalid />
        <Input placeholder="Deshabilitado" disabled />
      </section>
    </main>
  )
}
