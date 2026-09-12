import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import SortCommandBar from '../SortCommandBar'
import { ToggleButton, Wrapper } from './styles'

/**
 * Ícono de flecha (FR-001/FR-002/FR-010 de 009): hermano de
 * `SettingsFab` (007), sin modificar su comportamiento. Monta
 * `SortCommandBar` siempre (nunca condicionalmente) para que su
 * animación de aparición/ocultamiento pueda correr en ambos sentidos
 * (ver research.md §3); el cierre por click-afuera/Escape sigue el
 * mismo patrón ya usado por `SettingsFab` (ver
 * contracts/sort-command-toggle-bar-ui.md).
 */
const SortCommandToggle = () => {
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
      <ToggleButton
        type="button"
        aria-label={isOpen ? 'Ocultar comando de orden' : 'Mostrar comando de orden'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        {isOpen ? <ChevronDown size={20} aria-hidden="true" /> : <ChevronUp size={20} aria-hidden="true" />}
      </ToggleButton>
      <SortCommandBar isOpen={isOpen} />
    </Wrapper>
  )
}

export default SortCommandToggle
