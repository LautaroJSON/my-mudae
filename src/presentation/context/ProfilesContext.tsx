import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Profile } from '../../domain/profile/Profile'
import type { Server } from '../../domain/server/Server'
import type { ProfileRepository } from '../../application/ports/ProfileRepository'
import type { ServerRepository } from '../../application/ports/ServerRepository'
import { LocalStorageProfileRepository } from '../../infrastructure/storage/LocalStorageProfileRepository'
import { LocalStorageServerRepository } from '../../infrastructure/storage/LocalStorageServerRepository'
import {
  createProfileWithServer as createProfileWithServerUseCase,
  type CreateProfileWithServerResult,
  type ServerChoice,
} from '../../application/useCases/createProfileWithServer'
import { activateProfile as activateProfileUseCase } from '../../application/useCases/activateProfile'
import { deleteProfile as deleteProfileUseCase } from '../../application/useCases/deleteProfile'
import { deleteServer as deleteServerUseCase } from '../../application/useCases/deleteServer'
import { renameProfile as renameProfileUseCase } from '../../application/useCases/renameProfile'
import { reorderServers as reorderServersUseCase } from '../../application/useCases/reorderServers'
import { reorderProfilesInServer as reorderProfilesInServerUseCase } from '../../application/useCases/reorderProfilesInServer'
import { reorderCharactersInSeries as reorderCharactersInSeriesUseCase } from '../../application/useCases/reorderCharactersInSeries'
import { reorderSeries as reorderSeriesUseCase } from '../../application/useCases/reorderSeries'
import { moveCharacterToBlock as moveCharacterToBlockUseCase } from '../../application/useCases/moveCharacterToBlock'
import { mergeSeriesBlock as mergeSeriesBlockUseCase } from '../../application/useCases/mergeSeriesBlock'
import { setSeriesVisibleCount as setSeriesVisibleCountUseCase } from '../../application/useCases/setSeriesVisibleCount'
import {
  updateActiveProfileHarem as updateActiveProfileHaremUseCase,
  type UpdateActiveProfileHaremOptions,
  type UpdateActiveProfileHaremResult,
} from '../../application/useCases/updateActiveProfileHarem'
import type { ParsedSeries } from '../../domain/parsing/parseHaremMessage'
import { getProfileIdFromUrl } from '../urlParams'

export type {
  CreateProfileWithServerResult,
  ServerChoice,
  UpdateActiveProfileHaremOptions,
  UpdateActiveProfileHaremResult,
}

export type UrlProfileStatus = 'none' | 'activated' | 'not-found'

/**
 * Resuelve el estado inicial de una pestaña (FR-017/FR-018 de 002): si
 * la URL trae un `id` que coincide con un perfil existente, ese perfil
 * se activa (se persiste, con el mismo efecto que `activateProfile`)
 * antes del primer render; si no coincide con nada, el activo persistido
 * NO se toca, pero se expone `urlProfileStatus: 'not-found'` para que
 * `presentation/` muestre un estado claro en vez de sustituirlo en
 * silencio. Sin `id` en la URL, comportamiento sin cambios.
 */
function resolveInitialState(profileRepository: ProfileRepository): { profiles: Profile[]; urlProfileStatus: UrlProfileStatus } {
  const stored = profileRepository.getAll()
  const urlId = getProfileIdFromUrl(window.location.search)

  if (!urlId) {
    return { profiles: stored, urlProfileStatus: 'none' }
  }

  if (!stored.some((profile) => profile.id === urlId)) {
    return { profiles: stored, urlProfileStatus: 'not-found' }
  }

  activateProfileUseCase(profileRepository, urlId)
  return { profiles: profileRepository.getAll(), urlProfileStatus: 'activated' }
}

/**
 * Contrato expuesto a presentation/components/: la única API que un
 * componente puede usar para leer o mutar el estado de perfiles/harems/
 * servidores (008).
 */
export interface IProfilesContext {
  /** En su propio orden de array (008: sin `order`, el orden lo da `Server.profileIds`/`servers`). */
  profiles: Profile[]
  /** En su propio orden de array (008, FR-012). */
  servers: Server[]
  activeProfile: Profile | undefined
  /** Resultado de resolver el `id` de la URL al cargar esta pestaña (User Story 5 de 002). */
  urlProfileStatus: UrlProfileStatus
  /** Crea o sincroniza un perfil ya parseado, asociado a un servidor nuevo o existente (User Story 1 de 008). */
  createProfileWithServer: (parsedUsername: string, parsedSeries: ParsedSeries[], choice: ServerChoice) => CreateProfileWithServerResult
  renameProfile: (profileId: string, alias: string) => void
  deleteProfile: (profileId: string) => void
  /** Elimina un servidor y, en cascada, todos sus perfiles (User Story 2 de 008). */
  deleteServer: (serverId: string) => void
  activateProfile: (profileId: string) => void
  /** Reordena los servidores entre sí (User Story 4 de 008). */
  reorderServers: (orderedServerIds: string[]) => void
  /** Reordena los perfiles dentro de UN servidor (User Story 4 de 008). */
  reorderProfilesInServer: (serverId: string, orderedProfileIds: string[]) => void
  /** Reordena los personajes de una serie del harem del perfil activo (User Story 2 de 003). No hace nada si no hay perfil activo. */
  reorderCharactersInSeries: (seriesId: string, orderedCharacterIds: string[]) => void
  /** Reordena las series del harem del perfil activo (User Story 3 de 003). No hace nada si no hay perfil activo. */
  reorderSeries: (orderedSeriesIds: string[]) => void
  /**
   * Mueve un personaje a otro bloque de su misma serie, o a un bloque separado nuevo con
   * `targetSeriesId: null` (012). No hace nada si no hay perfil activo.
   */
  moveCharacterToBlock: (fromSeriesId: string, characterId: string, targetSeriesId: string | null) => void
  /** Une un bloque separado al bloque principal de su serie (012). No hace nada si no hay perfil activo. */
  mergeSeriesBlock: (seriesId: string) => void
  /**
   * Fija cuántos personajes muestra a lo ancho un bloque antes de pasar a scroll
   * (013); `null` lo devuelve al ancho completo. No hace nada si no hay perfil activo.
   */
  setSeriesVisibleCount: (seriesId: string, visibleCount: number | null) => void
  /**
   * Sobrescribe el harem del perfil activo con un nuevo pegado (User Story 1 de 005).
   * Devuelve `NO_ACTIVE_PROFILE` sin llamar al caso de uso si no hay perfil activo.
   * Con `{ force: true }` ignora la discordancia de nombre y adopta el nombre pegado
   * como `username` del perfil.
   */
  updateActiveProfileHarem: (
    rawText: string,
    options?: UpdateActiveProfileHaremOptions,
  ) => UpdateActiveProfileHaremResult
}

const ProfilesContext = createContext<IProfilesContext | undefined>(undefined)

export interface IProfilesProvider {
  children: ReactNode
  /** Inyectable para tests (ver tests/support/InMemoryProfileRepository.ts). */
  repository?: ProfileRepository
  /** Inyectable para tests (ver tests/support/InMemoryServerRepository.ts). */
  serverRepository?: ServerRepository
}

const ProfilesProvider = ({ children, repository, serverRepository }: IProfilesProvider) => {
  const activeRepository = useMemo(() => repository ?? new LocalStorageProfileRepository(), [repository])
  const activeServerRepository = useMemo(() => serverRepository ?? new LocalStorageServerRepository(), [serverRepository])
  const [state, setState] = useState(() => resolveInitialState(activeRepository))
  const { profiles, urlProfileStatus } = state
  const [servers, setServers] = useState(() => activeServerRepository.getAll())
  const activeProfile = profiles.find((profile) => profile.isActive)

  const syncFromRepositories = () => {
    setState((previous) => ({ ...previous, profiles: activeRepository.getAll() }))
    setServers(activeServerRepository.getAll())
  }

  const createProfileWithServer: IProfilesContext['createProfileWithServer'] = (parsedUsername, parsedSeries, choice) => {
    const result = createProfileWithServerUseCase(activeRepository, activeServerRepository, parsedUsername, parsedSeries, choice)
    if (result.ok) {
      syncFromRepositories()
    }
    return result
  }

  const renameProfile: IProfilesContext['renameProfile'] = (profileId, alias) => {
    renameProfileUseCase(activeRepository, profileId, alias)
    syncFromRepositories()
  }

  const deleteProfile: IProfilesContext['deleteProfile'] = (profileId) => {
    deleteProfileUseCase(activeRepository, activeServerRepository, profileId)
    syncFromRepositories()
  }

  const deleteServer: IProfilesContext['deleteServer'] = (serverId) => {
    deleteServerUseCase(activeRepository, activeServerRepository, serverId)
    syncFromRepositories()
  }

  const activateProfile: IProfilesContext['activateProfile'] = (profileId) => {
    activateProfileUseCase(activeRepository, profileId)
    syncFromRepositories()
  }

  const reorderServers: IProfilesContext['reorderServers'] = (orderedServerIds) => {
    reorderServersUseCase(activeServerRepository, orderedServerIds)
    syncFromRepositories()
  }

  const reorderProfilesInServer: IProfilesContext['reorderProfilesInServer'] = (serverId, orderedProfileIds) => {
    reorderProfilesInServerUseCase(activeServerRepository, serverId, orderedProfileIds)
    syncFromRepositories()
  }

  const reorderCharactersInSeries: IProfilesContext['reorderCharactersInSeries'] = (seriesId, orderedCharacterIds) => {
    if (!activeProfile) {
      return
    }
    reorderCharactersInSeriesUseCase(activeRepository, activeProfile.id, seriesId, orderedCharacterIds)
    syncFromRepositories()
  }

  const reorderSeries: IProfilesContext['reorderSeries'] = (orderedSeriesIds) => {
    if (!activeProfile) {
      return
    }
    reorderSeriesUseCase(activeRepository, activeProfile.id, orderedSeriesIds)
    syncFromRepositories()
  }

  const moveCharacterToBlock: IProfilesContext['moveCharacterToBlock'] = (fromSeriesId, characterId, targetSeriesId) => {
    if (!activeProfile) {
      return
    }
    moveCharacterToBlockUseCase(activeRepository, activeProfile.id, fromSeriesId, characterId, targetSeriesId)
    syncFromRepositories()
  }

  const mergeSeriesBlock: IProfilesContext['mergeSeriesBlock'] = (seriesId) => {
    if (!activeProfile) {
      return
    }
    mergeSeriesBlockUseCase(activeRepository, activeProfile.id, seriesId)
    syncFromRepositories()
  }

  const setSeriesVisibleCount: IProfilesContext['setSeriesVisibleCount'] = (seriesId, visibleCount) => {
    if (!activeProfile) {
      return
    }
    setSeriesVisibleCountUseCase(activeRepository, activeProfile.id, seriesId, visibleCount)
    syncFromRepositories()
  }

  const updateActiveProfileHarem: IProfilesContext['updateActiveProfileHarem'] = (rawText, options) => {
    if (!activeProfile) {
      return { ok: false, reason: 'NO_ACTIVE_PROFILE' }
    }
    const result = updateActiveProfileHaremUseCase(activeRepository, activeProfile.id, rawText, options)
    if (result.ok) {
      syncFromRepositories()
    }
    return result
  }

  const value: IProfilesContext = {
    profiles,
    servers,
    activeProfile,
    urlProfileStatus,
    createProfileWithServer,
    renameProfile,
    deleteProfile,
    deleteServer,
    activateProfile,
    reorderServers,
    reorderProfilesInServer,
    reorderCharactersInSeries,
    reorderSeries,
    moveCharacterToBlock,
    mergeSeriesBlock,
    setSeriesVisibleCount,
    updateActiveProfileHarem,
  }

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}

export function useProfiles(): IProfilesContext {
  const context = useContext(ProfilesContext)
  if (!context) {
    throw new Error('useProfiles debe usarse dentro de un ProfilesProvider')
  }
  return context
}

export default ProfilesProvider
