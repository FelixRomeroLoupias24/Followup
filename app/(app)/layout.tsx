import { ProveedorDemo } from '@/components/demo/proveedor-demo'

// Todas las pantallas (Dashboard, leads, plantillas, analíticas, configuración) pasan por acá.
// FollowUp es una demo pública: sin login ni backend. ProveedorDemo pone el cartel de demo, el sidebar y el header,
// y guarda los datos de ejemplo (lib/demo) en memoria del navegador.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProveedorDemo>{children}</ProveedorDemo>
}
