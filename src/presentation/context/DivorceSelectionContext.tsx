import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useProfiles } from './ProfilesContext'

/**
 * Estado efímero (no persistido) de "Divorciar" (014): qué personajes
 * del perfil activo marcó el usuario con el tacho de su tarjeta, en el
 * orden en que los marcó. Se vacía al cambiar de perfil (mismo patrón que
 * `HaremSortContext`).
 *
 * También coordina las dos cards inferiores, que ocupan el mismo lugar:
 * la del comando `$sm` (`SortCommandToggle`) y la de `$divorce`
 * (`DivorceBar`). Abrir una cierra la otra: con la barra de orden abierta
 * la de divorcio se oculta (sin perder la selección), y marcar un
 * personaje cierra la de orden.
 */
export interface IDivorceSelectionContext {
  /** Ids marcados, en orden de marcado. Pueden incluir ids que ya no existen en el harem: quien los lee los cruza con el harem real. */
  selectedIds: string[]
  isSelected: (characterId: string) => boolean
  /** Marca o desmarca, y cierra la barra del `$sm`. Referencia estable. */
  toggle: (characterId: string) => void
  clear: () => void
  isSortBarOpen: boolean
  setSortBarOpen: (isOpen: boolean) => void
}

const DivorceSelectionContext = createContext<IDivorceSelectionContext | undefined>(undefined)

interface ISelectionState {
  ids: string[]
  /** Perfil sobre el que se marcó: detecta el cambio de perfil durante el render, sin useEffect. */
  profileId: string | undefined
}

const DivorceSelectionProvider = ({ children }: { children: ReactNode }) => {
  const { activeProfile } = useProfiles()
  const [selection, setSelection] = useState<ISelectionState>(() => ({ ids: [], profileId: activeProfile?.id }))
  const [isSortBarOpen, setSortBarOpen] = useState(false)

  if (selection.profileId !== activeProfile?.id) {
    setSelection({ ids: [], profileId: activeProfile?.id })
  }

  const toggle = useCallback((characterId: string) => {
    // Tocar una tarjeta ya cierra la barra del `$sm` por click-afuera;
    // esto cubre también el teclado.
    setSortBarOpen(false)
    setSelection((previous) => ({
      ...previous,
      ids: previous.ids.includes(characterId)
        ? previous.ids.filter((id) => id !== characterId)
        : [...previous.ids, characterId],
    }))
  }, [])

  const clear = useCallback(() => setSelection((previous) => ({ ...previous, ids: [] })), [])

  const value = useMemo<IDivorceSelectionContext>(() => {
    const selectedSet = new Set(selection.ids)
    return {
      selectedIds: selection.ids,
      isSelected: (characterId) => selectedSet.has(characterId),
      toggle,
      clear,
      isSortBarOpen,
      setSortBarOpen,
    }
  }, [selection.ids, toggle, clear, isSortBarOpen])

  return <DivorceSelectionContext.Provider value={value}>{children}</DivorceSelectionContext.Provider>
}

/** `undefined` fuera del provider: los componentes que lo usan siguen funcionando solos (ej. en tests aislados). */
export function useDivorceSelection(): IDivorceSelectionContext | undefined {
  return useContext(DivorceSelectionContext)
}

/**
 * Abierto/cerrado de la barra del `$sm`. Dentro del provider lo comparte
 * con `DivorceBar` (abrir una cierra la otra); fuera de él, estado local.
 */
export function useSortBarOpenState(): [boolean, (isOpen: boolean) => void] {
  const context = useContext(DivorceSelectionContext)
  const [localOpen, setLocalOpen] = useState(false)
  return context ? [context.isSortBarOpen, context.setSortBarOpen] : [localOpen, setLocalOpen]
}

export default DivorceSelectionProvider
