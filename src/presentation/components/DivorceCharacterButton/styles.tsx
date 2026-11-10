import styled from "styled-components";

// Mismo botón redondo apilado que MudaeProfileLink (`$slot`), pero rojo
// (`danger`) con el tacho oscuro (`onAccent`). Marcado se invierte (fondo
// oscuro, tacho rojo) y queda siempre visible, aunque el mouse se vaya.
export const RoundIconButton = styled.button<{ $slot: number; $isMarked: boolean }>`
  position: absolute;
  top: calc(
    ${(props) => props.theme.spacing.xs} +
      ${(props) => props.$slot} *
      (1.75rem + ${(props) => props.theme.spacing.xxs})
  );
  right: ${(props) => props.theme.spacing.xs};
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: 2px solid ${(props) => props.theme.colors.danger};
  background: ${(props) =>
    props.$isMarked ? props.theme.colors.onAccent : props.theme.colors.danger};
  color: ${(props) =>
    props.$isMarked ? props.theme.colors.danger : props.theme.colors.onAccent};
  box-shadow: ${(props) => props.theme.colors.shadowSm};
  cursor: pointer;
  transition: filter ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing};

  &:hover {
    filter: brightness(1.12);
  }

  /* Mobile: la imagen mide 112px y la pila de la derecha ya no tiene
     lugar para un cuarto botón; va a la esquina inferior izquierda de la
     imagen (la superior izquierda es del rank). */
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    top: calc(112px - 1.75rem - ${(props) => props.theme.spacing.xs});
    left: ${(props) => props.theme.spacing.xs};
    right: auto;
  }

  @media (hover: hover) and (pointer: fine) {
    opacity: ${(props) => (props.$isMarked ? 1 : 0)};
    transform: scale(${(props) => (props.$isMarked ? 1 : 0.85)});
    pointer-events: ${(props) => (props.$isMarked ? "auto" : "none")};
    transition: opacity ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      transform ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      filter ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing};
  }
`;
