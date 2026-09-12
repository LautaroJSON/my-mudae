import { theme } from '../../../shared/theme'
import Modal from '../Modal'
import { Actions, AliasItem, AliasList, CancelButton, ConfirmButton, Message } from './styles'

interface IConfirmDeleteServerDialog {
  serverName: string
  profileAliases: string[]
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Advertencia antes de eliminar un servidor con perfiles cargados (User
 * Story 2, FR-017/FR-018): lista los alias afectados en un cuadro con
 * scroll (hasta 300px de alto) a ancho completo. Se construye sobre
 * `Modal` con `zIndex.nestedDialog` porque se abre encima de
 * `ServerPickerModal` — mismo patrón que `ConfirmDeleteProfileDialog`.
 */
const ConfirmDeleteServerDialog = ({ serverName, profileAliases, onConfirm, onCancel }: IConfirmDeleteServerDialog) => {
  return (
    <Modal
      onClose={onCancel}
      ariaLabel={`Eliminar servidor ${serverName}`}
      role="alertdialog"
      zIndex={theme.zIndex.nestedDialog}
    >
      <Message>
        Estás intentando borrar el servidor <strong>{serverName}</strong>, que tiene {profileAliases.length}{' '}
        {profileAliases.length === 1 ? 'perfil cargado' : 'perfiles cargados'}:
      </Message>
      <AliasList>
        {profileAliases.map((alias) => (
          <AliasItem key={alias}>{alias}</AliasItem>
        ))}
      </AliasList>
      <Message>¿Seguro que querés eliminar el servidor? Se eliminarán los perfiles de ese servidor en particular.</Message>
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

export default ConfirmDeleteServerDialog
