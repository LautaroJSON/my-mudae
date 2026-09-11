import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* flex-start (no el stretch por defecto): una serie corta al lado de
     una serie con varias filas internas de personajes no debe estirarse
     verticalmente para "rellenar" el alto de la fila — cada grupo de
     serie queda tan alto como su propio contenido. */
  align-items: flex-start;
  gap: ${(props) => props.theme.spacing.xxl};
  width: 100%;
  max-width: ${(props) => props.theme.layout.containerWide};
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xxl}
    ${(props) => props.theme.spacing.lg};
  box-sizing: border-box;
  animation: ${fadeIn} ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing} both;
`;

export const EmptyMessage = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.size.base};
`;
