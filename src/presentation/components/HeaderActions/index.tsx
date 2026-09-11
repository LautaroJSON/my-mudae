import ShareHaremButton from '../ShareHaremButton'
import { ActionsRow } from './styles'

/**
 * Lista horizontal de iconos redondos de acciones rápidas en la esquina
 * superior derecha (FR-001 de 004). En esta iteración monta un único
 * icono ("Compartir harem"); queda preparada para sumar más en futuras
 * features del mismo conjunto sin volver a tocar `Header`.
 */
const HeaderActions = () => {
  return (
    <ActionsRow>
      <ShareHaremButton />
    </ActionsRow>
  )
}

export default HeaderActions
