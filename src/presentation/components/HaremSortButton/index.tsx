import { useEffect, useRef, useState } from 'react'
import { Filter } from 'lucide-react'
import HaremSortPanel from '../HaremSortPanel'
import { IconButton, Wrapper } from './styles'

/**
 * Botón circular de filtrado dentro de `HeaderActions` (FR-001 de 010):
 * al activarse, despliega `HaremSortPanel` justo debajo del header
 * (ver `research.md` §3). Mismo patrón de cierre por click-afuera/
 * Escape que `SettingsFab`/`SortCommandToggle`, comparando contra un
 * `wrapperRef` que engloba el botón y el panel.
 */
const HaremSortButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <IconButton
        type="button"
        aria-label="Ordenar harem"
        aria-expanded={isOpen}
        $isOpen={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <Filter size={18} aria-hidden="true" />
      </IconButton>
      {isOpen && <HaremSortPanel />}
    </Wrapper>
  )
}

export default HaremSortButton
