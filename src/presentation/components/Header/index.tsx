import { useState } from 'react'
import { useProfiles } from '../../context/ProfilesContext'
import ProfilesModal from '../ProfilesModal'
import HeaderActions from '../HeaderActions'
import { APP_VERSION } from '../../../shared/appVersion'
import { Bar, ProfileButton, RightGroup, Title, TitleGroup, VersionTag } from './styles'

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
      <TitleGroup>
        <Title>MyMudae</Title>
        <VersionTag>v{APP_VERSION}</VersionTag>
      </TitleGroup>
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
