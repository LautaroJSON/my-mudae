import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useProfiles } from '../../context/ProfilesContext'
import type { ServerChoice } from '../../../application/useCases/createProfileWithServer'
import Modal from '../Modal'
import ConfirmDeleteServerDialog from '../ConfirmDeleteServerDialog'
import { ConfirmButton, DeleteServerButton, Field, Input, Radio, RadioLabel, RadioList, RadioRow } from './styles'

interface IServerPickerModal {
  onConfirm: (choice: ServerChoice) => void
  onClose: () => void
}

/**
 * Pedido de servidor de la User Story 1 (008): se abre tras un pegado con
 * formato válido, antes de crear el perfil. Permite escribir el nombre de
 * un servidor nuevo (hasta 50 caracteres, FR-002) o elegir uno de los ya
 * cargados con un radio button (FR-003) — elegir uno deshabilita/opaca el
 * input de texto (FR-004). También permite eliminar un servidor existente
 * desde acá (User Story 2): sin perfiles se elimina de inmediato
 * (FR-016), con perfiles pide confirmar en `ConfirmDeleteServerDialog`
 * (FR-017).
 */
const ServerPickerModal = ({ onConfirm, onClose }: IServerPickerModal) => {
  const { servers, profiles, deleteServer } = useProfiles()
  const [newServerName, setNewServerName] = useState('')
  const [selectedServerId, setSelectedServerId] = useState<string | undefined>(undefined)
  const [serverPendingDeletion, setServerPendingDeletion] = useState<{ id: string; name: string } | undefined>(
    undefined,
  )

  const canConfirm = selectedServerId !== undefined || newServerName.trim().length > 0

  const handleConfirm = () => {
    if (selectedServerId !== undefined) {
      onConfirm({ kind: 'existing-server', serverId: selectedServerId })
      return
    }
    onConfirm({ kind: 'new-server', name: newServerName.trim() })
  }

  const handleDeleteClick = (server: { id: string; name: string; profileIds: string[] }) => {
    if (server.profileIds.length === 0) {
      deleteServer(server.id)
      if (selectedServerId === server.id) {
        setSelectedServerId(undefined)
      }
      return
    }
    setServerPendingDeletion({ id: server.id, name: server.name })
  }

  const affectedAliases = serverPendingDeletion
    ? profiles.filter((profile) => profile.serverId === serverPendingDeletion.id).map((profile) => profile.alias)
    : []

  return (
    <Modal onClose={onClose} ariaLabel="Elegir servidor">
      <Field>
        <label htmlFor="new-server-name">Servidor nuevo</label>
        <Input
          id="new-server-name"
          type="text"
          maxLength={50}
          value={newServerName}
          disabled={selectedServerId !== undefined}
          onChange={(event) => setNewServerName(event.target.value)}
          placeholder="Nombre del servidor de Discord"
        />
      </Field>
      {servers.length > 0 && (
        <RadioList aria-label="Servidores ya cargados">
          {servers.map((server) => (
            <RadioRow key={server.id}>
              <Radio
                type="radio"
                name="existing-server"
                aria-label={server.name}
                checked={selectedServerId === server.id}
                onChange={() => setSelectedServerId(server.id)}
              />
              <RadioLabel onClick={() => setSelectedServerId(server.id)}>{server.name}</RadioLabel>
              <DeleteServerButton
                type="button"
                aria-label={`Eliminar servidor ${server.name}`}
                onClick={() => handleDeleteClick(server)}
              >
                <Trash2 size={16} />
              </DeleteServerButton>
            </RadioRow>
          ))}
        </RadioList>
      )}
      <ConfirmButton type="button" disabled={!canConfirm} onClick={handleConfirm}>
        Confirmar
      </ConfirmButton>
      {serverPendingDeletion && (
        <ConfirmDeleteServerDialog
          serverName={serverPendingDeletion.name}
          profileAliases={affectedAliases}
          onConfirm={() => {
            deleteServer(serverPendingDeletion.id)
            if (selectedServerId === serverPendingDeletion.id) {
              setSelectedServerId(undefined)
            }
            setServerPendingDeletion(undefined)
          }}
          onCancel={() => setServerPendingDeletion(undefined)}
        />
      )}
    </Modal>
  )
}

export default ServerPickerModal
