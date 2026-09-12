import styled from 'styled-components'

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textPrimary};
`

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: ${(props) => props.theme.typography.size.md};
  padding: ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const RadioList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`

export const RadioRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`

export const Radio = styled.input`
  flex-shrink: 0;
  accent-color: ${(props) => props.theme.colors.accent};
`

export const RadioLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
`

export const DeleteServerButton = styled.button`
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
    color: ${(props) => props.theme.colors.danger};
  }
`

export const ConfirmButton = styled.button`
  align-self: flex-end;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.medium};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
