import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Profile } from '../../../domain/profile/Profile'
import { useProfiles } from '../../context/ProfilesContext'
import { computeReorderedIds } from '../../computeReorderedIds'
import { buildProfileUrl } from '../../urlParams'
import ProfileListItem from '../ProfileListItem'
import { EmptyMessage, List } from './styles'

interface IProfileList {
  /** Perfiles de UN servidor, ya en el orden de `Server.profileIds` (008). */
  profiles: Profile[]
  serverId: string
}

/**
 * Lista de perfiles de un servidor, dentro de `ServerListItem` (008: antes
 * de esta feature vivía directamente dentro de `ProfilesModal` como lista
 * plana de TODOS los perfiles — FR-003/FR-004 de 002). Permite activar
 * (FR-006), renombrar, eliminar cada perfil, y reordenarlos con
 * drag-and-drop dentro de ESE servidor (User Story 4, FR-011) — el
 * `KeyboardSensor` hace que el reordenamiento también funcione por
 * teclado, no solo con mouse/touch.
 */
const ProfileList = ({ profiles, serverId }: IProfileList) => {
  const { activateProfile, deleteProfile, renameProfile, reorderProfilesInServer } = useProfiles()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (profiles.length === 0) {
    return <EmptyMessage>Todavía no tenés ningún perfil.</EmptyMessage>
  }

  const ids = profiles.map((profile) => profile.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      return
    }
    reorderProfilesInServer(serverId, computeReorderedIds(ids, String(active.id), String(over.id)))
  }

  const handleOpenInNewTab = (profileId: string) => {
    const url = buildProfileUrl(window.location.origin, window.location.pathname, profileId)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <List aria-label="Lista de perfiles">
          {profiles.map((profile) => (
            <ProfileListItem
              key={profile.id}
              profile={profile}
              onActivate={activateProfile}
              onDelete={deleteProfile}
              onRename={renameProfile}
              onOpenInNewTab={handleOpenInNewTab}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  )
}

export default ProfileList
