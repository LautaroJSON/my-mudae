import styled from 'styled-components'

// Apilado arriba de SettingsFab.Wrapper: mismo `right`, `bottom`
// desplazado hacia arriba (ancho del FAB + separación) para no
// superponerse (mismo patrón que SortCommandToggle, pero en vertical).
export const Wrapper = styled.div`
  position: fixed;
  bottom: calc(3rem + ${(props) => props.theme.spacing.sm} + ${(props) => props.theme.spacing.lg});
  right: ${(props) => props.theme.spacing.lg};
  z-index: ${(props) => props.theme.zIndex.header};
`

export const BackToTopFab = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: none;
  background: ${(props) => props.theme.colors.surfaceElevated};
  color: ${(props) => props.theme.colors.textPrimary};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
  }
`
