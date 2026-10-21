import { describe, expect, it } from 'vitest'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

// Escenario 4 de quickstart.md (Principio III): valida que un harem de
// 200+ personajes repartidos en muchas series se renderiza sin errores y
// en un tiempo acotado — jsdom no mide layout/paint real, así que esto
// NO reemplaza la validación manual de "se siente fluido" al arrastrar
// en un navegador real (no realizada en este entorno, ver quickstart.md
// Escenario 4 / tasks.md T026); es evidencia automatizada de que la
// estructura (un DndContext por serie, sin un árbol de sorteo
// compartido) escala a ese volumen sin romperse ni degradarse de forma
// catastrófica.
function buildLargeHarem(seriesCount: number, charactersPerSeries: number): Harem {
  return {
    profileId: 'profile-1',
    series: Array.from({ length: seriesCount }, (_, seriesIndex) => ({
      id: `series-${seriesIndex}`,
      name: `Serie ${seriesIndex}`,
      characters: Array.from({ length: charactersPerSeries }, (_, characterIndex) => ({
        id: `series-${seriesIndex}-char-${characterIndex}`,
        name: `Personaje ${seriesIndex}-${characterIndex}`,
        imageUrl: `https://x/${seriesIndex}-${characterIndex}.png`,
      })),
    })),
  }
}

describe('HaremView - escala con harems grandes (Principio III)', () => {
  it('renderiza un harem de 210 personajes en 30 series sin errores y en tiempo acotado', () => {
    const harem = buildLargeHarem(30, 7) // 210 personajes
    const profile: Profile = {
      id: harem.profileId,
      serverId: 'server-1',
      username: harem.profileId,
      alias: harem.profileId,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      harem,
    }
    const repository = new InMemoryProfileRepository([profile])

    const start = performance.now()
    const { getAllByRole } = renderWithTheme(
      <ProfilesProvider repository={repository}>
        <HaremSortProvider>
          <HaremSearchProvider>
            <HaremView harem={harem} />
          </HaremSearchProvider>
        </HaremSortProvider>
      </ProfilesProvider>,
    )
    const elapsedMs = performance.now() - start

    // 30 series + 210 personajes = 240 superficies de arrastre (role="button"),
    // más un botón "copiar nombre" (006) y uno "mover a…" (012) por cada
    // uno de los 210 personajes.
    expect(getAllByRole('button')).toHaveLength(240 + 210 + 210)
    // Presupuesto generoso (no es una medición de fluidez real, ver nota
    // arriba): detecta una regresión catastrófica (ej. O(n²)), no jank.
    expect(elapsedMs).toBeLessThan(5000)
    // Timeout del runner aparte del presupuesto de render: `getAllByRole`
    // sobre ~660 botones es lento en jsdom por sí solo y, en la corrida
    // completa en paralelo, hacía fallar el test por timeout aunque el
    // render entrara holgado en el presupuesto.
  }, 15000)
})
