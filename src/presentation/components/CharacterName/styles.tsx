import styled, { keyframes } from "styled-components";

export const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
`;

const marquee = keyframes`
  0%, 15% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(calc(-1 * var(--mm-marquee-distance, 0px)));
  }
  85%, 100% {
    transform: translateX(0);
  }
`;

export const Text = styled.span`
  display: block;
  width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${(props) => props.theme.typography.size.sm};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  line-height: ${(props) => props.theme.typography.lineHeight.tight};
  color: ${(props) => props.theme.colors.textPrimary};

  @media (hover: hover) and (pointer: fine) {
    &[data-overflowing="true"]:hover {
      overflow: visible;
      text-overflow: clip;
      animation: ${marquee} 4s ${(props) => props.theme.motion.easing} infinite;
    }
  }
`;
