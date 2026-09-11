import { useState, type KeyboardEvent } from 'react'
import { ExternalLink, GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Profile } from '../../../domain/profile/Profile'
import { countCharacters, sumKakera } from '../../../domain/harem/Harem'
import ConfirmDeleteProfileDialog from '../ConfirmDeleteProfileDialog'
import { ActivateButton, Card, DragHandle, IconButton, NameColumn, NameInput, Stats } from './styles'

interface IProfileCard {
  profile: Profile
  onActivate: (profileId: string) => void
  onDelete: (profileId: string) => void
  onRename: (profileId: string, alias: string) => void
  /** Abre ese perfil en una pestaña nueva vía `?id=` (User Story 5 de 002). */
  onOpenInNewTab: (profileId: string) => void
  /** Props de `useSortable` de @dnd-kit para la manija de arrastre (User Story 2). */
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: DraggableSyntheticListeners
  }
}

/**
 * Una fila de la lista de perfiles: alias (editable), cantidad de
 * personajes y valor total del harem (User Story 3 de 002), y acciones de
 * activar/renombrar/eliminar (con confirmación, porque borra el harem
 * completo con el perfil). El perfil activo se distingue con un borde en
 * el color de acento (FR-007 de 002), sin ninguna etiqueta de texto.
 */
const ProfileCard = ({ profile, onActivate, onDelete, onRename, onOpenInNewTab, dragHandleProps }: IProfileCard) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(profile.alias)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const startEditing = () => {
    setDraftName(profile.alias)
    setIsEditingName(true)
  }

  const commitRename = () => {
    const trimmed = draftName.trim()
    if (trimmed.length > 0) {
      onRename(profile.id, trimmed)
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commitRename()
    }
    if (event.key === 'Escape') {
      setIsEditingName(false)
    }
  }

  const characterCount = countCharacters(profile.harem)
  const totalKakera = sumKakera(profile.harem)

  return (
    <Card $isActive={profile.isActive}>
      {dragHandleProps && (
        <DragHandle
          type="button"
          aria-label={`Reordenar ${profile.alias}`}
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={16} />
        </DragHandle>
      )}
      <NameColumn>
        {isEditingName ? (
          <NameInput
            aria-label="Nombre del perfil"
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={commitRename}
          />
        ) : (
          <ActivateButton
            type="button"
            $isActive={profile.isActive}
            onClick={() => onActivate(profile.id)}
            disabled={profile.isActive}
          >
            {profile.alias}
          </ActivateButton>
        )}
        {!isEditingName && (
          <Stats>
            {characterCount} {characterCount === 1 ? 'personaje' : 'personajes'} · {totalKakera} kakera
          </Stats>
        )}
      </NameColumn>
      {!isEditingName && (
        <IconButton
          type="button"
          aria-label={`Abrir ${profile.alias} en una pestaña nueva`}
          onClick={() => onOpenInNewTab(profile.id)}
        >
          <ExternalLink size={16} />
        </IconButton>
      )}
      {!isEditingName && (
        <IconButton type="button" aria-label={`Editar nombre de ${profile.alias}`} onClick={startEditing}>
          <Pencil size={16} />
        </IconButton>
      )}
      <IconButton
        type="button"
        aria-label={`Eliminar perfil ${profile.alias}`}
        onClick={() => setIsConfirmingDelete(true)}
      >
        <Trash2 size={16} />
      </IconButton>
      {isConfirmingDelete && (
        <ConfirmDeleteProfileDialog
          profileName={profile.alias}
          onConfirm={() => {
            setIsConfirmingDelete(false)
            onDelete(profile.id)
          }}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </Card>
  )
}

export default ProfileCard
