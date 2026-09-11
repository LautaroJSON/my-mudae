import styled from 'styled-components'

export const Message = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  color: ${(props) => props.theme.colors.textSecondary};
`

export const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 10rem;
  resize: vertical;
  padding: ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.surfaceMuted};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.xs};
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`

export const ConfirmButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  border: none;
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`
