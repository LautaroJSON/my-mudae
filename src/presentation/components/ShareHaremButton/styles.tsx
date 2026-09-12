import styled, { type DefaultTheme } from 'styled-components'

type Feedback = 'idle' | 'success' | 'error'

function feedbackBackground(feedback: Feedback, theme: DefaultTheme): string {
  if (feedback === 'success') return theme.colors.accent
  if (feedback === 'error') return theme.colors.danger
  return theme.colors.surfaceMuted
}

// El feedback de "copiado" (FR-006/FR-008 de 004) se muestra en el
// propio botón (fill de acento/danger + icono) en vez de un `Toast`
// aparte, por unos segundos (ver index.tsx).
export const RoundIconButton = styled.button<{ $feedback: Feedback }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: 1px solid ${(props) => (props.$feedback === 'idle' ? props.theme.colors.border : 'transparent')};
  background: ${(props) => feedbackBackground(props.$feedback, props.theme)};
  color: ${(props) => (props.$feedback === 'idle' ? props.theme.colors.textPrimary : props.theme.colors.onAccent)};
  cursor: pointer;
  transition:
    background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing},
    color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$feedback === 'idle' ? props.theme.colors.border : feedbackBackground(props.$feedback, props.theme))};
  }

  &:disabled {
    cursor: not-allowed;
    background: transparent;
    border-color: ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textSecondary};
  }
`
