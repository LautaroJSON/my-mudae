import type { Profile } from '../../domain/profile/Profile'

/**
 * Puerto de persistencia de application/. Es la única frontera por la que
 * application/ toca persistencia; infrastructure/ implementa esta
 * interfaz (ver contracts/profile-repository.md). Se modela como
 * "leer todo / guardar todo" porque el volumen de datos de esta feature
 * (perfiles de un solo usuario, en su propio navegador) no justifica un
 * CRUD granular por perfil (Principio IV, simplicidad).
 */
export interface ProfileRepository {
  /** Nunca lanza: devuelve `[]` si no hay nada persistido todavía. */
  getAll(): Profile[]
  /** Persiste de forma síncrona la colección completa (FR-023). */
  save(profiles: Profile[]): void
}
