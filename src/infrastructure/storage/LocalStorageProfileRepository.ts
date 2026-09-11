import type { Profile } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../../application/ports/ProfileRepository'
import { migrateLegacyProfiles } from '../../domain/profile/migrateLegacyProfiles'

const STORAGE_KEY = 'mymudae:profiles'

/**
 * Implementación de ProfileRepository sobre localStorage (Principio I y
 * Restricciones Técnicas de la constitución: persistencia 100%
 * client-side, sin backend). Ver contracts/profile-repository.md.
 *
 * `getAll()` aplica `migrateLegacyProfiles` de forma transparente sobre
 * lo leído (perfiles de la feature 001, sin `alias`/`order`) y, si eso
 * cambió algo, vuelve a guardar de inmediato — así la migración corre
 * una sola vez en la práctica (contracts/migrate-legacy-profiles.md).
 */
export class LocalStorageProfileRepository implements ProfileRepository {
  getAll(): Profile[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw)
      const profiles = Array.isArray(parsed) ? migrateLegacyProfiles(parsed) : []

      if (JSON.stringify(profiles) !== raw) {
        this.save(profiles)
      }

      return profiles
    } catch {
      // localStorage no disponible, cuota excedida, JSON corrupto, etc.
      // No debe romper la app ni perder silenciosamente el estado en
      // memoria; simplemente se reporta como si no hubiera nada
      // persistido todavía (Principio I: nunca una excepción no
      // controlada hacia presentation/).
      return []
    }
  }

  save(profiles: Profile[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    } catch {
      // Ver nota en getAll(): no se propaga la excepción. application/ es
      // quien decide, a futuro, cómo informarle al usuario que el último
      // cambio no se pudo persistir.
    }
  }
}
