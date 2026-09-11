import styled from 'styled-components'

/**
 * Estilos puntuales de la composición raíz (`App.tsx`). Vive junto a
 * `GlobalStyle.tsx` fuera de `components/` porque no es un componente de
 * UI reutilizable, es la cáscara de la página — mismo criterio que ya se
 * usaba para `App.tsx` antes de esta feature.
 */
export const EmptyState = styled.p`
  max-width: ${(props) => props.theme.layout.containerNarrow};
  margin: ${(props) => props.theme.spacing.xxl} auto;
  padding: 0 ${(props) => props.theme.spacing.lg};
  text-align: center;
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textSecondary};
`
