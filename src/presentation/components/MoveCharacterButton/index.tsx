import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { RoundIconButton } from './styles'

interface IMoveCharacterButton {
  characterName: string
  onClick: () => void
}

/**
 * Botón redondo superpuesto en `CharacterCard`, debajo de `CopyNameButton`
 * (012): abre "Mover a…" para llevar al personaje a otro bloque de su
 * serie. Mismo criterio que `CopyNameButton` para no competir con el
 * arrastre de `CharacterListItem` (toda la tarjeta es superficie de
 * arrastre): detiene la propagación de `pointerdown`/`click`, y también
 * de `keydown`, porque el `KeyboardSensor` de @dnd-kit escucha Enter/
 * Espacio en el envoltorio y si no tomaría el teclazo como inicio de un
 * arrastre en vez de un click.
 */
const MoveCharacterButton = ({ characterName, onClick }: IMoveCharacterButton) => {
  const stopDragActivation = (
    event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation()
  }

  return (
    <RoundIconButton
      type="button"
      data-move-character-button
      aria-label={`Mover ${characterName} a otro bloque`}
      onPointerDown={stopDragActivation}
      onKeyDown={stopDragActivation}
      onClick={(event) => {
        stopDragActivation(event)
        onClick()
      }}
    >
      <ArrowRightLeft size={12} />
    </RoundIconButton>
  )
}

export default MoveCharacterButton
