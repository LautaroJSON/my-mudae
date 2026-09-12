import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Profile } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../../application/ports/ProfileRepository'
import { LocalStorageProfileRepository } from '../../infrastructure/storage/LocalStorageProfileRepository'
import {
  createProfileFromPaste as createProfileFromPasteUseCase,
  type CreateProfileFromPasteResult,
} from '../../application/useCases/createProfileFromPaste'
import { activateProfile as activateProfileUseCase } from '../../application/useCases/activateProfile'
import { deleteProfile as deleteProfileUseCase } from '../../application/useCases/deleteProfile'
import { renameProfile as renameProfileUseCase } from '../../application/useCases/renameProfile'
import { reorderProfiles as reorderProfilesUseCase } from '../../application/useCases/reorderProfiles'
import { reorderCharactersInSeries as reorderCharactersInSeriesUseCase } from '../../application/useCases/reorderCharactersInSeries'
import { reorderSeries as reorderSeriesUseCase } from '../../application/useCases/reorderSeries'
import {
  updateActiveProfileHarem as updateActiveProfileHaremUseCase,
  type UpdateActiveProfileHaremResult,
} from '../../application/useCases/updateActiveProfileHarem'
import { getProfileIdFromUrl } from '../urlParams'

export type { CreateProfileFromPasteResult, UpdateActiveProfileHaremResult }

export type UrlProfileStatus = 'none' | 'activated' | 'not-found'

function sortByOrder(profiles: Profile[]): Profile[] {
  return [...profiles].sort((a, b) => a.order - b.order)
}

/**
 * Resuelve el estado inicial de una pestaña (FR-017/FR-018 de 002): si
 * la URL trae un `id` que coincide con un perfil existente, ese perfil
 * se activa (se persiste, con el mismo efecto que `activateProfile`)
 * antes del primer render; si no coincide con nada, el activo persistido
 * NO se toca, pero se expone `urlProfileStatus: 'not-found'` para que
 * `presentation/` muestre un estado claro en vez de sustituirlo en
 * silencio. Sin `id` en la URL, comportamiento sin cambios.
 */
function resolveInitialState(repository: ProfileRepository): { profiles: Profile[]; urlProfileStatus: UrlProfileStatus } {
  const stored = repository.getAll()
  const urlId = getProfileIdFromUrl(window.location.search)

  if (!urlId) {
    return { profiles: sortByOrder(stored), urlProfileStatus: 'none' }
  }

  if (!stored.some((profile) => profile.id === urlId)) {
    return { profiles: sortByOrder(stored), urlProfileStatus: 'not-found' }
  }

  activateProfileUseCase(repository, urlId)
  return { profiles: sortByOrder(repository.getAll()), urlProfileStatus: 'activated' }
}

/**
 * Contrato expuesto a presentation/components/: la única API que un
 * componente puede usar para leer o mutar el estado de perfiles/harems.
 * Ver contracts/profiles-context.md.
 */
export interface IProfilesContext {
  /** Siempre ordenado por `order` ascendente. */
  profiles: Profile[]
  activeProfile: Profile | undefined
  /** Resultado de resolver el `id` de la URL al cargar esta pestaña (User Story 5 de 002). */
  urlProfileStatus: UrlProfileStatus
  createProfileFromPaste: (rawText: string) => CreateProfileFromPasteResult
  renameProfile: (profileId: string, alias: string) => void
  deleteProfile: (profileId: string) => void
  activateProfile: (profileId: string) => void
  reorderProfiles: (orderedIds: string[]) => void
  /** Reordena los personajes de una serie del harem del perfil activo (User Story 2 de 003). No hace nada si no hay perfil activo. */
  reorderCharactersInSeries: (seriesId: string, orderedCharacterIds: string[]) => void
  /** Reordena las series del harem del perfil activo (User Story 3 de 003). No hace nada si no hay perfil activo. */
  reorderSeries: (orderedSeriesIds: string[]) => void
  /** Sobrescribe el harem del perfil activo con un nuevo pegado (User Story 1 de 005). Devuelve `NO_ACTIVE_PROFILE` sin llamar al caso de uso si no hay perfil activo. */
  updateActiveProfileHarem: (rawText: string) => UpdateActiveProfileHaremResult
}

const ProfilesContext = createContext<IProfilesContext | undefined>(undefined)

export interface IProfilesProvider {
  children: ReactNode
  /** Inyectable para tests (ver tests/support/InMemoryProfileRepository.ts). */
  repository?: ProfileRepository
}

const ProfilesProvider = ({ children, repository }: IProfilesProvider) => {
  const activeRepository = useMemo(() => repository ?? new LocalStorageProfileRepository(), [repository])
  const [state, setState] = useState(() => resolveInitialState(activeRepository))
  const { profiles, urlProfileStatus } = state
  const activeProfile = profiles.find((profile) => profile.isActive)

  const syncFromRepository = () => {
    setState((previous) => ({ ...previous, profiles: sortByOrder(activeRepository.getAll()) }))
  }

  const createProfileFromPaste: IProfilesContext['createProfileFromPaste'] = (rawText) => {
    const result = createProfileFromPasteUseCase(activeRepository, rawText)
    if (result.ok) {
      syncFromRepository()
    }
    return result
  }

  const renameProfile: IProfilesContext['renameProfile'] = (profileId, alias) => {
    renameProfileUseCase(activeRepository, profileId, alias)
    syncFromRepository()
  }

  const deleteProfile: IProfilesContext['deleteProfile'] = (profileId) => {
    deleteProfileUseCase(activeRepository, profileId)
    syncFromRepository()
  }

  const activateProfile: IProfilesContext['activateProfile'] = (profileId) => {
    activateProfileUseCase(activeRepository, profileId)
    syncFromRepository()
  }

  const reorderProfiles: IProfilesContext['reorderProfiles'] = (orderedIds) => {
    reorderProfilesUseCase(activeRepository, orderedIds)
    syncFromRepository()
  }

  const reorderCharactersInSeries: IProfilesContext['reorderCharactersInSeries'] = (seriesId, orderedCharacterIds) => {
    if (!activeProfile) {
      return
    }
    reorderCharactersInSeriesUseCase(activeRepository, activeProfile.id, seriesId, orderedCharacterIds)
    syncFromRepository()
  }

  const reorderSeries: IProfilesContext['reorderSeries'] = (orderedSeriesIds) => {
    if (!activeProfile) {
      return
    }
    reorderSeriesUseCase(activeRepository, activeProfile.id, orderedSeriesIds)
    syncFromRepository()
  }

  const updateActiveProfileHarem: IProfilesContext['updateActiveProfileHarem'] = (rawText) => {
    if (!activeProfile) {
      return { ok: false, reason: 'NO_ACTIVE_PROFILE' }
    }
    const result = updateActiveProfileHaremUseCase(activeRepository, activeProfile.id, rawText)
    if (result.ok) {
      syncFromRepository()
    }
    return result
  }

  const value: IProfilesContext = {
    profiles,
    activeProfile,
    urlProfileStatus,
    createProfileFromPaste,
    renameProfile,
    deleteProfile,
    activateProfile,
    reorderProfiles,
    reorderCharactersInSeries,
    reorderSeries,
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
