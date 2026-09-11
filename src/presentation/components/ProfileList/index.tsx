import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useProfiles } from '../../context/ProfilesContext'
import { computeReorderedIds } from '../../computeReorderedIds'
import { buildProfileUrl } from '../../urlParams'
import ProfileListItem from '../ProfileListItem'
import { EmptyMessage, List } from './styles'

/**
 * Lista de perfiles dentro de `ProfilesModal` (FR-003, FR-004): permite
 * activar (FR-006), renombrar y eliminar cada perfil, y reordenarlos con
 * drag-and-drop (User Story 2, FR-008/009) — el `KeyboardSensor` hace que
 * el reordenamiento también funcione por teclado (Tab a la manija,
 * Espacio para levantar, flechas para mover, Espacio para soltar), no
 * solo con mouse/touch.
 */
const ProfileList = () => {
  const { profiles, activateProfile, deleteProfile, renameProfile, reorderProfiles } = useProfiles()
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
    reorderProfiles(computeReorderedIds(ids, String(active.id), String(over.id)))
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
