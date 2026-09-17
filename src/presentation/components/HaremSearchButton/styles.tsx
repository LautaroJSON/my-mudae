import styled from 'styled-components'

export const Field = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  height: 2.25rem;
  width: ${(props) => (props.$isOpen ? `min(${props.theme.layout.searchFieldWidth}, 45vw)` : '2.25rem')};
  border-radius: ${(props) => props.theme.radii.pill};
  border: 1px solid ${(props) => (props.$isOpen ? props.theme.colors.accent : props.theme.colors.border)};
  background: ${(props) => (props.$isOpen ? props.theme.colors.surface : 'transparent')};
  overflow: hidden;
  transition:
    width ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing},
    border-color ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing},
    background-color ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing};
`

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 ${(props) => props.theme.spacing.xs} 0 ${(props) => props.theme.spacing.md};
  font-family: ${(props) => props.theme.typography.fontBody};
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textPrimary};

  &::placeholder {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`

export const ToggleIcon = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    color: ${(props) => props.theme.colors.accent};
  }
`
