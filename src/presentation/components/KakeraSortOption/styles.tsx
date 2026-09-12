import styled from "styled-components";
import type { KakeraSortDirection } from "../../../domain/harem/Harem";

export const Wrapper = styled.li`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: 0 ${(props) => props.theme.spacing.lg};

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`;

export const Row = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.sm};
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm} 0;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.onAccent};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) =>
    props.$isActive
      ? props.theme.typography.weight.semibold
      : props.theme.typography.weight.regular};
  cursor: pointer;
  text-align: left;
`;

// Un único ícono ArrowUp rotado 180° en 'desc' (research.md §6 de 010)
// en vez de alternar entre dos íconos: 'asc' (sin activar, default) deja
// la flecha apuntando hacia arriba; 'desc' la rota apuntando hacia abajo.
export const ArrowButton = styled.button<{ $direction: KakeraSortDirection }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: none;
  background: none;
  color: ${(props) => props.theme.colors.onAccent};
  cursor: pointer;

  svg {
    transform: rotate(
      ${(props) => (props.$direction === "desc" ? "180deg" : "0deg")}
    );
    transition: transform ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};
  }

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`;
