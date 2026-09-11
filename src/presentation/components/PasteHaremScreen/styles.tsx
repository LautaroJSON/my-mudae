import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
  max-width: ${(props) => props.theme.layout.containerNarrow};
  width: 100%;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xxl}
    ${(props) => props.theme.spacing.lg};
  box-sizing: border-box;
`;

export const Title = styled.h1`
  font-family: ${(props) => props.theme.typography.fontDisplay};
  font-size: ${(props) => props.theme.typography.size.xl};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

// Zona de pegado: un div focuseable (no un textarea/input) que solo
// reacciona al evento `paste`. `contentEditable` es lo que garantiza que
// el menú nativo "Pegar" también aparezca en mobile (un div común con
// solo `tabIndex` no dispara ese menú táctil); el placeholder se resuelve
// con el truco `:empty::before` en vez de un atributo `placeholder` real,
// que no existe para contentEditable.
//
// El borde punteado no puede animarse a sólido directamente (`border-style`
// no es una propiedad interpolable en CSS), así que el "borde entero" al
// enfocar se logra con un `box-shadow` del mismo grosor superpuesto sobre
// el borde punteado — eso sí se puede transicionar, y como sigue el
// `border-radius` del propio elemento, calza exacto con las esquinas
// redondeadas.
export const PasteZone = styled.div`
  min-height: 12rem;
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 3px dashed ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.sm};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  outline: none;
  cursor: text;
  /* Sin cursor de texto parpadeando hasta que se enfoca. */
  caret-color: transparent;
  box-shadow: 0 0 0 0 transparent;
  transition:
    border-color ${(props) => props.theme.motion.duration.base}
      ${(props) => props.theme.motion.easing},
    box-shadow ${(props) => props.theme.motion.duration.base}
      ${(props) => props.theme.motion.easing},
    caret-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};

  &:empty::before {
    content: attr(data-placeholder);
    color: ${(props) => props.theme.colors.textSecondary};
    font-family: ${(props) => props.theme.typography.fontBody};
    font-size: ${(props) => props.theme.typography.size.base};
  }

  &:focus-visible {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 0 1.5px ${(props) => props.theme.colors.accent};
    caret-color: ${(props) => props.theme.colors.accent};
  }
`;

export const AdviceBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surfaceMuted};
`;

export const AdviceTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  margin: 0;
  font-family: ${(props) => props.theme.typography.fontDisplay};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const AdviceList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  margin: 0;
  padding-left: ${(props) => props.theme.spacing.xl};
`;

export const AdviceItem = styled.li`
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  color: ${(props) => props.theme.colors.textSecondary};

  code {
    font-family: ${(props) => props.theme.typography.fontMono};
    font-size: ${(props) => props.theme.typography.size.sm};
    color: ${(props) => props.theme.colors.textPrimary};
    background: ${(props) => props.theme.colors.surface};
    padding: 0 0.25em;
    border-radius: ${(props) => props.theme.radii.sm};
  }
`;

export const ErrorMessage = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.sm};
  color: ${(props) => props.theme.colors.danger};
`;
