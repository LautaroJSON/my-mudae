import { useState, type CSSProperties } from 'react'
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Profile } from '../../../domain/profile/Profile'
import type { Server } from '../../../domain/server/Server'
import ProfileList from '../ProfileList'
import { DragHandle, ExpandButton, HeaderRow, Item } from './styles'

interface IServerListItem {
  server: Server
  /** Perfiles de ESE servidor, ya ordenados según `server.profileIds`. */
  profiles: Profile[]
}

/**
 * Fila de servidor del acordeón (User Story 3), sortable entre sí (User
 * Story 4, FR-012): el nombre es clickeable para expandir/colapsar
 * (estado local, no coordinado entre servidores — más de uno puede estar
 * expandido a la vez); expandido muestra los perfiles de ese servidor vía
 * `ProfileList`, que reordena por su cuenta dentro del servidor.
 */
const ServerListItem = ({ server, profiles }: IServerListItem) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: server.id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <Item ref={setNodeRef} style={style}>
      <HeaderRow>
        <DragHandle type="button" aria-label={`Reordenar ${server.name}`} {...attributes} {...listeners}>
          <GripVertical size={16} />
        </DragHandle>
        <ExpandButton type="button" aria-expanded={isExpanded} onClick={() => setIsExpanded((value) => !value)}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {server.name}
        </ExpandButton>
      </HeaderRow>
      {isExpanded && <ProfileList profiles={profiles} serverId={server.id} />}
    </Item>
  )
}

export default ServerListItem
