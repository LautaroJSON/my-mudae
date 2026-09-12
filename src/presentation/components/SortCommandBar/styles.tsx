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
  align-items: center;
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
