import { useEffect, useRef } from 'react'
import Modal from '../Modal'
import { Actions, ConfirmButton, Message, TextArea } from './styles'

interface IManualCopyDialog {
  text: string
  onConfirm: () => void
  onClose: () => void
}

/**
 * Fallback de "selección de texto manual" que exige el Principio VI de
 * la constitución cuando `copyTextToClipboard` no pudo copiar por
 * ningún mecanismo programático. Construido sobre el `Modal` genérico
 * ya existente (ver contracts/share-harem-ui.md).
 */
const ManualCopyDialog = ({ text, onConfirm, onClose }: IManualCopyDialog) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textAreaRef.current?.focus()
    textAreaRef.current?.select()
  }, [])

  return (
    <Modal onClose={onClose} ariaLabel="Copiar harem manualmente">
      <Message>
        No se pudo copiar automáticamente al portapapeles. Seleccioná el texto de abajo y copialo manualmente
        (Ctrl+C, o "Copiar" desde el menú de selección en el celular).
      </Message>
      <TextArea ref={textAreaRef} readOnly value={text} onFocus={(event) => event.currentTarget.select()} />
      <Actions>
        <ConfirmButton type="button" onClick={onConfirm}>
          Listo, ya lo copié
        </ConfirmButton>
      </Actions>
    </Modal>
  )
}

export default ManualCopyDialog
