import styled from "styled-components";

export const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: ${(props) => props.theme.zIndex.header};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

export const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

export const Title = styled.span`
  font-family: ${(props) => props.theme.typography.fontDisplay};
  font-size: ${(props) => props.theme.typography.size.lg};
  font-weight: ${(props) => props.theme.typography.weight.bold};
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const VersionTag = styled.span`
  margin-top: 4px;
  font-size: ${(props) => props.theme.typography.size.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const ProfileButton = styled.button`
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.pill};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.surfaceMuted};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.medium};
  cursor: pointer;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color ${(props) => props.theme.motion.duration.fast}
    ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.border};
  }
`;
