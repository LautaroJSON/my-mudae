import Modal from '../Modal'
import { OptionButton, Options, Title } from './styles'

export interface IMoveTarget {
  /** `null` = bloque separado nuevo. */
  seriesId: string | null
  label: string
}

interface IMoveCharacterDialog {
  characterName: string
  targets: IMoveTarget[]
  onSelect: (targetSeriesId: string | null) => void
  onClose: () => void
}

/**
 * "Mover a…" (012): lista los otros bloques de la misma serie del
 * personaje, y "Bloque nuevo" cuando corresponde (lo decide
 * `SeriesGroup`). Nunca ofrece bloques de otra serie (FR-005 de 003).
 */
const MoveCharacterDialog = ({ characterName, targets, onSelect, onClose }: IMoveCharacterDialog) => {
  return (
    <Modal onClose={onClose} ariaLabel={`Mover ${characterName}`}>
      <Title>
        Mover <strong>{characterName}</strong> a…
      </Title>
      <Options>
        {targets.map((target) => (
          <OptionButton key={target.seriesId ?? 'new'} type="button" onClick={() => onSelect(target.seriesId)}>
            {target.label}
          </OptionButton>
        ))}
      </Options>
    </Modal>
  )
}

export default MoveCharacterDialog
