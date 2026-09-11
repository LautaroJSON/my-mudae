import { useEffect } from 'react'
import { StyledToast } from './styles'

interface IToast {
  variant: 'success' | 'error'
  message: string
  onDismiss: () => void
  /** Milisegundos antes de autodescartarse (Principio VI: feedback no bloqueante). */
  durationMs?: number
}

/**
 * Feedback temporal no bloqueante de éxito/error, reutilizable por
 * cualquier acción que lo necesite (hoy, solo `ShareHaremButton`). No
 * mantiene ninguna cola global: cada consumidor monta/desmonta su propia
 * instancia (ver research.md de 004).
 */
const Toast = ({ variant, message, onDismiss, durationMs = 2500 }: IToast) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [onDismiss, durationMs])

  return (
    <StyledToast $variant={variant} role="status" aria-live="polite">
      {message}
    </StyledToast>
  )
}

export default Toast
