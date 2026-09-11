import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Series } from '../../../domain/harem/Series'
import SeriesGroup from '../SeriesGroup'
import { Item } from './styles'

interface ISeriesGroupItem {
  series: Series
}

/**
 * Envoltorio sortable (`@dnd-kit/sortable`) de una serie dentro de
 * `HaremView` (User Story 3): el `ref`/transform del arrastre viven acá,
 * mismo patrón que `ProfileListItem`. Pasa `attributes`/`listeners` como
 * `dragHandleProps` a `SeriesGroup` para que el arrastre arranque solo
 * desde su manija, nunca desde el cuerpo de la lista de personajes.
 *
 * Usa `CSS.Translate` (solo `translate3d`) en vez de `CSS.Transform`
 * (que suma `scaleX`/`scaleY`): cada serie mide el ancho de su propio
 * contenido, sin ancho fijo (ver SeriesGroup/styles.tsx), así que su
 * tamaño real cambia a medida que la fila se reacomoda durante el
 * arrastre — aplicar la escala de compensación de `CSS.Transform` sobre
 * un ítem de tamaño variable deforma visualmente la tarjeta mientras se
 * arrastra (estira/achica de forma no uniforme). `CSS.Translate` evita
 * ese efecto por completo.
 */
const SeriesGroupItem = ({ series }: ISeriesGroupItem) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: series.id })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <Item ref={setNodeRef} style={style}>
      <SeriesGroup series={series} dragHandleProps={{ attributes, listeners }} />
    </Item>
  )
}

export default SeriesGroupItem
