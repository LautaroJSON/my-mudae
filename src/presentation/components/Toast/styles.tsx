import styled from 'styled-components'

// Sin un color "success" dedicado en theme.ts (paleta de un solo acento,
// ver shared/theme.ts): se reutiliza `accent` para la variante de éxito y
// `danger` (ya existente) para la de error, en vez de agregar un token
// de color nuevo para un único consumidor.
export const StyledToast = styled.div<{ $variant: 'success' | 'error' }>`
  position: fixed;
  bottom: ${(props) => props.theme.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  z-index: ${(props) => props.theme.zIndex.toast};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.radii.pill};
  background: ${(props) => (props.$variant === 'success' ? props.theme.colors.accent : props.theme.colors.danger)};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.medium};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
  max-width: calc(100vw - ${(props) => props.theme.spacing.xxxl});
  text-align: center;
`
