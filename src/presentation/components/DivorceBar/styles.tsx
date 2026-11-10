import styled from "styled-components";

// El contenedor, el campo del comando, el contador y los números de
// mensaje se reutilizan de SortCommandBar/styles.tsx (misma card, mismo
// lugar). Acá solo lo propio de "Divorciar" (014).

export const Head = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

export const Title = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  font-size: ${(props) => props.theme.typography.size.sm};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.textPrimary};

  & svg {
    color: ${(props) => props.theme.colors.danger};
  }
`;

export const Total = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
  margin-left: auto;
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.sm};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.accent};
  white-space: nowrap;
`;

export const TotalLabel = styled.span`
  font-family: ${(props) => props.theme.typography.fontBody};
  font-size: ${(props) => props.theme.typography.size.xs};
  font-weight: ${(props) => props.theme.typography.weight.regular};
  color: ${(props) => props.theme.colors.textSecondary};
`;

// Con muchos marcados la card no debe tapar media pantalla: los chips
// pasan a scroll vertical propio.
export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
  max-height: 4.5rem;
  overflow-y: auto;
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
  padding: 0.125rem ${(props) => props.theme.spacing.xxs} 0.125rem
    ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.pill};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.xs};
`;

export const ChipKakera = styled.span`
  font-family: ${(props) => props.theme.typography.fontMono};
  color: ${(props) => props.theme.colors.accent};
`;

export const ChipRemove = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  padding: 0;
  border: none;
  border-radius: ${(props) => props.theme.radii.pill};
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
    color: ${(props) => props.theme.colors.textPrimary};
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${(props) => props.theme.spacing.xs};
`;

export const ClearButton = styled.button`
  padding: ${(props) => props.theme.spacing.xxs} ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  font: inherit;
  font-size: ${(props) => props.theme.typography.size.xs};
  cursor: pointer;
  transition: border-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing},
    color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.textPrimary};
    color: ${(props) => props.theme.colors.textPrimary};
  }
`;

export const RemoveButton = styled.button<{ $isConfirming: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
  padding: ${(props) => props.theme.spacing.xxs} ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.danger};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) =>
    props.$isConfirming ? props.theme.colors.danger : "transparent"};
  color: ${(props) =>
    props.$isConfirming ? props.theme.colors.onAccent : props.theme.colors.danger};
  font: inherit;
  font-size: ${(props) => props.theme.typography.size.xs};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing},
    color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.danger};
    color: ${(props) => props.theme.colors.onAccent};
  }
`;
