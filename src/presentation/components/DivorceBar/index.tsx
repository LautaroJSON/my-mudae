import { useEffect, useRef, useState } from 'react'
import { Check, GemIcon, Trash2, X } from 'lucide-react'
import type { Character } from '../../../domain/harem/Character'
import { DISCORD_MESSAGE_LIMITS } from '../../../domain/parsing/formatSortCommand'
import { formatDivorceCommands } from '../../../domain/parsing/formatDivorceCommand'
import { useProfiles } from '../../context/ProfilesContext'
import { useDivorceSelection } from '../../context/DivorceSelectionContext'
import { useCommandLimitPreference } from '../../useCommandLimitPreference'
import CopyCommandButton from '../CopyCommandButton'
import {
  CommandField,
  CommandRow,
  Counter,
  LimitButton,
  Panel,
  PartButton,
  PartsLabel,
  PartsRow,
} from '../SortCommandBar/styles'
import { Actions, Chip, ChipKakera, ChipRemove, Chips, ClearButton, Head, RemoveButton, Title, Total, TotalLabel } from './styles'

const CONFIRM_TIMEOUT_MS = 4000

/**
 * Card inferior de "Divorciar" (014), con el mismo estilo y lugar que la
 * del `$sm` (`SortCommandBar`): aparece al marcar el primer personaje con
 * el tacho de su tarjeta y se oculta al quedar vacía o al abrir la barra
 * de orden. Arma el comando `$divorce` (partido si no entra en un mensaje
 * de Discord, mismo límite y mismo avance al copiar que el `$sm`) y suma
 * el kakera estimado que devolvería el divorcio: la suma del valor de
 * cada personaje, sin bonus de badges.
 *
 * "Quitar del harem" saca a los marcados de MyMudae (ya divorciados en
 * Discord); pide un segundo click para confirmar.
 */
const DivorceBar = () => {
  const { activeProfile, removeCharacters } = useProfiles()
  const divorce = useDivorceSelection()
  const [limit, setLimit] = useCommandLimitPreference()
  const [isConfirming, setIsConfirming] = useState(false)
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(confirmTimeoutRef.current), [])

  // Se cruzan los ids marcados con el harem real: si un re-pegado ya sacó
  // a alguno, desaparece solo de la card.
  const charactersById = new Map<string, Character>(
    (activeProfile?.harem.series ?? []).flatMap((series) => series.characters.map((character) => [character.id, character])),
  )
  const selected = (divorce?.selectedIds ?? [])
    .map((id) => charactersById.get(id))
    .filter((character): character is Character => character !== undefined)

  const commands = formatDivorceCommands(
    selected.map((character) => character.name),
    limit,
  )
  const commandsKey = commands.join('\n')
  const [progress, setProgress] = useState({ key: commandsKey, index: 0, copied: new Set<number>() })
  const current = progress.key === commandsKey ? progress : { key: commandsKey, index: 0, copied: new Set<number>() }
  const command = commands[current.index] ?? null
  const isSplit = commands.length > 1
  const nextLimit = DISCORD_MESSAGE_LIMITS[(DISCORD_MESSAGE_LIMITS.indexOf(limit) + 1) % DISCORD_MESSAGE_LIMITS.length]

  const totalKakera = selected.reduce((total, character) => total + (character.kakera ?? 0), 0)
  const isOpen = divorce !== undefined && selected.length > 0 && !divorce.isSortBarOpen

  const handleCopied = () => {
    const copied = new Set(current.copied).add(current.index)
    setProgress({ key: commandsKey, copied, index: Math.min(current.index + 1, commands.length - 1) })
  }

  const handleRemove = () => {
    if (!isConfirming) {
      setIsConfirming(true)
      clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = setTimeout(() => setIsConfirming(false), CONFIRM_TIMEOUT_MS)
      return
    }
    clearTimeout(confirmTimeoutRef.current)
    setIsConfirming(false)
    removeCharacters(selected.map((character) => character.id))
    divorce?.clear()
  }

  const count = selected.length
  const countLabel = `Divorciar ${count} personaje${count === 1 ? '' : 's'}`

  return (
    <Panel $isOpen={isOpen} role="region" aria-label="Divorciar personajes" aria-hidden={!isOpen}>
      <Head>
        <Title>
          <Trash2 size={14} aria-hidden="true" />
          {countLabel}
        </Title>
        <Total aria-label={`Recibirías aproximadamente ${totalKakera} de kakera`}>
          <TotalLabel>recibirías ≈</TotalLabel>
          {totalKakera.toLocaleString('es-AR')}
          <GemIcon size={12} color="var(--mm-color-accent)" fill="var(--mm-color-accent-hover)" aria-hidden="true" />
        </Total>
      </Head>
      <CommandRow>
        <CommandField
          readOnly
          value={command ?? ''}
          aria-label={isSplit ? `Comando de divorcio, mensaje ${current.index + 1} de ${commands.length}` : 'Comando de divorcio'}
          onFocus={(event) => event.currentTarget.select()}
        />
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
          label={isSplit ? `Copiar ${current.index + 1}/${commands.length}` : 'Copiar comando de divorcio'}
          onCopied={isSplit ? handleCopied : undefined}
        />
      </CommandRow>
      {isSplit && (
        <PartsRow role="group" aria-label="Mensajes de divorcio">
          <PartsLabel>Mensajes:</PartsLabel>
          {commands.map((_, index) => (
            <PartButton
              key={index}
              type="button"
              $isCurrent={index === current.index}
              aria-current={index === current.index ? 'step' : undefined}
              aria-label={`Mensaje ${index + 1}${current.copied.has(index) ? ', copiado' : ''}`}
              onClick={() => setProgress({ ...current, index })}
            >
              {current.copied.has(index) ? <Check size={12} aria-hidden="true" /> : index + 1}
            </PartButton>
          ))}
        </PartsRow>
      )}
      <Chips aria-label="Personajes a divorciar">
        {selected.map((character) => (
          <Chip key={character.id}>
            {character.name}
            {character.kakera !== undefined && <ChipKakera>{character.kakera}</ChipKakera>}
            <ChipRemove type="button" aria-label={`No divorciar a ${character.name}`} onClick={() => divorce?.toggle(character.id)}>
              <X size={12} aria-hidden="true" />
            </ChipRemove>
          </Chip>
        ))}
      </Chips>
      <Actions>
        <ClearButton type="button" onClick={() => divorce?.clear()}>
          Vaciar
        </ClearButton>
        <RemoveButton
          type="button"
          $isConfirming={isConfirming}
          title="Usalo después de mandar el comando en Discord"
          onClick={handleRemove}
        >
          <Trash2 size={14} aria-hidden="true" />
          {isConfirming ? `¿Seguro? Quitar ${count}` : 'Quitar del harem'}
        </RemoveButton>
      </Actions>
    </Panel>
  )
}

export default DivorceBar
