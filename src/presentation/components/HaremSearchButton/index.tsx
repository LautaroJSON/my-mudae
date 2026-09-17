import { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useHaremSearch } from '../../context/HaremSearchContext'
import { Field, Input, ToggleIcon } from './styles'

/**
 * Botón/campo de búsqueda dentro de `HeaderActions` (FR-001/002/003 de
 * 011): colapsado es un círculo con el ícono de lupa, mismo estilo que
 * los demás botones redondos; el propio ícono es el único toggle de
 * apertura/cierre (`toggleOpen()`, que ya limpia `query` al cerrar,
 * FR-009 — ver `HaremSearchContext`). Al expandirse, anima su `width`
 * (CSS puro, `research.md` §4) y monta un `input` que filtra
 * `HaremView` en cada tecla (FR-004, ya implementado en `HaremView`,
 * 011 US1) — sin outside-click/Escape (deliberado, `research.md` §5).
 */
const HaremSearchButton = () => {
  const { isOpen, query, toggleOpen, setQuery } = useHaremSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  return (
    <Field $isOpen={isOpen}>
      {isOpen && (
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar personaje o serie…"
          aria-label="Buscar personaje o serie"
        />
      )}
      <ToggleIcon
        type="button"
        aria-label={isOpen ? 'Cerrar buscador' : 'Buscar en el harem'}
        aria-expanded={isOpen}
        onClick={() => toggleOpen()}
      >
        <Search size={18} aria-hidden="true" />
      </ToggleIcon>
    </Field>
  )
}

export default HaremSearchButton
