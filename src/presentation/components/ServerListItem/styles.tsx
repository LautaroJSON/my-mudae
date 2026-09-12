import styled from 'styled-components'

export const Item = styled.li`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`

export const DragHandle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: grab;
  padding: ${(props) => props.theme.spacing.xxs};
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`

export const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surfaceMuted};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.md};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  text-align: left;
  cursor: pointer;
`
