import { createContext, useContext, useState, type ReactNode } from 'react'
import type { KakeraSortDirection } from '../../domain/harem/Harem'
import { useProfiles } from './ProfilesContext'

/**
 * Estado efímero (no persistido, feature 010) del ordenamiento temporal
 * por valor de kakera: si está activo y en qué dirección. Vive anidado
 * dentro de `ProfilesProvider` porque se resetea a apagado/descendente
 * cada vez que cambia el perfil activo (FR-011) — nunca se guarda en
 * `localStorage` ni sobrevive a un refresh (arranca siempre en este
 * estado inicial).
 */
export interface IHaremSortContext {
  isActive: boolean
  direction: KakeraSortDirection
  /** Apaga si estaba encendido; si estaba apagado, enciende siempre en 'desc' (FR-006). */
  toggleActive: () => void
  /** Alterna 'desc'/'asc'; no hace nada mientras isActive es false (FR-009). */
  toggleDirection: () => void
}

const HaremSortContext = createContext<IHaremSortContext | undefined>(undefined)

export interface IHaremSortProvider {
  children: ReactNode
}

interface ISortState {
  isActive: boolean
  direction: KakeraSortDirection
  /** Perfil sobre el que se calculó este estado — permite detectar un cambio de perfil durante el render, sin useEffect. */
  profileId: string | undefined
}

const INITIAL_SORT_STATE = { isActive: false, direction: 'desc' as const }

const HaremSortProvider = ({ children }: IHaremSortProvider) => {
  const { activeProfile } = useProfiles()
  const [state, setState] = useState<ISortState>(() => ({ ...INITIAL_SORT_STATE, profileId: activeProfile?.id }))

  // Reset al cambiar de perfil activo (FR-011): ajustar el estado durante
  // el render (patrón recomendado por React para "derivar" estado a
  // partir de un cambio externo) en vez de un useEffect — evita el
  // render intermedio con el estado del perfil anterior.
  if (state.profileId !== activeProfile?.id) {
    setState({ ...INITIAL_SORT_STATE, profileId: activeProfile?.id })
  }

  const toggleActive: IHaremSortContext['toggleActive'] = () => {
    setState((previous) => {
      const isActive = !previous.isActive
      return { ...previous, isActive, direction: isActive ? 'desc' : previous.direction }
    })
  }

  const toggleDirection: IHaremSortContext['toggleDirection'] = () => {
    setState((previous) =>
      previous.isActive ? { ...previous, direction: previous.direction === 'desc' ? 'asc' : 'desc' } : previous,
    )
  }

  const value: IHaremSortContext = { isActive: state.isActive, direction: state.direction, toggleActive, toggleDirection }

  return <HaremSortContext.Provider value={value}>{children}</HaremSortContext.Provider>
}

export function useHaremSort(): IHaremSortContext {
  const context = useContext(HaremSortContext)
  if (!context) {
    throw new Error('useHaremSort debe usarse dentro de un HaremSortProvider')
  }
  return context
}

export default HaremSortProvider
