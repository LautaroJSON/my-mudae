import { useState } from 'react'
import { Copy } from 'lucide-react'
import { useProfiles } from '../../context/ProfilesContext'
import { countCharacters } from '../../../domain/harem/Harem'
import { formatHaremMessage } from '../../../domain/parsing/formatHaremMessage'
import { copyTextToClipboard } from '../../copyToClipboard'
import Toast from '../Toast'
import ManualCopyDialog from '../ManualCopyDialog'
import { RoundIconButton } from './styles'

const SUCCESS_MESSAGE = 'Harem copiado al portapapeles.'
const ERROR_MESSAGE = 'No se pudo copiar el harem. Intentá de nuevo.'

/**
 * Icono "Compartir harem" (FR-002 de 004): copia el harem del perfil
 * activo al portapapeles en el mismo formato de texto que
 * `parseHaremMessage` reconoce al dar de alta un perfil por pegado, con
 * feedback de éxito/error y el fallback de copiado manual del Principio
 * VI cuando la Clipboard API no está disponible o falla (ver
 * contracts/share-harem-ui.md).
 */
const ShareHaremButton = () => {
  const { activeProfile } = useProfiles()
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(null)
  const [manualCopyText, setManualCopyText] = useState<string | null>(null)

  const isDisabled = !activeProfile || countCharacters(activeProfile.harem) === 0

  const handleShare = async () => {
    if (!activeProfile) {
      return
    }

    let text: string
    try {
      text = formatHaremMessage(activeProfile)
    } catch {
      setToast({ variant: 'error', message: ERROR_MESSAGE })
      return
    }

    const copied = await copyTextToClipboard(text)
    if (copied) {
      setToast({ variant: 'success', message: SUCCESS_MESSAGE })
      return
    }

    setManualCopyText(text)
  }

  return (
    <>
      <RoundIconButton
        type="button"
        aria-label="Compartir harem"
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={handleShare}
      >
        <Copy size={18} />
      </RoundIconButton>
      {toast && <Toast variant={toast.variant} message={toast.message} onDismiss={() => setToast(null)} />}
      {manualCopyText !== null && (
        <ManualCopyDialog
          text={manualCopyText}
          onConfirm={() => {
            setManualCopyText(null)
            setToast({ variant: 'success', message: SUCCESS_MESSAGE })
          }}
          onClose={() => setManualCopyText(null)}
        />
      )}
    </>
  )
}

export default ShareHaremButton
