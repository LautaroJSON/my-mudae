import { parseHaremMessage } from '../../domain/parsing/parseHaremMessage'
import { syncHarem } from '../../domain/harem/syncHarem'
import { isSameUsername } from '../../domain/profile/username'
import type { ProfileRepository } from '../ports/ProfileRepository'

export type UpdateActiveProfileHaremResult =
  | { ok: true }
  | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' }
  | { ok: false; reason: 'PROFILE_MISMATCH'; pastedProfileName: string; profileUsername: string }
  | { ok: false; reason: 'NO_ACTIVE_PROFILE' }

export interface UpdateActiveProfileHaremOptions {
  /**
   * Fuerza la actualización aunque el nombre pegado no coincida con
   * `target.username`, y adopta ese nombre nuevo como `username` del
   * perfil. Es la salida para el caso "me cambié el nombre en
   * Discord/Mudae": sin esto el harem de ese perfil quedaba bloqueado
   * para siempre. Solo lo activa un gesto explícito del usuario
   * ("Actualizar de todas formas"), nunca el pegado normal.
   */
  force?: boolean
}

/**
 * Caso de uso de la User Story 1 (005), modificado en 008: sobrescribe
 * el harem del perfil activo con un nuevo pegado, siempre que el nombre
 * de usuario extraído coincida con `target.username` (comparación por
 * `username`, no por `id` — desde 008, `id` es un UUID interno sin
 * relación con el nombre de usuario; ver research.md de 008). No hace
 * falta comparar también el servidor: `target.serverId` es fijo desde
 * la creación y nunca proviene del texto pegado, así que comparar
 * contra `target.username` ya captura "¿es la misma cuenta de Mudae que
 * este perfil, en el servidor que ya tenía fijado?". A diferencia de
 * `createProfileWithServer`, nunca crea un perfil nuevo ni sincroniza
 * ningún perfil distinto del indicado: cualquier discordancia de
 * nombre (con el activo o con cualquier otro perfil existente) bloquea
 * la operación sin persistir nada (contracts/update-active-profile-harem.md).
 *
 * La comparación es tolerante (`isSameUsername`): casing, espacios y
 * caracteres invisibles del copiado de Discord no deben producir un
 * falso bloqueo. Y una discordancia real ya no es un callejón sin
 * salida: con `options.force` el perfil adopta el nombre pegado —
 * `username` dejó de ser inmutable, pero solo cambia por esta vía. El
 * `alias` nunca se toca acá: es el nombre visible que el usuario pudo
 * haber personalizado a propósito (feature 002).
 */
export function updateActiveProfileHarem(
  repository: ProfileRepository,
  activeProfileId: string,
  rawText: string,
  options: UpdateActiveProfileHaremOptions = {},
): UpdateActiveProfileHaremResult {
  const parsed = parseHaremMessage(rawText)

  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason }
  }

  const profiles = repository.getAll()
  const target = profiles.find((profile) => profile.id === activeProfileId)

  if (!target) {
    return { ok: false, reason: 'NO_ACTIVE_PROFILE' }
  }

  if (!options.force && !isSameUsername(parsed.profileName, target.username)) {
    return {
      ok: false,
      reason: 'PROFILE_MISMATCH',
      pastedProfileName: parsed.profileName,
      profileUsername: target.username,
    }
  }

  const syncedHarem = syncHarem(target.harem, parsed.series)
  // Solo al forzar se adopta el nombre pegado: en el camino normal el
  // `username` guardado ya representa a la misma cuenta (la comparación
  // tolerante puede haber pasado por alto casing o espacios) y no hay
  // razón para reescribirlo.
  const adoptedUsername = options.force ? parsed.profileName : target.username

  repository.save(
    profiles.map((profile) =>
      profile.id === activeProfileId
        ? { ...profile, username: adoptedUsername, harem: syncedHarem }
        : profile,
    ),
  )

  return { ok: true }
}
