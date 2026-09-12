import styled from 'styled-components'

export const Panel = styled.div`
  position: absolute;
  bottom: calc(100% + ${(props) => props.theme.spacing.sm});
  right: 0;
  min-width: 12rem;
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.xs} 0;
  background: ${(props) => props.theme.colors.surfaceElevated};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
`
