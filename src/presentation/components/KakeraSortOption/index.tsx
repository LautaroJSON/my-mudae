import { ArrowUp, Check } from 'lucide-react'
import { useHaremSort } from '../../context/HaremSortContext'
import { ArrowButton, Row, Wrapper } from './styles'

/**
 * Fila "Valor de Kakera" del panel de ordenamiento: el interruptor
 * on/off (FR-006 de 010) y, junto a él, el control de dirección (FR-008/
 * FR-009 de 010) — solo visible/operable mientras el interruptor está
 * activo. Consume `useHaremSort()` directamente — no tiene estado
 * propio.
 */
const KakeraSortOption = () => {
  const { isActive, direction, toggleActive, toggleDirection } = useHaremSort()

  return (
    <Wrapper>
      <Row type="button" $isActive={isActive} aria-pressed={isActive} onClick={() => toggleActive()}>
        Valor de Kakera
        {isActive && <Check size={16} aria-hidden="true" />}
      </Row>
      {isActive && (
        <ArrowButton
          type="button"
          $direction={direction}
          aria-label={
            direction === 'desc' ? 'Orden descendente, cambiar a ascendente' : 'Orden ascendente, cambiar a descendente'
          }
          onClick={() => toggleDirection()}
        >
          <ArrowUp size={16} aria-hidden="true" />
        </ArrowButton>
      )}
    </Wrapper>
  )
}

export default KakeraSortOption
