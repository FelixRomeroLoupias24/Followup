'use client'

import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatoMontoCompacto } from '@/lib/analitica/formato'
import type { ConteoEstado } from '@/lib/analitica/leads-por-estado'
import type { PuntoMensual, PuntoSemanal } from '@/lib/analitica/mock'
import type { EstadoVisual } from '@/lib/leads/estado'
import { formatoMonto, formatoPorcentaje } from '@/lib/metricas'
import { cn } from '@/lib/utils'

// Todo sale de los tokens de globals.css (paleta §6.1): nada de hex sueltos
const COLOR = {
  perdida: 'var(--danger)',
  convertida: 'var(--success)',
  marca: 'var(--primary)',
  superficie: 'var(--card)',
  grilla: 'var(--border)',
  ejes: 'var(--muted-foreground)',
}

// Mismo color que el texto de cada badge (lead-status-badge.tsx); el fondo oscuro del badge no se vería como barra
const COLOR_ESTADO: Record<EstadoVisual, string> = {
  nuevo: 'var(--estado-nuevo-foreground)',
  'en-seguimiento': 'var(--estado-seguimiento-foreground)',
  'contactar-hoy': 'var(--estado-hoy-foreground)',
  'venta-perdida': 'var(--estado-perdido-foreground)',
  convertido: 'var(--estado-convertido-foreground)',
}

const EJE = {
  tick: { fill: COLOR.ejes, fontSize: 12 },
  axisLine: { stroke: COLOR.grilla },
  tickLine: false,
} as const

const CURSOR_LINEA = { stroke: COLOR.ejes, strokeOpacity: 0.5, strokeWidth: 1 }
const CURSOR_BARRA = { fill: 'var(--accent)' }

// ---------------------------------------------------------------------------------------------------------------
// Piezas comunes

type Columna = { titulo: string; alinear?: 'right' }

function TarjetaGrafico({
  titulo,
  descripcion,
  leyenda,
  tabla,
  className,
  children,
}: {
  titulo: string
  descripcion?: string
  leyenda?: ReactNode
  tabla: { columnas: Columna[]; filas: (string | number)[][] }
  className?: string
  children: ReactNode
}) {
  return (
    <Card className={cn('gap-4 shadow-sm', className)}>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        {descripcion && <CardDescription>{descripcion}</CardDescription>}
      </CardHeader>
      {leyenda}
      {children}
      {/* Vista de tabla: los mismos datos sin depender del color ni del mouse */}
      <details className="text-small text-muted-foreground">
        <summary className="cursor-pointer select-none hover:text-foreground">Ver datos en tabla</summary>
        <table className="mt-3 w-full tabular-nums">
          <thead>
            <tr className="border-b border-border text-caption">
              {tabla.columnas.map((c) => (
                <th key={c.titulo} className={cn('py-2 font-medium', c.alinear === 'right' ? 'text-right' : 'text-left')}>
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabla.filas.map((fila, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                {fila.map((celda, j) => (
                  <td
                    key={j}
                    className={cn('py-2', tabla.columnas[j]?.alinear === 'right' ? 'text-right' : 'text-left', j === 0 && 'text-foreground')}
                  >
                    {celda}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  )
}

type Forma = 'circulo' | 'cuadrado' | 'barra'

function Muestra({ color, forma }: { color: string; forma: Forma }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block shrink-0', forma === 'circulo' && 'size-2.5 rounded-full', forma === 'cuadrado' && 'size-2.5 rounded-[2px]', forma === 'barra' && 'h-2.5 w-2.5 rounded-[2px]')}
      style={{ backgroundColor: color }}
    />
  )
}

// El texto va en tokens de texto; el color lo lleva la muestra al lado (nunca el texto)
function Leyenda({ items }: { items: { texto: string; color: string; forma: Forma }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted-foreground">
      {items.map((item) => (
        <li key={item.texto} className="flex items-center gap-2">
          <Muestra color={item.color} forma={item.forma} />
          {item.texto}
        </li>
      ))}
    </ul>
  )
}

type FilaTooltip = { texto: string; valor: string; color: string; forma: Forma }

function CajaTooltip({ titulo, filas }: { titulo: string; filas: FilaTooltip[] }) {
  return (
    <div className="min-w-40 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="mb-1 text-caption font-medium text-foreground">{titulo}</p>
      <ul className="flex flex-col gap-1">
        {filas.map((f) => (
          <li key={f.texto} className="flex items-center justify-between gap-4 text-caption">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Muestra color={f.color} forma={f.forma} />
              {f.texto}
            </span>
            <span className="font-medium text-foreground tabular-nums">{f.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Marcadores: círculo y cuadrado distintos, así las dos series no dependen solo del color (rojo/verde)
type PropsPunto = { cx?: number; cy?: number; index?: number }

function PuntoCirculo({ cx, cy, color, r = 4 }: PropsPunto & { color: string; r?: number }) {
  if (cx == null || cy == null) return null
  return <circle cx={cx} cy={cy} r={r} fill={color} stroke={COLOR.superficie} strokeWidth={2} />
}

function PuntoCuadrado({ cx, cy, color, lado = 8 }: PropsPunto & { color: string; lado?: number }) {
  if (cx == null || cy == null) return null
  return (
    <rect x={cx - lado / 2} y={cy - lado / 2} width={lado} height={lado} rx={1.5} fill={color} stroke={COLOR.superficie} strokeWidth={2} />
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 1. Venta perdida vs. venta convertida (2 series, mismo eje en pesos)

export function GraficoVentas({ datos }: { datos: PuntoMensual[] }) {
  const ultimo = datos.length - 1
  // Etiqueta directa al final de cada línea (refuerzo de la leyenda), en color de texto
  const etiquetaFinal = (texto: string) =>
    function Etiqueta({ x, y, index }: { x?: number | string; y?: number | string; index?: number }) {
      if (index !== ultimo || x == null || y == null) return null
      return (
        <text x={Number(x) + 10} y={Number(y) + 4} fill="var(--muted-foreground)" fontSize={12}>
          {texto}
        </text>
      )
    }

  return (
    <TarjetaGrafico
      titulo="Venta perdida vs. venta convertida"
      descripcion="Últimos 6 meses · el mes actual está en curso"
      className="lg:col-span-2"
      leyenda={
        <Leyenda
          items={[
            { texto: 'Venta perdida', color: COLOR.perdida, forma: 'cuadrado' },
            { texto: 'Venta convertida', color: COLOR.convertida, forma: 'circulo' },
          ]}
        />
      }
      tabla={{
        columnas: [{ titulo: 'Mes' }, { titulo: 'Venta perdida', alinear: 'right' }, { titulo: 'Venta convertida', alinear: 'right' }],
        filas: datos.map((d) => [d.mes, formatoMonto(d.ventaPerdida), formatoMonto(d.ventaConvertida)]),
      }}
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 84, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={COLOR.grilla} vertical={false} />
            <XAxis dataKey="mes" {...EJE} />
            <YAxis {...EJE} axisLine={false} width={72} tickFormatter={(v: number) => formatoMontoCompacto(v)} />
            <Tooltip
              cursor={CURSOR_LINEA}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <CajaTooltip
                    titulo={String(label)}
                    filas={[
                      { texto: 'Venta perdida', valor: formatoMonto(Number(payload[0].payload.ventaPerdida)), color: COLOR.perdida, forma: 'cuadrado' },
                      { texto: 'Venta convertida', valor: formatoMonto(Number(payload[0].payload.ventaConvertida)), color: COLOR.convertida, forma: 'circulo' },
                    ]}
                  />
                ) : null
              }
            />
            <Line
              isAnimationActive={false}
              dataKey="ventaPerdida"
              name="Venta perdida"
              stroke={COLOR.perdida}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={(p: PropsPunto) => <PuntoCuadrado key={p.index} {...p} color={COLOR.perdida} />}
              activeDot={(p: PropsPunto) => <PuntoCuadrado key={p.index} {...p} color={COLOR.perdida} lado={10} />}
              label={etiquetaFinal('Perdida')}
            />
            <Line
              isAnimationActive={false}
              dataKey="ventaConvertida"
              name="Venta convertida"
              stroke={COLOR.convertida}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={(p: PropsPunto) => <PuntoCirculo key={p.index} {...p} color={COLOR.convertida} />}
              activeDot={(p: PropsPunto) => <PuntoCirculo key={p.index} {...p} color={COLOR.convertida} r={5} />}
              label={etiquetaFinal('Convertida')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </TarjetaGrafico>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 2. Tasa de conversión (1 serie, sin leyenda)

export function GraficoTasa({ datos }: { datos: PuntoMensual[] }) {
  return (
    <TarjetaGrafico
      titulo="Tasa de conversión"
      descripcion="Últimos 6 meses"
      tabla={{
        columnas: [{ titulo: 'Mes' }, { titulo: 'Tasa', alinear: 'right' }],
        filas: datos.map((d) => [d.mes, formatoPorcentaje(d.tasaConversion)]),
      }}
    >
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={COLOR.grilla} vertical={false} />
            <XAxis dataKey="mes" {...EJE} />
            <YAxis {...EJE} axisLine={false} width={44} domain={[0, 'auto']} tickFormatter={(v: number) => formatoPorcentaje(v)} />
            <Tooltip
              cursor={CURSOR_LINEA}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <CajaTooltip
                    titulo={String(label)}
                    filas={[{ texto: 'Tasa de conversión', valor: formatoPorcentaje(Number(payload[0].value)), color: COLOR.marca, forma: 'circulo' }]}
                  />
                ) : null
              }
            />
            <Line
              isAnimationActive={false}
              dataKey="tasaConversion"
              stroke={COLOR.marca}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={(p: PropsPunto) => <PuntoCirculo key={p.index} {...p} color={COLOR.marca} />}
              activeDot={(p: PropsPunto) => <PuntoCirculo key={p.index} {...p} color={COLOR.marca} r={5} />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </TarjetaGrafico>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 3. Leads por estado (barras horizontales, colores de los badges)

export function GraficoEstados({ datos }: { datos: ConteoEstado[] }) {
  return (
    <TarjetaGrafico
      titulo="Leads por estado"
      descripcion="Foto de hoy"
      tabla={{
        columnas: [{ titulo: 'Estado' }, { titulo: 'Leads', alinear: 'right' }],
        filas: datos.map((d) => [d.texto, d.cantidad]),
      }}
    >
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={COLOR.grilla} horizontal={false} />
            <XAxis type="number" {...EJE} allowDecimals={false} />
            <YAxis type="category" dataKey="texto" {...EJE} axisLine={false} width={112} />
            <Tooltip
              cursor={CURSOR_BARRA}
              content={({ active, payload }) => {
                const d = payload?.[0]?.payload as ConteoEstado | undefined
                return active && d ? (
                  <CajaTooltip
                    titulo={d.texto}
                    filas={[{ texto: 'Leads', valor: String(d.cantidad), color: COLOR_ESTADO[d.estado], forma: 'barra' }]}
                  />
                ) : null
              }}
            />
            <Bar dataKey="cantidad" isAnimationActive={false} maxBarSize={24} radius={[0, 4, 4, 0]}>
              {datos.map((d) => (
                <Cell key={d.estado} fill={COLOR_ESTADO[d.estado]} />
              ))}
              {/* El valor en la punta: la identidad no depende del color (también está el nombre en el eje) */}
              <LabelList dataKey="cantidad" position="right" fill="var(--foreground)" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </TarjetaGrafico>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// 4 y 5. Barras verticales de una serie (leads nuevos por semana, leads convertidos por mes)

type Fila = Record<string, string | number>

function GraficoColumnas({
  titulo,
  descripcion,
  datos,
  eje,
  valor,
  nombreValor,
  color,
}: {
  titulo: string
  descripcion: string
  datos: Fila[]
  eje: string
  valor: string
  nombreValor: string
  color: string
}) {
  return (
    <TarjetaGrafico
      titulo={titulo}
      descripcion={descripcion}
      tabla={{
        columnas: [{ titulo: eje === 'mes' ? 'Mes' : 'Semana del' }, { titulo: nombreValor, alinear: 'right' }],
        filas: datos.map((d) => [d[eje], d[valor]]),
      }}
    >
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid stroke={COLOR.grilla} vertical={false} />
            {/* En pantallas angostas recharts oculta las etiquetas que se pisarían */}
            <XAxis dataKey={eje} {...EJE} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...EJE} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip
              cursor={CURSOR_BARRA}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <CajaTooltip
                    titulo={eje === 'mes' ? String(label) : `Semana del ${label}`}
                    filas={[{ texto: nombreValor, valor: String(payload[0].value), color, forma: 'barra' }]}
                  />
                ) : null
              }
            />
            <Bar dataKey={valor} isAnimationActive={false} fill={color} maxBarSize={24} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </TarjetaGrafico>
  )
}

export function GraficoLeadsNuevos({ datos }: { datos: PuntoSemanal[] }) {
  return (
    <GraficoColumnas
      titulo="Leads nuevos por semana"
      descripcion="Últimas 8 semanas · etiquetadas por el lunes"
      datos={datos}
      eje="semana"
      valor="leadsNuevos"
      nombreValor="Leads nuevos"
      color={COLOR.marca}
    />
  )
}

export function GraficoConvertidos({ datos }: { datos: PuntoMensual[] }) {
  return (
    <GraficoColumnas
      titulo="Leads convertidos por mes"
      descripcion="Últimos 6 meses"
      datos={datos}
      eje="mes"
      valor="leadsConvertidos"
      nombreValor="Convertidos"
      color={COLOR.convertida}
    />
  )
}
