import { useEffect, useRef, useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import { useProfiles } from '../../context/ProfilesContext'
import { countCharacters } from '../../../domain/harem/Harem'
import { formatHaremMessage } from '../../../domain/parsing/formatHaremMessage'
import { copyTextToClipboard } from '../../copyToClipboard'
import ManualCopyDialog from '../ManualCopyDialog'
import { RoundIconButton } from './styles'

type IconFeedback = 'idle' | 'success' | 'error'

const FEEDBACK_DURATION_MS = 2500

/**
 * Icono "Compartir harem" (FR-002 de 004): copia el harem del perfil
 * activo al portapapeles en el mismo formato de texto que
 * `parseHaremMessage` reconoce al dar de alta un perfil por pegado. El
 * feedback de éxito/error se muestra en el propio icono (fill de acento
 * + check, o fill de `danger` + X, por unos segundos) en vez de un
 * `Toast` aparte; el fallback de copiado manual del Principio VI cuando
 * la Clipboard API no está disponible o falla sigue igual (ver
 * contracts/share-harem-ui.md).
 */
const ShareHaremButton = () => {
  const { activeProfile } = useProfiles()
  const [feedback, setFeedback] = useState<IconFeedback>('idle')
  const [manualCopyText, setManualCopyText] = useState<string | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const isDisabled = !activeProfile || countCharacters(activeProfile.harem) === 0

  useEffect(() => {
    return () => clearTimeout(feedbackTimeoutRef.current)
  }, [])

  const showFeedback = (result: IconFeedback) => {
    clearTimeout(feedbackTimeoutRef.current)
    setFeedback(result)
    feedbackTimeoutRef.current = setTimeout(() => setFeedback('idle'), FEEDBACK_DURATION_MS)
  }

  const handleShare = async () => {
    if (!activeProfile) {
      return
    }

    let text: string
    try {
      text = formatHaremMessage(activeProfile)
    } catch {
      showFeedback('error')
      return
    }

    const copied = await copyTextToClipboard(text)
    if (copied) {
      showFeedback('success')
      return
    }

    setManualCopyText(text)
  }

  return (
    <>
      <RoundIconButton
        type="button"
        $feedback={feedback}
        aria-label={feedback === 'success' ? 'Harem copiado' : 'Compartir harem'}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={handleShare}
      >
        {feedback === 'success' ? <Check size={18} /> : feedback === 'error' ? <X size={18} /> : <Copy size={18} />}
      </RoundIconButton>
      {manualCopyText !== null && (
        <ManualCopyDialog
          text={manualCopyText}
          onConfirm={() => {
            setManualCopyText(null)
            showFeedback('success')
          }}
          onClose={() => setManualCopyText(null)}
        />
      )}
    </>
  )
}

export default ShareHaremButton
