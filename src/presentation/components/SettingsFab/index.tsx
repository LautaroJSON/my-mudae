import { useEffect, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import SettingsMenu from '../SettingsMenu'
import ThemeMenuItem from '../ThemeMenuItem'
import { FabButton, Wrapper } from './styles'

/**
 * Botón flotante de opciones (FR-001/FR-002 de 007): circular, fijo en
 * la esquina inferior derecha, siempre visible (montado a nivel de
 * `App`, fuera de cualquier condicional de perfil/vista). Al activarse
 * despliega `SettingsMenu` encima de él; se cierra con click afuera o
 * Escape, sin aplicar ningún cambio adicional (ver
 * contracts/settings-menu-ui.md).
 */
const SettingsFab = () => {
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
      <FabButton
        type="button"
        aria-label="Opciones"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <Settings size={20} aria-hidden="true" />
      </FabButton>
      {isOpen && (
        <SettingsMenu>
          <ThemeMenuItem />
        </SettingsMenu>
      )}
    </Wrapper>
  )
}

export default SettingsFab
