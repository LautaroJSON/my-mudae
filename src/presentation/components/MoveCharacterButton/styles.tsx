import styled from "styled-components";

// Mismo botón redondo que CopyNameButton/styles.tsx, apilado justo
// debajo de él (alto 1.75rem + separación xxs). Igual que ese botón:
// oculto por defecto y revelado por hover/foco de la tarjeta solo con
// puntero fino; en táctil queda siempre visible (ver CharacterCard/
// styles.tsx, que es quien lo revela vía `data-move-character-button`).
export const RoundIconButton = styled.button`
  position: absolute;
  top: calc(
    ${(props) => props.theme.spacing.xs} + 1.75rem +
      ${(props) => props.theme.spacing.xxs}
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
  border: none;
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
