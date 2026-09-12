import styled from 'styled-components'

// Mismo CSS que el RoundIconButton de ShareHaremButton (004), duplicado
// a propósito entre carpetas de componente en vez de compartir un
// styled-component entre ellas (ver research.md de 005).
export const RoundIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.surfaceMuted};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.border};
  }

  &:disabled {
    cursor: not-allowed;
    background: transparent;
    border-color: ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textSecondary};
  }
`
