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
}

/**
 * Envoltorio sortable (`@dnd-kit/sortable`) de un personaje dentro de su
 * serie (User Story 2): el `ref`/transform del arrastre viven acá, igual
 * que `ProfileListItem`. A diferencia de ese componente, no hay manija
 * dedicada — `CharacterCard` no tiene ningún control interactivo propio
 * (sin `onClick`, sin botones), así que toda la tarjeta puede ser la
 * superficie de arrastre sin ambigüedad ni conflicto con otra
 * interacción.
 *
 * Usa `CSS.Translate` (solo `translate3d`) en vez de `CSS.Transform`
 * (que suma `scaleX`/`scaleY`): `CharacterList` usa `rectSortingStrategy`
 * sobre una grilla que envuelve, donde las filas pueden reacomodarse
 * durante el arrastre — la escala de compensación de `CSS.Transform`
 * puede deformar visualmente la tarjeta en ese escenario (mismo
 * problema, y misma solución, que `SeriesGroupItem`).
 */
const CharacterListItem = ({ character, staggerIndex }: ICharacterListItem) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: character.id })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <Item ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CharacterCard character={character} staggerIndex={staggerIndex} />
    </Item>
  )
}

export default CharacterListItem
