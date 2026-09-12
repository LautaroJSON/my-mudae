import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useProfiles } from '../../context/ProfilesContext'
import { computeReorderedIds } from '../../computeReorderedIds'
import ServerListItem from '../ServerListItem'
import { EmptyMessage, List } from './styles'

/**
 * Nivel superior del acordeón (User Story 3, FR-009): la lista de
 * servidores con al menos un perfil cargado (los vacíos NO aparecen acá,
 * FR-014 — siguen existiendo, elegibles/eliminables desde
 * `ServerPickerModal`), reemplaza a `ProfileList` como contenido de
 * `ProfilesModal`. Reordenable por arrastre entre sí (User Story 4,
 * FR-012), mismo patrón de sensores que `ProfileList`/`HaremView`.
 */
const ServerList = () => {
  const { servers, profiles, reorderServers } = useProfiles()
  const nonEmptyServers = servers.filter((server) => server.profileIds.length > 0)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (nonEmptyServers.length === 0) {
    return <EmptyMessage>Todavía no tenés ningún perfil.</EmptyMessage>
  }

  const ids = nonEmptyServers.map((server) => server.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      return
    }
    reorderServers(computeReorderedIds(ids, String(active.id), String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <List aria-label="Lista de servidores">
          {nonEmptyServers.map((server) => {
            const serverProfiles = server.profileIds
              .map((profileId) => profiles.find((profile) => profile.id === profileId))
              .filter((profile): profile is NonNullable<typeof profile> => profile !== undefined)

            return <ServerListItem key={server.id} server={server} profiles={serverProfiles} />
          })}
        </List>
      </SortableContext>
    </DndContext>
  )
}

export default ServerList
