import styled from 'styled-components'

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  margin: 0;
  padding: 0;
  width: 100%;
`

export const EmptyMessage = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textSecondary};
`
