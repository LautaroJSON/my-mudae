import type { Harem } from '../harem/Harem'

/**
 * Una cuenta/servidor separado del usuario, con exactamente un Harem
 * asociado (FR-016 de 001). Se crea únicamente a partir de un pegado de
 * harem (FR-003 de 001).
 *
 * `id` (feature 002): se fija a partir del nombre extraído la primera
 * vez que se pegó el harem (o, para perfiles migrados, de su alias al
 * momento de migrar) y permanece invariable de por vida — es la clave
 * que decide si un pegado posterior crea un perfil nuevo o sincroniza
 * uno existente (FR-015/FR-015a), y el valor que viaja en la URL al
 * abrir un perfil en una pestaña nueva (FR-013).
 *
 * `alias` (feature 002): nombre visible y editable, independiente del
 * `id`. Igual al `id` al crearse (FR-016); a partir de ahí se edita
 * libremente sin afectar al `id`.
 */
export interface Profile {
  id: string
  alias: string
  isActive: boolean
  harem: Harem
  createdAt: string
  /** Posición manual en la lista, resultado del drag-and-drop (FR-008/009 de 002). */
  order: number
}

/**
 * Marca como activo únicamente el perfil `profileId`, desactivando
 * cualquier otro (FR-012, FR-013). No falla si `profileId` no existe en
 * `profiles` (queda ningún perfil activo).
 */
export function activateOnlyProfile(profiles: Profile[], profileId: string): Profile[] {
  return profiles.map((profile) => ({ ...profile, isActive: profile.id === profileId }))
}

/** Desactiva todos los perfiles (ninguno queda marcado como activo). */
export function deactivateAllProfiles(profiles: Profile[]): Profile[] {
  return profiles.map((profile) => (profile.isActive ? { ...profile, isActive: false } : profile))
}

/**
 * Cambia el alias de un perfil sin afectar ningún otro campo, en
 * particular sin afectar su `id` (FR-016 de 002).
 */
export function renameProfile(profiles: Profile[], profileId: string, alias: string): Profile[] {
  return profiles.map((profile) => (profile.id === profileId ? { ...profile, alias } : profile))
}

/**
 * Elimina un perfil (y, por construcción, su harem completo con él,
 * FR-011 de 001). Si el perfil eliminado era el activo y quedan otros
 * perfiles, activa automáticamente el primero de los restantes (según su
 * `order`; FR-015 de 001). Si no queda ninguno, ningún perfil queda
 * activo (FR-010 de 001).
 */
export function removeProfile(profiles: Profile[], profileId: string): Profile[] {
  const removed = profiles.find((profile) => profile.id === profileId)
  const remaining = profiles.filter((profile) => profile.id !== profileId)

  if (!removed?.isActive || remaining.length === 0) {
    return remaining
  }

  const stillHasActive = remaining.some((profile) => profile.isActive)
  if (stillHasActive) {
    return remaining
  }

  const nextActiveId = remaining.reduce((lowest, profile) =>
    profile.order < lowest.order ? profile : lowest,
  ).id

  return remaining.map((profile) => (profile.id === nextActiveId ? { ...profile, isActive: true } : profile))
}

/**
 * Reasigna `order` de forma densa (0, 1, 2, ...) según `orderedIds`
 * (FR-008/009 de 002). Tolera ids que no correspondan a ningún perfil
 * (se ignoran) y perfiles ausentes de `orderedIds` (quedan al final, en
 * su orden relativo anterior según su `order` actual) — nunca falla ni
 * pierde perfiles.
 */
export function reorderProfiles(profiles: Profile[], orderedIds: string[]): Profile[] {
  const knownIds = new Set(profiles.map((profile) => profile.id))
  const requestedKnown = orderedIds.filter((id) => knownIds.has(id))
  const requestedSet = new Set(requestedKnown)

  const missing = profiles
    .filter((profile) => !requestedSet.has(profile.id))
    .sort((a, b) => a.order - b.order)
    .map((profile) => profile.id)

  const finalSequence = [...requestedKnown, ...missing]
  const newOrderById = new Map(finalSequence.map((id, index) => [id, index]))

  return profiles.map((profile) => ({ ...profile, order: newOrderById.get(profile.id) ?? profile.order }))
}
