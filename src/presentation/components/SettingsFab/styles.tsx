import styled from 'styled-components'

export const Wrapper = styled.div`
  position: fixed;
  bottom: ${(props) => props.theme.spacing.lg};
  right: ${(props) => props.theme.spacing.lg};
  z-index: ${(props) => props.theme.zIndex.header};
`

export const FabButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: none;
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.surface};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`
