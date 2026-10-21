import { useEffect, useRef, useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import { copyTextToClipboard } from '../../copyToClipboard'
import ManualCopyDialog from '../ManualCopyDialog'
import { Button } from './styles'

type Feedback = 'idle' | 'success' | 'error'

const FEEDBACK_DURATION_MS = 2500

interface ICopyCommandButton {
  text: string | null
  /** Nombre accesible (y tooltip) del botón en reposo; por defecto "Copiar Comando". El botón solo muestra el icono. */
  label?: string
  /** Se llama tras un copiado exitoso (automático o confirmado a mano). */
  onCopied?: () => void
}

/**
 * Botón "Copiar Comando" (FR-005/FR-006/FR-007/FR-008 de 009): recibe
 * el comando ya generado (nunca lo calcula él mismo, ver
 * `SortCommandBar`), y reutiliza tal cual el mismo camino de copiado ya
 * probado por `ShareHaremButton` (004): `copyTextToClipboard` con
 * fallback a `ManualCopyDialog` si falla, feedback en el propio botón
 * (ver contracts/copy-command-button-ui.md).
 */
const CopyCommandButton = ({ text, label = 'Copiar Comando', onCopied }: ICopyCommandButton) => {
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [manualCopyText, setManualCopyText] = useState<string | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(feedbackTimeoutRef.current)
  }, [])

  const showFeedback = (result: Feedback) => {
    clearTimeout(feedbackTimeoutRef.current)
    setFeedback(result)
    feedbackTimeoutRef.current = setTimeout(() => setFeedback('idle'), FEEDBACK_DURATION_MS)
  }

  const handleCopy = async () => {
    if (text === null) {
      return
    }

    const copied = await copyTextToClipboard(text)
    if (copied) {
      showFeedback('success')
      onCopied?.()
      return
    }

    setManualCopyText(text)
  }

  const visibleLabel = feedback === 'success' ? '¡Copiado!' : feedback === 'error' ? 'No se pudo copiar' : label

  return (
    <>
      <Button
        type="button"
        $feedback={feedback}
        aria-label={visibleLabel}
        title={visibleLabel}
        aria-disabled={text === null}
        disabled={text === null}
        onClick={handleCopy}
      >
        {feedback === 'success' ? <Check size={16} aria-hidden="true" /> : feedback === 'error' ? <X size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </Button>
      {manualCopyText !== null && (
        <ManualCopyDialog
          text={manualCopyText}
          onConfirm={() => {
            setManualCopyText(null)
            showFeedback('success')
            onCopied?.()
          }}
          onClose={() => setManualCopyText(null)}
        />
      )}
    </>
  )
}

export default CopyCommandButton
