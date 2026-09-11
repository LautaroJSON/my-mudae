import { useState } from 'react'
import { useProfiles } from '../../context/ProfilesContext'
import ProfilesModal from '../ProfilesModal'
import HeaderActions from '../HeaderActions'
import { Bar, ProfileButton, RightGroup, Title } from './styles'

/**
 * Header fijo, siempre visible (FR-001). Muestra el alias del perfil
 * activo o una invitación a crear uno (FR-002); presionarlo abre
 * `ProfilesModal` (FR-003).
 */
const Header = () => {
  const { activeProfile } = useProfiles()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Bar>
      <Title>MyMudae</Title>
      <RightGroup>
        <HeaderActions />
        <ProfileButton type="button" aria-label="Abrir perfiles" onClick={() => setIsModalOpen(true)}>
          {activeProfile?.alias ?? 'Crear perfil'}
        </ProfileButton>
      </RightGroup>
      {isModalOpen && <ProfilesModal onClose={() => setIsModalOpen(false)} />}
    </Bar>
  )
}

export default Header
