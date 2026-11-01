import styled from "styled-components";

// Mismo botón redondo que CopyNameButton/MoveCharacterButton, apilado
// debajo de ellos: cada `$slot` baja un alto de botón (1.75rem) más la
// separación xxs. Oculto por defecto y revelado por hover/foco de la
// tarjeta solo con puntero fino; en táctil queda siempre visible (ver
// CharacterCard/styles.tsx, que lo revela vía `data-mudae-profile-link`).
export const RoundIconLink = styled.a<{ $slot: number }>`
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
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  box-shadow: ${(props) => props.theme.colors.shadowSm};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
  }

  @media (hover: hover) and (pointer: fine) {
    opacity: 0;
    transform: scale(0.85);
    pointer-events: none;
    transition: opacity ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      transform ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      background-color ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing};
  }
`;
