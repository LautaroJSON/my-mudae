import styled from 'styled-components'

export const Message = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  color: ${(props) => props.theme.colors.textSecondary};
`

// Mismo mecanismo visual/UX que PasteZone de PasteHaremScreen (001):
// contentEditable en vez de textarea/input para que el menú nativo
// "Pegar" también aparezca en mobile, con placeholder resuelto vía
// `:empty::before`. Duplicado a propósito en este styles.tsx en vez de
// compartir el styled-component entre carpetas de componente (ver
// research.md de 005).
export const PasteZone = styled.div`
  min-height: 8rem;
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 3px dashed ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.sm};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  outline: none;
  cursor: text;
  caret-color: transparent;
  box-shadow: 0 0 0 0 transparent;
  transition:
    border-color ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing},
    box-shadow ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing},
    caret-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:empty::before {
    content: attr(data-placeholder);
    color: ${(props) => props.theme.colors.textSecondary};
    font-family: ${(props) => props.theme.typography.fontBody};
    font-size: ${(props) => props.theme.typography.size.base};
  }

  &:focus-visible {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 0 1.5px ${(props) => props.theme.colors.accent};
    caret-color: ${(props) => props.theme.colors.accent};
  }
`

export const ErrorMessage = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.sm};
  color: ${(props) => props.theme.colors.danger};
`

export const MismatchName = styled.strong`
  color: ${(props) => props.theme.colors.danger};
`

export const RetryButton = styled.button`
  align-self: flex-end;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  border: none;
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`
