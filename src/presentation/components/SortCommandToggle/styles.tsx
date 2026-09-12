import styled from 'styled-components'

// Mismo `bottom`/tamaño/z-index que SettingsFab.Wrapper, pero
// desplazado a la izquierda del FAB de opciones (ancho del FAB +
// separación) para quedar "al lado del floatbutton" sin superponerse
// (ver research.md §4).
export const Wrapper = styled.div`
  position: fixed;
  bottom: ${(props) => props.theme.spacing.lg};
  right: calc(3rem + ${(props) => props.theme.spacing.sm} + ${(props) => props.theme.spacing.lg});
  z-index: ${(props) => props.theme.zIndex.header};
`

export const ToggleButton = styled.button`
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
