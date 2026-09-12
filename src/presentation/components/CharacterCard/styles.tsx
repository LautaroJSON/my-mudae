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
  position: relative;
  display: grid;
  grid-template-rows: 224px auto;

  height: 300px;
  width: 144px;
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
  transition:
    border-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing},
    box-shadow ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: ${(props) => props.theme.colors.shadowSm};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover [data-copy-name-button],
    &:focus-within [data-copy-name-button] {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

export const Image = styled.img`
  width: calc(100% + 4px);
  height: calc(100% + 4px);
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

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 224px;
  width: 144px;
  overflow: hidden;
`;
