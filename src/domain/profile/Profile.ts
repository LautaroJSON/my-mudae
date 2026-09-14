import type { Harem } from '../harem/Harem'

/**
 * Una cuenta/servidor separado del usuario, con exactamente un Harem
 * asociado (FR-016 de 001). Se crea únicamente a partir de un pegado de
 * harem (FR-003 de 001).
 *
 * `id` (feature 008): UUID interno estable de por vida, sin relación con
 * el nombre de usuario (antes de 008, `id` era directamente el nombre de
 * usuario — ver `research.md` de 008 para por qué eso deja de alcanzar
 * cuando el mismo usuario puede tener un perfil por servidor).
 *
 * `serverId` (feature 008): a qué `Server` pertenece; se fija al crear
 * el perfil y nunca cambia (un perfil no se puede "mover" de servidor).
 *
 * `username` (feature 008): nombre extraído del encabezado del pegado
 * (`"<username>'s harem"`). Reemplaza el rol que `id` cumplía antes para
 * decidir crear-vs-sincronizar y detectar discordancias al actualizar
 * harem — dos perfiles pueden compartir `username` si pertenecen a
 * servidores distintos, y se tratan como completamente independientes.
 * Ya no es inmutable: cambia únicamente cuando el usuario fuerza una
 * actualización de harem con un nombre distinto (se cambió el nombre en
 * Discord/Mudae), vía `updateActiveProfileHarem` con `force`. Todas las
 * comparaciones de `username` pasan por `normalizeUsername` (ver
 * `username.ts`), nunca por `===` directo.
 *
 * `alias` (feature 002): nombre visible y editable, independiente de
 * `id`/`username`. Igual a `username` al crearse; a partir de ahí se
 * edita libremente.
 */
export interface Profile {
  id: string
  serverId: string
  username: string
  alias: string
  isActive: boolean
  harem: Harem
  createdAt: string
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
 * FR-011 de 001). A partir de la feature 008 esta función se limita a
 * filtrar: ya no elige un reemplazo activo por sí sola (esa decisión
 * ahora depende también de `Server.profileIds`, así que vive en el caso
 * de uso `deleteProfile`, vía `pickNextActiveProfileId` de
 * `domain/server/Server.ts`).
 */
export function removeProfile(profiles: Profile[], profileId: string): Profile[] {
  return profiles.filter((profile) => profile.id !== profileId)
}
