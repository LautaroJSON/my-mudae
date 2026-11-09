import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { Handle, SizeTip } from './styles'

interface ISeriesWidthHandle {
  /** Lista horizontal de tarjetas del bloque: de ella se mide el ancho de una tarjeta + gap. */
  listRef: RefObject<HTMLDivElement | null>
  /** Personajes que el bloque está mostrando (su largo máximo). */
  total: number
  /** Personajes visibles a lo ancho en este momento (igual a `total` si el bloque está completo). */
  visible: number
  /** Nombre accesible del bloque, para el `aria-label`. */
  blockLabel: string
  /** Vista previa mientras se arrastra, sin persistir; `null` al soltar. */
  onPreview: (visibleCount: number | null) => void
  /** Persiste el nuevo largo; `null` vuelve al ancho completo. */
  onCommit: (visibleCount: number | null) => void
}

/**
 * Manija en el borde derecho de un bloque de serie (013): arrastrarla
 * achica o agranda el bloque de a una tarjeta (snap), con un mínimo de un
 * personaje; el resto queda detrás del scroll horizontal de la lista.
 * Mientras se arrastra solo se actualiza una vista previa local
 * (`onPreview`) y se persiste una vez, al soltar (`onCommit`), para no
 * escribir en localStorage en cada `pointermove`.
 *
 * Doble clic vuelve al ancho completo. Con foco: ← / → de a una tarjeta,
 * Inicio = un personaje, Fin = completo.
 */
const SeriesWidthHandle = ({ listRef, total, visible, blockLabel, onPreview, onCommit }: ISeriesWidthHandle) => {
  const drag = useRef<{ startX: number; startWidth: number; unit: number; gap: number; last: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const clamp = (value: number) => Math.max(1, Math.min(total, value))
  const commit = (value: number) => onCommit(value >= total ? null : clamp(value))

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const list = listRef.current
    const firstCard = list?.firstElementChild
    if (!list || !firstCard || event.button !== 0) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    drag.current = {
      startX: event.clientX,
      startWidth: list.getBoundingClientRect().width,
      unit: firstCard.getBoundingClientRect().width + gap,
      gap,
      last: visible,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.unit <= 0) {
      return
    }
    const width = state.startWidth + (event.clientX - state.startX)
    const next = clamp(Math.round((width + state.gap) / state.unit))
    if (next !== state.last) {
      state.last = next
      onPreview(next)
    }
  }

  const endDrag = () => {
    const state = drag.current
    if (!state) {
      return
    }
    drag.current = null
    setDragging(false)
    commit(state.last)
    onPreview(null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: visible - 1, ArrowRight: visible + 1, Home: 1, End: total }
    if (event.key in steps) {
      event.preventDefault()
      commit(steps[event.key])
    }
  }

  return (
    <Handle
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={`Ajustar largo de ${blockLabel}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={visible}
      aria-valuetext={`${visible} de ${total} personajes visibles`}
      title="Arrastrá para ajustar el largo · doble clic para restablecer"
      data-block-reveal
      data-dragging={dragging || undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onDoubleClick={() => onCommit(null)}
      onKeyDown={handleKeyDown}
    >
      {dragging && (
        <SizeTip aria-hidden="true">
          {visible} de {total}
        </SizeTip>
      )}
    </Handle>
  )
}

export default SeriesWidthHandle
