import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useProfiles } from '../../context/ProfilesContext'
import UpdateHaremModal from '../UpdateHaremModal'
import Toast from '../Toast'
import { RoundIconButton } from './styles'

const SUCCESS_MESSAGE = 'Harem actualizado.'

/**
 * Icono "Actualizar harem" (FR-001 de 005): abre `UpdateHaremModal` para
 * volver a pegar el mensaje de Mudae y sobrescribir el harem del perfil
 * activo. A diferencia de `ShareHaremButton` (004), está habilitado con
 * cualquier perfil activo sin importar si su harem tiene personajes
 * cargados (FR-009).
 */
const UpdateHaremButton = () => {
  const { activeProfile } = useProfiles()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const isDisabled = !activeProfile

  return (
    <>
      <RoundIconButton
        type="button"
        aria-label="Actualizar harem"
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={() => setIsModalOpen(true)}
      >
        <RefreshCw size={18} />
      </RoundIconButton>
      {isModalOpen && (
        <UpdateHaremModal
          onClose={() => setIsModalOpen(false)}
          onUpdated={() => {
            setIsModalOpen(false)
            setShowToast(true)
          }}
        />
      )}
      {showToast && <Toast variant="success" message={SUCCESS_MESSAGE} onDismiss={() => setShowToast(false)} />}
    </>
  )
}

export default UpdateHaremButton
