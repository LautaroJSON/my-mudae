import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Profile } from '../../../domain/profile/Profile'
import ProfileCard from '../ProfileCard'
import { Item } from './styles'

interface IProfileListItem {
  profile: Profile
  onActivate: (profileId: string) => void
  onDelete: (profileId: string) => void
  onRename: (profileId: string, alias: string) => void
  onOpenInNewTab: (profileId: string) => void
}

/**
 * Envoltorio sortable (`@dnd-kit/sortable`) de una fila de la lista de
 * perfiles (User Story 2, FR-008/009): el `ref`/transform del arrastre
 * viven acá, en el `<li>`; `ProfileCard` solo recibe las props de la
 * manija (`dragHandleProps`) para que el arrastre arranque desde ahí y
 * no desde cualquier parte de la fila.
 */
const ProfileListItem = ({ profile, onActivate, onDelete, onRename, onOpenInNewTab }: IProfileListItem) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: profile.id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <Item ref={setNodeRef} style={style}>
      <ProfileCard
        profile={profile}
        onActivate={onActivate}
        onDelete={onDelete}
        onRename={onRename}
        onOpenInNewTab={onOpenInNewTab}
        dragHandleProps={{ attributes, listeners }}
      />
    </Item>
  )
}

export default ProfileListItem
