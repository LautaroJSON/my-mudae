import { Row, Wrapper } from './styles'

/**
 * Fila "Rank" del panel de ordenamiento (FR-005 de 010): placeholder
 * visible para un criterio de ordenamiento futuro, sin ningún
 * comportamiento propio en esta feature — no consume `HaremSortContext`
 * ni ningún otro contexto, deliberadamente inerte.
 */
const RankSortOption = () => {
  return (
    <Wrapper>
      <Row type="button" disabled aria-disabled="true">
        Rank
      </Row>
    </Wrapper>
  )
}

export default RankSortOption
