import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { sortHaremByKakera, type Harem } from '../../../domain/harem/Harem'
import { useProfiles } from '../../context/ProfilesContext'
import { useHaremSort } from '../../context/HaremSortContext'
import { computeReorderedIds } from '../../computeReorderedIds'
import SeriesGroupItem from '../SeriesGroupItem'
import { Container, EmptyMessage } from './styles'

interface IHaremView {
  harem: Harem
}

/**
 * Renderiza el harem del perfil activo agrupado por serie, en una
 * cuadrícula tipo flex-wrap (User Story 1 de 003). Monta el `DndContext`
 * de nivel serie (User Story 3): reordena qué serie aparece antes que
 * otra, sin afectar el orden interno de personajes de ninguna serie
 * (FR-007) — cada `SeriesGroup`/`CharacterCard` sigue memoizado por
 * props (Principio III): reordenar una serie o un personaje de otra no
 * debe volver a renderizar el contenido pesado de esta.
 *
 * Cuando el ordenamiento temporal por kakera (010) está activo, lo que
 * se renderiza es `sortHaremByKakera(harem, direction)` en vez de
 * `harem` tal cual — nunca se le pasa ese resultado a `reorderSeries`
 * (que sigue operando sobre `harem`, el orden manual real, Principio
 * II) y el drag-and-drop se deshabilita mientras está activo (FR-015),
 * ver `dragDisabled` en `SeriesGroupItem`.
 */
const HaremView = ({ harem }: IHaremView) => {
  const { reorderSeries } = useProfiles()
  const { isActive, direction } = useHaremSort()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (harem.series.length === 0) {
    return <EmptyMessage>Este perfil todavía no tiene personajes.</EmptyMessage>
  }

  const displayedHarem = isActive ? sortHaremByKakera(harem, direction) : harem
  const seriesIds = displayedHarem.series.map((series) => series.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      return
    }
    reorderSeries(computeReorderedIds(seriesIds, String(active.id), String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={seriesIds} strategy={rectSortingStrategy}>
        <Container>
          {displayedHarem.series.map((series) => (
            <SeriesGroupItem key={series.id} series={series} dragDisabled={isActive} />
          ))}
        </Container>
      </SortableContext>
    </DndContext>
  )
}

export default HaremView
