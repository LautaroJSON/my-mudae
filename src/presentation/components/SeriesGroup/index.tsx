import { memo } from 'react'
import type { Series } from '../../../domain/harem/Series'
import CharacterCard from '../CharacterCard'
import { CharacterList, SeriesName, Section } from './styles'

interface ISeriesGroup {
  series: Series
}

// Memoizado por props (Principio III): solo se re-renderiza si cambia la
// serie que le corresponde, no cuando cambia otra serie del harem.
const SeriesGroup = ({ series }: ISeriesGroup) => {
  return (
    <Section aria-label={series.name}>
      <SeriesName>{series.name}</SeriesName>
      <CharacterList>
        {series.characters.map((character, index) => (
          // Cascada de entrada acotada a 12 pasos (DESIGN.md § Motion): con
          // harems de 200+, un delay sin techo haría que las últimas
          // tarjetas tarden segundos en aparecer.
          <CharacterCard key={character.id} character={character} staggerIndex={Math.min(index, 12)} />
        ))}
      </CharacterList>
    </Section>
  )
}

export default memo(SeriesGroup)
