import type { Profile } from '../../src/domain/profile/Profile'
import type { ProfileRepository } from '../../src/application/ports/ProfileRepository'

/**
 * Doble de ProfileRepository para tests de application/ y presentation/
 * sin tocar localStorage real. Ver contracts/profile-repository.md.
 */
export class InMemoryProfileRepository implements ProfileRepository {
  private profiles: Profile[]

  constructor(initialProfiles: Profile[] = []) {
    this.profiles = initialProfiles
  }

  getAll(): Profile[] {
    return this.profiles
  }

  save(profiles: Profile[]): void {
    this.profiles = profiles
  }
}
