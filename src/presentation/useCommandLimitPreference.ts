import { useEffect, useState } from 'react'
import { DISCORD_MESSAGE_LIMITS, type DiscordMessageLimit } from '../domain/parsing/formatSortCommand'

const STORAGE_KEY = 'mymudae:commandLimit'

function readStoredLimit(): DiscordMessageLimit {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    if ((DISCORD_MESSAGE_LIMITS as readonly number[]).includes(stored)) {
      return stored as DiscordMessageLimit
    }
  } catch {
    // localStorage no disponible: se comporta como sin preferencia guardada.
  }
  return 2000
}

/**
 * Largo máximo de mensaje de Discord con el que se parte el comando `$sm`
 * (2000 sin Nitro, 4000 con Nitro). Lee y persiste en `localStorage`,
 * mismo patrón defensivo que `useThemePreference`: nunca lanza.
 */
export function useCommandLimitPreference(): [DiscordMessageLimit, (limit: DiscordMessageLimit) => void] {
  const [limit, setLimit] = useState<DiscordMessageLimit>(() => readStoredLimit())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(limit))
    } catch {
      // Igual que la lectura: no bloquea la UI si no se puede persistir.
    }
  }, [limit])

  return [limit, setLimit]
}
