import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { StyledCursorTooltip } from './components/CursorTooltip/styles'

// Separación entre la punta del cursor y el tooltip.
const CURSOR_OFFSET_PX = 12

/**
 * Tooltip que sigue al cursor mientras está sobre un elemento (los botones
 * redondos de `CharacterCard`). Se renderiza en un portal a `body` con
 * `position: fixed`: dentro de la tarjeta lo recortaría su `overflow:
 * hidden`, y el `transform` de la tarjeta/arrastre rompería el `fixed`.
 * Solo con mouse/lápiz: en táctil no hay hover y los botones ya están a la
 * vista. La posición se escribe directo sobre el nodo para no re-renderizar
 * en cada `pointermove`.
 */
export function useCursorTooltip(text: string): {
  tooltipHandlers: {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => void
    onPointerMove: (event: PointerEvent<HTMLElement>) => void
    onPointerLeave: () => void
  }
  tooltip: ReactNode
} {
  const [visible, setVisible] = useState(false)
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const positionRef = useRef({ x: 0, y: 0 })

  const applyPosition = () => {
    const node = nodeRef.current
    if (!node) {
      return
    }
    const { x, y } = positionRef.current
    // Cerca del borde derecho de la ventana, se ubica a la izquierda del
    // cursor para no salirse de pantalla.
    const flip = x + CURSOR_OFFSET_PX + node.offsetWidth > window.innerWidth
    node.style.left = `${flip ? x - CURSOR_OFFSET_PX - node.offsetWidth : x + CURSOR_OFFSET_PX}px`
    node.style.top = `${y + CURSOR_OFFSET_PX}px`
  }

  const setNode = (node: HTMLDivElement | null) => {
    nodeRef.current = node
    applyPosition()
  }

  const track = (event: PointerEvent<HTMLElement>) => {
    positionRef.current = { x: event.clientX, y: event.clientY }
    applyPosition()
  }

  return {
    tooltipHandlers: {
      onPointerEnter: (event) => {
        if (event.pointerType === 'touch') {
          return
        }
        track(event)
        setVisible(true)
      },
      onPointerMove: track,
      onPointerLeave: () => setVisible(false),
    },
    tooltip: visible
      ? createPortal(
          <StyledCursorTooltip ref={setNode} role="tooltip">
            {text}
          </StyledCursorTooltip>,
          document.body,
        )
      : null,
  }
}
