import styled from 'styled-components'

// Máximo 6 perfiles visibles: (alto de ProfileCard ≈66px + gap sm 8px) × 6
// = 444px. Con más perfiles la lista scrollea en vez de empujar fuera de
// vista los botones del modal.
export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  margin: 0;
  padding: 0;
  width: 100%;
  max-height: 27.75rem;
  overflow-y: auto;
  overscroll-behavior: contain;
`

export const SortableItem = styled.li`
  list-style: none;
`

export const EmptyMessage = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.base};
  color: ${(props) => props.theme.colors.textSecondary};
`
