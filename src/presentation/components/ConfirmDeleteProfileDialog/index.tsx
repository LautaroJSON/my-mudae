import { theme } from '../../../shared/theme'
import Modal from '../Modal'
import { Actions, CancelButton, ConfirmButton, Message } from './styles'

interface IConfirmDeleteProfileDialog {
  profileName: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmación antes de eliminar un perfil: es una operación irreversible
 * que borra el harem completo con él (FR-011), así que no se dispara con
 * un solo click. Se construye sobre `Modal` con `zIndex.nestedDialog`
 * porque puede abrirse encima de `ProfilesModal` (User Story 6 de 002).
 */
const ConfirmDeleteProfileDialog = ({ profileName, onConfirm, onCancel }: IConfirmDeleteProfileDialog) => {
  return (
    <Modal onClose={onCancel} ariaLabel={`Eliminar perfil ${profileName}`} role="alertdialog" zIndex={theme.zIndex.nestedDialog}>
      <Message>
        ¿Eliminar el perfil <strong>{profileName}</strong>? Se va a borrar todo su harem (series y personajes) de
        forma permanente.
      </Message>
      <Actions>
        <CancelButton type="button" onClick={onCancel}>
          Cancelar
        </CancelButton>
        <ConfirmButton type="button" onClick={onConfirm}>
          Eliminar
        </ConfirmButton>
      </Actions>
    </Modal>
  )
}

export default ConfirmDeleteProfileDialog
