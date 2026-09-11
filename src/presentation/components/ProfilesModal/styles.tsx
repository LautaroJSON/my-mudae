import styled, { keyframes } from 'styled-components'

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xxs};
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
  }
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${(props) => props.theme.typography.fontDisplay};
  font-size: ${(props) => props.theme.typography.size.lg};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.textPrimary};
`

const fadeSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

// Se remonta (vía `key`) cada vez que se cambia entre la lista y la
// zona de pegado, para que la animación se repita en cada transición.
export const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
  animation: ${fadeSlide} ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing} both;
`

export const NewProfileButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.medium};
  cursor: pointer;
  transition:
    background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing},
    transform ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }

  &:active {
    transform: translateY(1px);
  }
`
