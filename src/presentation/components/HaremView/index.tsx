import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { filterHaremByQuery, sortHaremByKakera, type Harem } from '../../../domain/harem/Harem'
import { useProfiles } from '../../context/ProfilesContext'
import { useHaremSort } from '../../context/HaremSortContext'
import { useHaremSearch } from '../../context/HaremSearchContext'
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
 * se renderiza pasa primero por `sortHaremByKakera(harem, direction)` en
 * vez de `harem` tal cual; cuando además hay una búsqueda activa (011),
 * el resultado pasa por `filterHaremByQuery` — ninguno de los dos se le
 * pasa a `reorderSeries` (que sigue operando sobre `harem`, el orden
 * manual real, Principio II) y el drag-and-drop se deshabilita mientras
 * cualquiera de los dos está activo (FR-015 de 010, FR-012 de 011), ver
 * `dragDisabled` en `SeriesGroupItem`.
 */
const HaremView = ({ harem }: IHaremView) => {
  const { reorderSeries } = useProfiles()
  const { isActive, direction } = useHaremSort()
  const { query } = useHaremSearch()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (harem.series.length === 0) {
    return <EmptyMessage>Este perfil todavía no tiene personajes.</EmptyMessage>
  }

  const sorted = isActive ? sortHaremByKakera(harem, direction) : harem
  const displayedHarem = filterHaremByQuery(sorted, query)
  const isSearching = query.trim().length > 0

  if (isSearching && displayedHarem.series.length === 0) {
    return <EmptyMessage>No se encontraron personajes ni series que coincidan con "{query.trim()}".</EmptyMessage>
  }

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
            <SeriesGroupItem key={series.id} series={series} dragDisabled={isActive || isSearching} />
          ))}
        </Container>
      </SortableContext>
    </DndContext>
  )
}

export default HaremView
