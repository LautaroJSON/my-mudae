import styled from 'styled-components'

export const Message = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
`

export const AliasList = styled.ul`
  margin: 0;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.surfaceMuted};
`

export const AliasItem = styled.li`
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  color: ${(props) => props.theme.colors.textPrimary};
`

export const Actions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  justify-content: flex-end;
`

export const CancelButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
`

export const ConfirmButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  font-size: ${(props) => props.theme.typography.size.base};
  cursor: pointer;
  color: ${(props) => props.theme.colors.danger};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
`
