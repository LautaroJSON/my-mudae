import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { Trash2, Undo2 } from 'lucide-react'
import { useCursorTooltip } from '../../useCursorTooltip'
import { RoundIconButton } from './styles'

interface IDivorceCharacterButton {
  characterName: string
  isMarked: boolean
  /** Posición en la pila de botones redondos de la tarjeta (0 = la de `CopyNameButton`). */
  slot: number
  onClick: () => void
}

/**
 * Tacho rojo de la tarjeta (014): marca al personaje para divorciarlo y
 * lo suma a `DivorceBar`; marcado, pasa a "deshacer" y queda siempre
 * visible. Mismo criterio que los otros botones de la tarjeta para no
 * competir con el arrastre: detiene la propagación de `pointerdown`/
 * `keydown`/`click`.
 */
const DivorceCharacterButton = ({ characterName, isMarked, slot, onClick }: IDivorceCharacterButton) => {
  const { tooltipHandlers, tooltip } = useCursorTooltip(isMarked ? 'No divorciar' : 'Divorciar')

  const stopDragActivation = (
    event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation()
  }

  return (
    <>
      <RoundIconButton
        type="button"
        data-divorce-character-button
        $slot={slot}
        $isMarked={isMarked}
        {...tooltipHandlers}
        aria-label={isMarked ? `No divorciar a ${characterName}` : `Divorciar a ${characterName}`}
        aria-pressed={isMarked}
        onPointerDown={stopDragActivation}
        onKeyDown={stopDragActivation}
        onClick={(event) => {
          stopDragActivation(event)
          onClick()
        }}
      >
        {isMarked ? <Undo2 size={12} strokeWidth={2.5} /> : <Trash2 size={12} strokeWidth={2.5} />}
      </RoundIconButton>
      {tooltip}
    </>
  )
}

export default DivorceCharacterButton
