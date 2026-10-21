import styled from 'styled-components'

export const Title = styled.p`
  margin: 0;
  /* Deja lugar al botón "X" absoluto de Modal. */
  padding-right: ${(props) => props.theme.spacing.xxl};
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  overflow-wrap: anywhere;
`

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`

export const OptionButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.base};
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
  }
`
