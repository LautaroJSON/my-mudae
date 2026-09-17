import { createContext, useContext, useState, type ReactNode } from 'react'
import { useProfiles } from './ProfilesContext'

/**
 * Estado efímero (no persistido, feature 011) del buscador de personajes/
 * series: si está abierto y el texto ingresado. Vive anidado dentro de
 * `ProfilesProvider` porque se resetea a cerrado/vacío cada vez que cambia
 * el perfil activo (FR-010) — nunca se guarda en `localStorage` ni
 * sobrevive a un refresh (arranca siempre en este estado inicial). Mismo
 * patrón que `HaremSortContext` (010).
 */
export interface IHaremSearchContext {
  isOpen: boolean
  query: string
  /** Cierra y limpia `query` si estaba abierto (FR-009); si estaba cerrado, abre sin tocar `query`. */
  toggleOpen: () => void
  /** No hace nada mientras `isOpen` es `false`. */
  setQuery: (value: string) => void
}

const HaremSearchContext = createContext<IHaremSearchContext | undefined>(undefined)

export interface IHaremSearchProvider {
  children: ReactNode
}

interface ISearchState {
  isOpen: boolean
  query: string
  /** Perfil sobre el que se calculó este estado — permite detectar un cambio de perfil durante el render, sin useEffect. */
  profileId: string | undefined
}

const INITIAL_SEARCH_STATE = { isOpen: false, query: '' }

const HaremSearchProvider = ({ children }: IHaremSearchProvider) => {
  const { activeProfile } = useProfiles()
  const [state, setState] = useState<ISearchState>(() => ({ ...INITIAL_SEARCH_STATE, profileId: activeProfile?.id }))

  // Reset al cambiar de perfil activo (FR-010): ajustar el estado durante
  // el render (patrón recomendado por React para "derivar" estado a partir
  // de un cambio externo) en vez de un useEffect — evita el render
  // intermedio con el estado del perfil anterior.
  if (state.profileId !== activeProfile?.id) {
    setState({ ...INITIAL_SEARCH_STATE, profileId: activeProfile?.id })
  }

  const toggleOpen: IHaremSearchContext['toggleOpen'] = () => {
    setState((previous) =>
      previous.isOpen ? { ...previous, isOpen: false, query: '' } : { ...previous, isOpen: true },
    )
  }

  const setQuery: IHaremSearchContext['setQuery'] = (value) => {
    setState((previous) => (previous.isOpen ? { ...previous, query: value } : previous))
  }

  const value: IHaremSearchContext = { isOpen: state.isOpen, query: state.query, toggleOpen, setQuery }

  return <HaremSearchContext.Provider value={value}>{children}</HaremSearchContext.Provider>
}

export function useHaremSearch(): IHaremSearchContext {
  const context = useContext(HaremSearchContext)
  if (!context) {
    throw new Error('useHaremSearch debe usarse dentro de un HaremSearchProvider')
  }
  return context
}

export default HaremSearchProvider
