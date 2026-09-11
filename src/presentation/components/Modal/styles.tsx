import styled from 'styled-components'

export const Overlay = styled.div<{ $zIndex: number }>`
  position: fixed;
  inset: 0;
  background: ${(props) => props.theme.colors.overlay};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* Un poco más arriba que el centro vertical, no pegado al borde. */
  padding: 10vh ${(props) => props.theme.spacing.lg} ${(props) => props.theme.spacing.lg};
  box-sizing: border-box;
  z-index: ${(props) => props.$zIndex};
`

export const Dialog = styled.div<{ $maxWidth: string }>`
  background: ${(props) => props.theme.colors.surfaceElevated};
  color: ${(props) => props.theme.colors.textPrimary};
  border-radius: ${(props) => props.theme.radii.lg};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: ${(props) => props.$maxWidth};
  width: 100%;
  max-height: calc(100dvh - ${(props) => props.theme.spacing.xxxl});
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
  outline: none;
`
