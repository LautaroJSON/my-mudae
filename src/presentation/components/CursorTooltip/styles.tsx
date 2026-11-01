import styled from "styled-components";

// Colores invertidos (fondo = texto primario) para que contraste en todo
// tema. La posición la escribe `useCursorTooltip` directo en el estilo
// (left/top) en cada movimiento del puntero, sin re-render.
export const StyledCursorTooltip = styled.div`
  position: fixed;
  z-index: ${(props) => props.theme.zIndex.dropdown};
  padding: 0.125rem ${(props) => props.theme.spacing.xs};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.textPrimary};
  color: ${(props) => props.theme.colors.surface};
  box-shadow: ${(props) => props.theme.colors.shadowSm};
  font-size: ${(props) => props.theme.typography.size.xs};
  white-space: nowrap;
  pointer-events: none;
`;
