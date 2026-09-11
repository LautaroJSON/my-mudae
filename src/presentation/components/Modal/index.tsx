import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { theme } from '../../../shared/theme'
import { Dialog, Overlay } from './styles'

interface IModal {
  onClose: () => void
  ariaLabel: string
  children: ReactNode
  /** Nivel de apilamiento; usar `theme.zIndex.nestedDialog` para un modal que se abre encima de otro. */
  zIndex?: number
  maxWidth?: string
  /** `alertdialog` para confirmaciones (ej. borrar), `dialog` para todo lo demás. */
  role?: 'dialog' | 'alertdialog'
}

/**
 * Overlay + diálogo genérico y reutilizable: cierra con click afuera,
 * tecla Escape, o llamando a `onClose` desde el contenido. `ProfilesModal`
 * y `ConfirmDeleteProfileDialog` se construyen sobre este componente en
 * vez de duplicar el patrón overlay/diálogo cada uno por su lado (ver
 * research.md de 002).
 */
const Modal = ({
  onClose,
  ariaLabel,
  children,
  zIndex = theme.zIndex.modal,
  maxWidth = theme.layout.dialogWidth,
  role = 'dialog',
}: IModal) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <Overlay $zIndex={zIndex} onClick={onClose}>
      <Dialog
        ref={dialogRef}
        $maxWidth={maxWidth}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onClick={(event: MouseEvent) => event.stopPropagation()}
      >
        {children}
      </Dialog>
    </Overlay>
  )
}

export default Modal
