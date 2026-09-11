import type { Harem } from '../../../domain/harem/Harem'
import SeriesGroup from '../SeriesGroup'
import { Container, EmptyMessage } from './styles'

interface IHaremView {
  harem: Harem
}

/**
 * Renderiza el harem del perfil activo agrupado por serie. Cada
 * `SeriesGroup`/`CharacterCard` está memoizado por props (Principio III):
 * activar otro perfil o renombrar el perfil actual no debe volver a
 * renderizar cada tarjeta de personaje de un harem de 200+.
 */
const HaremView = ({ harem }: IHaremView) => {
  if (harem.series.length === 0) {
    return <EmptyMessage>Este perfil todavía no tiene personajes.</EmptyMessage>
  }

  return (
    <Container>
      {harem.series.map((series) => (
        <SeriesGroup key={series.id} series={series} />
      ))}
    </Container>
  )
}

export default HaremView
