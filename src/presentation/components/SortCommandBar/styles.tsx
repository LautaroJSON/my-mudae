import styled from "styled-components";

// Siempre montado (nunca `display: none`/desmontado condicional): la
// visibilidad se anima 100% por CSS vía `$isOpen`, en ambos sentidos
// (FR-003 de 009, ver research.md §3). `visibility` se demora al cerrar
// (transition-delay = duración de la animación) para no cortar la
// salida ni dejar el panel interactuable mientras desaparece; al abrir,
// vuelve a `visible` de inmediato (delay 0s).
export const Panel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  left: ${(props) => props.theme.spacing.lg};
  right: ${(props) => props.theme.spacing.lg};
  bottom: calc(
    ${(props) => props.theme.spacing.lg} + ${(props) => props.theme.spacing.sm}
  );
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  max-width: ${(props) => props.theme.layout.containerNarrow};
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.surfaceElevated};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.lg};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
  z-index: ${(props) => props.theme.zIndex.header};

  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(100%)"};
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
  transition:
    transform ${(props) => props.theme.motion.duration.base}
      ${(props) => props.theme.motion.easing},
    opacity ${(props) => props.theme.motion.duration.base}
      ${(props) => props.theme.motion.easing},
    visibility 0s linear
      ${(props) => (props.$isOpen ? "0s" : props.theme.motion.duration.base)};
`;

export const CommandField = styled.input`
  flex: 1;
  min-width: 0;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surfaceMuted};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.sm};
  font-family: ${(props) => props.theme.typography.fontMono};
  overflow-x: auto;
`;

export const EmptyMessage = styled.p`
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.size.sm};
`;

export const CommandRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

// Segunda fila, solo si el comando se partió en varios mensajes.
export const PartsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
`;

export const PartsLabel = styled.span`
  margin-right: ${(props) => props.theme.spacing.xxs};
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.size.xs};
`;

export const PartButton = styled.button<{ $isCurrent: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 ${(props) => props.theme.spacing.xxs};
  border-radius: ${(props) => props.theme.radii.pill};
  border: 1px solid
    ${(props) =>
      props.$isCurrent ? props.theme.colors.accent : props.theme.colors.border};
  background: ${(props) =>
    props.$isCurrent ? props.theme.colors.accent : props.theme.colors.surface};
  color: ${(props) =>
    props.$isCurrent
      ? props.theme.colors.onAccent
      : props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.xs};
  cursor: pointer;
  transition: border-color ${(props) => props.theme.motion.duration.fast}
    ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
  }
`;

export const Counter = styled.span<{ $isOver: boolean }>`
  flex-shrink: 0;
  white-space: nowrap;
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.xs};
  color: ${(props) =>
    props.$isOver ? props.theme.colors.danger : props.theme.colors.textSecondary};
`;

// El límite dentro del contador ("255 / [2000]") es el toggle 2000 ↔ 4000:
// borde y hover de acento para que se lea como presionable.
export const LimitButton = styled.button`
  margin-left: ${(props) => props.theme.spacing.xxs};
  padding: ${(props) => props.theme.spacing.xxs}
    ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: inherit;
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;
  transition: border-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing},
    color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
  }
`;
