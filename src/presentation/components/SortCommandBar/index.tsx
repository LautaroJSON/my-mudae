import { useState } from 'react'
import { Check } from 'lucide-react'
import { useProfiles } from '../../context/ProfilesContext'
import { DISCORD_MESSAGE_LIMITS, formatSortCommands } from '../../../domain/parsing/formatSortCommand'
import { useCommandLimitPreference } from '../../useCommandLimitPreference'
import CopyCommandButton from '../CopyCommandButton'
import {
  CommandField,
  CommandRow,
  Counter,
  EmptyMessage,
  LimitButton,
  Panel,
  PartButton,
  PartsLabel,
  PartsRow,
} from './styles'

interface ISortCommandBar {
  isOpen: boolean
}

/**
 * Panel deslizable con el comando `$sm` del harem activo (FR-002 a
 * FR-004, FR-008, FR-009 de 009). Recalcula los comandos en cada render
 * a partir de `activeProfile.harem` (nunca un snapshot propio), para
 * cumplir el Principio II: un reordenamiento o cambio de perfil con la
 * barra abierta se refleja de inmediato. La visibilidad la decide
 * `SortCommandToggle` vía `isOpen`; ver contracts/sort-command-toggle-bar-ui.md.
 *
 * Si el comando no entra en un mensaje de Discord (límite elegido por el
 * usuario: 2000 sin Nitro, 4000 con Nitro, alternando con el número del
 * límite en el contador), se parte en varios que ya
 * vienen numerados en orden de envío (`formatSortCommands`): el botón
 * copia el actual y avanza solo al siguiente, y los números permiten
 * volver a cualquiera. El progreso vuelve a 1 cuando cambian los
 * comandos (reordenamiento, cambio de perfil o de límite).
 */
const SortCommandBar = ({ isOpen }: ISortCommandBar) => {
  const { activeProfile } = useProfiles()
  const [limit, setLimit] = useCommandLimitPreference()
  const commands = activeProfile ? formatSortCommands(activeProfile.harem, limit) : []
  const commandsKey = commands.join('\n')

  const [progress, setProgress] = useState({ key: commandsKey, index: 0, copied: new Set<number>() })
  const current = progress.key === commandsKey ? progress : { key: commandsKey, index: 0, copied: new Set<number>() }
  const command = commands[current.index] ?? null
  const isSplit = commands.length > 1
  // El número del límite en el contador es el propio toggle: alterna entre
  // las opciones de DISCORD_MESSAGE_LIMITS.
  const nextLimit = DISCORD_MESSAGE_LIMITS[(DISCORD_MESSAGE_LIMITS.indexOf(limit) + 1) % DISCORD_MESSAGE_LIMITS.length]

  const goTo = (index: number) => setProgress({ ...current, index })
  const handleCopied = () => {
    const copied = new Set(current.copied).add(current.index)
    setProgress({ key: commandsKey, copied, index: Math.min(current.index + 1, commands.length - 1) })
  }

  return (
    <Panel $isOpen={isOpen}>
      <CommandRow>
        {command === null ? (
          <EmptyMessage>No hay personajes para ordenar.</EmptyMessage>
        ) : (
          <CommandField
            readOnly
            value={command}
            aria-label={isSplit ? `Comando de orden del harem, mensaje ${current.index + 1} de ${commands.length}` : 'Comando de orden del harem'}
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
        {command !== null && (
          <Counter $isOver={command.length > limit}>
            {command.length} /
            <LimitButton
              type="button"
              aria-label={`Límite ${limit} caracteres (${limit === 2000 ? 'Discord sin Nitro' : 'Discord con Nitro'}). Cambiar a ${nextLimit}`}
              title={`Cambiar a ${nextLimit} (${nextLimit === 2000 ? 'sin Nitro' : 'con Nitro'})`}
              onClick={() => setLimit(nextLimit)}
            >
              {limit}
            </LimitButton>
          </Counter>
        )}
        <CopyCommandButton
          text={command}
          label={isSplit ? `Copiar ${current.index + 1}/${commands.length}` : 'Copiar Comando'}
          onCopied={isSplit ? handleCopied : undefined}
        />
      </CommandRow>
      {isSplit && (
        <PartsRow role="group" aria-label="Mensajes, en orden de envío">
          <PartsLabel>Mandalos en orden:</PartsLabel>
          {commands.map((_, index) => (
            <PartButton
              key={index}
              type="button"
              $isCurrent={index === current.index}
              aria-current={index === current.index ? 'step' : undefined}
              aria-label={`Mensaje ${index + 1}${current.copied.has(index) ? ', copiado' : ''}`}
              onClick={() => goTo(index)}
            >
              {current.copied.has(index) ? <Check size={12} aria-hidden="true" /> : index + 1}
            </PartButton>
          ))}
        </PartsRow>
      )}
    </Panel>
  )
}

export default SortCommandBar
