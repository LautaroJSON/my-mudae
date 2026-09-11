import styled, { keyframes } from "styled-components";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Card = styled.article`
  display: grid;
  grid-template-rows: 266px auto;

  height: 340px;
  width: 171px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  overflow: hidden;
  background: ${(props) => props.theme.colors.surface};
  animation: ${fadeInUp} ${(props) => props.theme.motion.duration.slow}
    ${(props) => props.theme.motion.easing} both;
  animation-delay: calc(
    var(--mm-stagger-index, 0) *
      ${(props) => props.theme.motion.staggerStepMs}ms
  );
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: ${(props) => props.theme.colors.surfaceMuted};
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 76px;
  padding: ${(props) => props.theme.spacing.sm};
  gap: ${(props) => props.theme.spacing.xxs};
`;

export const Name = styled.span`
  font-size: ${(props) => props.theme.typography.size.sm};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  line-height: ${(props) => props.theme.typography.lineHeight.tight};
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const Meta = styled.span`
  font-size: ${(props) => props.theme.typography.size.xs};
  font-family: ${(props) => props.theme.typography.fontMono};
  color: ${(props) => props.theme.colors.textSecondary};
`;
