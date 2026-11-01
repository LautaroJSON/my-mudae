import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { ExternalLink } from 'lucide-react'
import { useCursorTooltip } from '../../useCursorTooltip'
import { RoundIconLink } from './styles'

interface IMudaeProfileLink {
  characterName: string
  /**
   * Posición en la pila de botones redondos de la tarjeta (0 = la de
   * `CopyNameButton`). Depende de si la tarjeta muestra o no
   * `MoveCharacterButton`, para no dejar un hueco.
   */
  slot: number
}

const mudaeCharacterUrl = (characterName: string) =>
  `https://mudae.net/character/${encodeURIComponent(characterName)}`

/**
 * Enlace redondo superpuesto en `CharacterCard`, debajo de
 * `MoveCharacterButton`: abre el perfil del personaje en mudae.net en una
 * pestaña nueva. Mismo criterio que los otros botones de la tarjeta para
 * no competir con el arrastre de `CharacterListItem`: detiene la
 * propagación de `pointerdown`/`keydown`/`click` (sin `preventDefault`,
 * así la navegación del enlace sigue ocurriendo).
 */
const MudaeProfileLink = ({ characterName, slot }: IMudaeProfileLink) => {
  const { tooltipHandlers, tooltip } = useCursorTooltip('Ver en Mudae.net')

  const stopDragActivation = (
    event: PointerEvent<HTMLAnchorElement> | MouseEvent<HTMLAnchorElement> | KeyboardEvent<HTMLAnchorElement>,
  ) => {
    event.stopPropagation()
  }

  return (
    <>
      <RoundIconLink
        href={mudaeCharacterUrl(characterName)}
        target="_blank"
        rel="noopener noreferrer"
        data-mudae-profile-link
        {...tooltipHandlers}
        $slot={slot}
        aria-label={`Ver ${characterName} en mudae.net`}
        onPointerDown={stopDragActivation}
        onKeyDown={stopDragActivation}
        onClick={stopDragActivation}
      >
        <ExternalLink size={12} />
      </RoundIconLink>
      {tooltip}
    </>
  )
}

export default MudaeProfileLink
