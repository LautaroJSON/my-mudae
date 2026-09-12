import styled from 'styled-components'

export const Wrapper = styled.li`
  padding: 0 ${(props) => props.theme.spacing.lg};
`

export const Row = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm} 0;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.onAccent};
  font-size: ${(props) => props.theme.typography.size.base};
  text-align: left;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
