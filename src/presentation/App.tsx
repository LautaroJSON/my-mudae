import { ThemeProvider } from 'styled-components'
import ProfilesProvider, { useProfiles } from './context/ProfilesContext'
import Header from './components/Header'
import HaremView from './components/HaremView'
import GlobalStyle from './GlobalStyle'
import { EmptyState } from './AppStyles'
import { theme } from '../shared/theme'

// Composición raíz: el header es siempre visible (FR-001); la lista de
// perfiles y la creación de perfiles viven exclusivamente dentro del
// modal que abre el header (FR-003, FR-004, FR-005) — la página
// principal solo muestra el harem del perfil activo, un estado vacío si
// no hay ninguno, o el estado de "perfil no encontrado" si esta pestaña
// cargó con un `?id=` que no corresponde a ningún perfil (User Story 5
// de 002): ese estado tiene prioridad por sobre mostrar el harem del
// perfil que haya quedado activo, para no sustituirlo en silencio.
const AppContent = () => {
  const { activeProfile, urlProfileStatus } = useProfiles()

  return (
    <>
      <Header />
      {urlProfileStatus === 'not-found' ? (
        <EmptyState role="alert">
          El perfil que buscás no existe — puede que el enlace esté desactualizado. Abrí el menú de arriba a la
          derecha para elegir otro.
        </EmptyState>
      ) : activeProfile ? (
        <HaremView key={activeProfile.id} harem={activeProfile.harem} />
      ) : (
        <EmptyState>
          Todavía no tenés ningún perfil. Abrí el menú de arriba a la derecha para crear uno pegando tu harem.
        </EmptyState>
      )}
    </>
  )
}

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ProfilesProvider>
        <AppContent />
      </ProfilesProvider>
    </ThemeProvider>
  )
}

export default App
