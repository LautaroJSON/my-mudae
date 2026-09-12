import styled from "styled-components";

type Feedback = "idle" | "success";

// Oculto por defecto y revelado por hover/foco solo en dispositivos con
// puntero fino (mouse/trackpad); fuera de esa media query (táctil,
// donde no existe un hover persistente) queda siempre visible por
// default — sin ninguna detección de dispositivo por JS (research.md).
// Mientras muestra feedback de "copiado" (index.tsx), permanece visible
// aunque el mouse ya se haya ido de la tarjeta, para que el usuario
// llegue a verlo.
export const RoundIconButton = styled.button<{ $feedback: Feedback }>`
  position: absolute;
  top: ${(props) => props.theme.spacing.xs};
  right: ${(props) => props.theme.spacing.xs};
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: none;
  background: ${(props) =>
    props.$feedback === "success"
      ? props.theme.colors.accent
      : props.theme.colors.surface};
  color: ${(props) =>
    props.$feedback === "success"
      ? props.theme.colors.onAccent
      : props.theme.colors.textPrimary};
  box-shadow: ${(props) => props.theme.colors.shadowSm};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) =>
      props.$feedback === "success"
        ? props.theme.colors.accent
        : props.theme.colors.surfaceMuted};
  }

  @media (hover: hover) and (pointer: fine) {
    opacity: ${(props) => (props.$feedback === "success" ? 1 : 0)};
    transform: ${(props) =>
      props.$feedback === "success" ? "scale(1)" : "scale(0.85)"};
    pointer-events: ${(props) =>
      props.$feedback === "success" ? "auto" : "none"};
    transition: opacity ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      transform ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      background-color ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing};
  }
`;
