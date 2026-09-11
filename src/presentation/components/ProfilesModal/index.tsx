import { useState } from 'react'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useProfiles } from '../../context/ProfilesContext'
import Modal from '../Modal'
import ProfileList from '../ProfileList'
import PasteHaremScreen from '../PasteHaremScreen'
import { theme } from '../../../shared/theme'
import { BackButton, HeaderRow, NewProfileButton, Title, ViewContainer } from './styles'

interface IProfilesModal {
  onClose: () => void
}

/**
 * Modal de gestión de perfiles (FR-003, FR-004, FR-005): dos vistas —
 * "Perfiles" (lista) y "Agregar perfil" (zona de pegado) — nunca las dos
 * a la vez. Con al menos un perfil ya creado, "Nuevo perfil" lleva a la
 * vista de agregar, con una flecha para volver a la lista en vez de un
 * botón "Cancelar"; sin perfiles, se entra directo a "Agregar perfil"
 * sin flecha (no hay lista a la que volver).
 */
const ProfilesModal = ({ onClose }: IProfilesModal) => {
  const { profiles } = useProfiles()
  const [isAddingProfile, setIsAddingProfile] = useState(false)

  const showPasteZone = profiles.length === 0 || isAddingProfile
  const canGoBack = profiles.length > 0 && isAddingProfile
  const title = showPasteZone ? 'Agregar perfil' : 'Perfiles'

  return (
    <Modal onClose={onClose} ariaLabel={title} maxWidth={theme.layout.containerNarrow}>
      <HeaderRow>
        {canGoBack && (
          <BackButton
            type="button"
            aria-label="Volver a la lista de perfiles"
            onClick={() => setIsAddingProfile(false)}
          >
            <ArrowLeft size={18} />
          </BackButton>
        )}
        <Title>{title}</Title>
      </HeaderRow>
      <ViewContainer key={showPasteZone ? 'paste' : 'list'}>
        {showPasteZone ? (
          <PasteHaremScreen onCreated={onClose} />
        ) : (
          <>
            <ProfileList />
            <NewProfileButton type="button" onClick={() => setIsAddingProfile(true)}>
              <UserPlus size={16} />
              Nuevo perfil
            </NewProfileButton>
          </>
        )}
      </ViewContainer>
    </Modal>
  )
}

export default ProfilesModal
