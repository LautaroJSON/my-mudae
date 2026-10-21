import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Character } from '../../../domain/harem/Character'
import CharacterCard from '../CharacterCard'
import { Item } from './styles'

interface ICharacterListItem {
  character: Character
  /** Posición dentro de la serie, se reenvía a CharacterCard para la cascada de entrada. */
  staggerIndex?: number
  /** Deshabilita el arrastre de este personaje mientras el ordenamiento temporal por kakera está activo (FR-015 de 010). */
  dragDisabled?: boolean
  /** Se reenvía a CharacterCard para el botón "Mover a…" (012). */
  onRequestMove?: (characterId: string) => void
}

/**
 * Envoltorio sortable (`@dnd-kit/sortable`) de un personaje dentro de su
 * serie (User Story 2): el `ref`/transform del arrastre viven acá, igual
 * que `ProfileListItem`. A diferencia de ese componente, no hay manija
 * dedicada — toda la tarjeta es la superficie de arrastre; el único
 * control interactivo propio de `CharacterCard` (`CopyNameButton`, 006)
 * detiene la propagación de su `pointerdown` para no interferir con
 * este gesto (ver `research.md` de 006), así que la ambigüedad sigue
 * resuelta sin necesitar una manija separada.
 *
 * Usa `CSS.Translate` (solo `translate3d`) en vez de `CSS.Transform`
 * (que suma `scaleX`/`scaleY`): `CharacterList` usa `rectSortingStrategy`
 * sobre una grilla que envuelve, donde las filas pueden reacomodarse
 * durante el arrastre — la escala de compensación de `CSS.Transform`
 * puede deformar visualmente la tarjeta en ese escenario (mismo
 * problema, y misma solución, que `SeriesGroupItem`).
 *
 * Mientras se arrastra (`isDragging`), la tarjeta se muestra con
 * opacidad reducida como feedback visual de que "se levantó" de su
 * posición (mismo criterio que suelen usar las listas ordenables de
 * `@dnd-kit`).
 */
const CharacterListItem = ({ character, staggerIndex, dragDisabled, onRequestMove }: ICharacterListItem) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: character.id,
    disabled: dragDisabled,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <Item ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CharacterCard character={character} staggerIndex={staggerIndex} onRequestMove={onRequestMove} />
    </Item>
  )
}

export default CharacterListItem
