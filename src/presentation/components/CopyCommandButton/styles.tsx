import styled, { type DefaultTheme } from 'styled-components'

type Feedback = 'idle' | 'success' | 'error'

function feedbackBackground(feedback: Feedback, theme: DefaultTheme): string {
  if (feedback === 'success') return theme.colors.accent
  if (feedback === 'error') return theme.colors.danger
  return theme.colors.accent
}

// Mismo patrón de feedback en el propio botón (sin `Toast` aparte) que
// `ShareHaremButton` (004): fill de acento/danger + ícono, por unos
// segundos (ver index.tsx).
export const Button = styled.button<{ $feedback: Feedback }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.radii.pill};
  border: none;
  background: ${(props) => feedbackBackground(props.$feedback, props.theme)};
  color: ${(props) => props.theme.colors.onAccent};
  font-size: ${(props) => props.theme.typography.size.sm};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  white-space: nowrap;
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$feedback === 'idle' ? props.theme.colors.accentHover : feedbackBackground(props.$feedback, props.theme))};
  }

  &:disabled {
    cursor: not-allowed;
    background: ${(props) => props.theme.colors.surfaceMuted};
    color: ${(props) => props.theme.colors.textSecondary};
  }
`
