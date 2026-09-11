import styled from 'styled-components'

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
    opacity: 0.5;
  }
`
