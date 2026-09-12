import styled from 'styled-components'

export const Item = styled.div`
  display: flex;
  flex-direction: column;
`

export const Row = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.sm};
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.base};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
  }
`

export const ThemeList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`

export const ThemeOption = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.sm};
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) =>
    props.$isActive ? props.theme.typography.weight.semibold : props.theme.typography.weight.regular};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
  }
`
