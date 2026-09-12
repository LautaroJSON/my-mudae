import styled from "styled-components";

export const Panel = styled.div`
  position: absolute;
  top: 70px;
  /* left: 2px; */
  right: 12px;
  width: 300px;
  z-index: ${(props) => props.theme.zIndex.dropdown};
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.xs};
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.onAccent};
  box-shadow: ${(props) => props.theme.colors.shadowLg};
  border-radius: ${(props) => props.theme.radii.md};
`;

export const SectionRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.sm};
  /* width: 100%; */
  margin: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.onAccent};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.bold};
  cursor: pointer;
  text-align: left;
  border-radius: ${(props) => props.theme.radii.sm};

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`;

export const OptionsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${(props) => props.theme.spacing.xxs} 0;
  border-top: 1px solid ${(props) => props.theme.colors.accentHover};
`;
