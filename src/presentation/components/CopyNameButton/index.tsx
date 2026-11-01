import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyTextToClipboard } from '../../copyToClipboard'
import ManualCopyDialog from '../ManualCopyDialog'
import { useCursorTooltip } from '../../useCursorTooltip'
import { RoundIconButton } from './styles'

const FEEDBACK_DURATION_MS = 2500

interface ICopyNameButton {
  characterName: string
}

/**
 * Botón redondo superpuesto en la esquina superior derecha de
 * `CharacterCard` (FR-001/FR-002 de 006): copia `characterName` al
 * portapapeles, con el mismo flujo de fallback manual que
 * `ShareHaremButton` (004), reutilizando `copyToClipboard`/
 * `ManualCopyDialog` sin modificarlos. El feedback de éxito se muestra
 * en el propio icono (fill de acento + check por unos segundos) en vez
 * de un `Toast` aparte.
 *
 * Detiene la propagación de `pointerdown`/`click` porque
 * `CharacterListItem` (003) usa TODA la tarjeta como superficie de
 * arrastre (`{...listeners}` de `useSortable` sobre su envoltorio); sin
 * esto, un click acá podría interpretarse como el inicio de un
 * arrastre. Ver research.md de 006 — no requiere tocar `SeriesGroup` ni
 * la configuración de sensores de `@dnd-kit`.
 */
const CopyNameButton = ({ characterName }: ICopyNameButton) => {
  const [feedback, setFeedback] = useState<'idle' | 'success'>('idle')
  const [manualCopyText, setManualCopyText] = useState<string | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { tooltipHandlers, tooltip } = useCursorTooltip(feedback === 'success' ? 'Copiado' : 'Copiar nombre')

  useEffect(() => {
    return () => clearTimeout(feedbackTimeoutRef.current)
  }, [])

  const showSuccessFeedback = () => {
    clearTimeout(feedbackTimeoutRef.current)
    setFeedback('success')
    feedbackTimeoutRef.current = setTimeout(() => setFeedback('idle'), FEEDBACK_DURATION_MS)
  }

  const stopDragActivation = (event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    stopDragActivation(event)

    const copied = await copyTextToClipboard(characterName)
    if (copied) {
      showSuccessFeedback()
      return
    }

    setManualCopyText(characterName)
  }

  return (
    <>
      <RoundIconButton
        type="button"
        data-copy-name-button
        $feedback={feedback}
        {...tooltipHandlers}
        aria-label={feedback === 'success' ? 'Nombre copiado' : `Copiar nombre de ${characterName}`}
        onPointerDown={stopDragActivation}
        onClick={handleCopy}
      >
        {feedback === 'success' ? <Check size={12} /> : <Copy size={12} />}
      </RoundIconButton>
      {tooltip}
      {manualCopyText !== null && (
        <ManualCopyDialog
          text={manualCopyText}
          onConfirm={() => {
            setManualCopyText(null)
            showSuccessFeedback()
          }}
          onClose={() => setManualCopyText(null)}
        />
      )}
    </>
  )
}

export default CopyNameButton
