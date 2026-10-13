// Formatos propios de los gráficos (los de montos y porcentajes completos están en lib/metricas.ts)

// Ejes: "$ 400 mil"
export function formatoMontoCompacto(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(monto)
}

// "4,5 días"
export function formatoDias(dias: number): string {
  const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(dias)
  return `${numero} ${dias === 1 ? 'día' : 'días'}`
}
