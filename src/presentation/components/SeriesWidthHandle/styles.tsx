import styled from "styled-components";

// Ocupa el padding derecho de `Section` (SeriesGroup), así que no tapa
// tarjetas ni queda recortada por ningún contenedor. Igual que "bloque N"
// y "Unir", aparece con hover/foco del bloque solo con puntero fino; en
// táctil queda siempre visible. `touch-action: none` evita que el gesto
// se interprete como scroll en pantallas táctiles.
export const Handle = styled.div`
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  bottom: ${(props) => props.theme.spacing.md};
  right: 0;
  width: ${(props) => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  touch-action: none;
  border-radius: ${(props) => props.theme.radii.sm};
  transition: opacity ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing};

  &::before {
    content: "";
    width: 4px;
    height: 2.5rem;
    max-height: 100%;
    border-radius: ${(props) => props.theme.radii.pill};
    background: ${(props) => props.theme.colors.textSecondary};
    transition: background-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};
  }

  &:hover::before,
  &[data-dragging]::before,
  &:focus-visible::before {
    background: ${(props) => props.theme.colors.accent};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.accent};
    outline-offset: 1px;
  }

  @media (hover: hover) and (pointer: fine) {
    opacity: 0;

    &[data-dragging],
    &:focus-visible {
      opacity: 1;
    }
  }
`;

// Colores invertidos, mismo criterio que CursorTooltip.
export const SizeTip = styled.span`
  position: absolute;
  bottom: calc(100% + ${(props) => props.theme.spacing.xs});
  right: 0;
  padding: 0.125rem ${(props) => props.theme.spacing.xs};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.textPrimary};
  color: ${(props) => props.theme.colors.surface};
  box-shadow: ${(props) => props.theme.colors.shadowSm};
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.xs};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
`;
