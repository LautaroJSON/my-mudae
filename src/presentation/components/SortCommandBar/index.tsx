import { useProfiles } from '../../context/ProfilesContext'
import { formatSortCommand } from '../../../domain/parsing/formatSortCommand'
import CopyCommandButton from '../CopyCommandButton'
import { CommandField, EmptyMessage, Panel } from './styles'

interface ISortCommandBar {
  isOpen: boolean
}

/**
 * Panel deslizable con el comando `$sm` del harem activo (FR-002 a
 * FR-004, FR-008, FR-009 de 009). Recalcula el comando en cada render a
 * partir de `activeProfile.harem` (nunca un snapshot propio), para
 * cumplir el Principio II: un reordenamiento o cambio de perfil con la
 * barra abierta se refleja de inmediato. La visibilidad la decide
 * `SortCommandToggle` vía `isOpen`; ver contracts/sort-command-toggle-bar-ui.md.
 */
const SortCommandBar = ({ isOpen }: ISortCommandBar) => {
  const { activeProfile } = useProfiles()
  const command = activeProfile ? formatSortCommand(activeProfile.harem) : null

  return (
    <Panel $isOpen={isOpen}>
      {command === null ? (
        <EmptyMessage>No hay personajes para ordenar.</EmptyMessage>
      ) : (
        <CommandField
          readOnly
          value={command}
          aria-label="Comando de orden del harem"
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
      <CopyCommandButton text={command} />
    </Panel>
  )
}

export default SortCommandBar
