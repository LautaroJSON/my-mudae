import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xxl};
  width: 100%;
  max-width: ${(props) => props.theme.layout.containerWide};
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xxl}
    ${(props) => props.theme.spacing.lg};
  box-sizing: border-box;
  animation: ${fadeIn} ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing} both;
`;

export const EmptyMessage = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.size.base};
`;
