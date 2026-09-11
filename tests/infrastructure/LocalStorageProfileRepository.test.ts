import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageProfileRepository } from '../../src/infrastructure/storage/LocalStorageProfileRepository'
import type { Profile } from '../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-09-11T00:00:00.000Z',
    order: 0,
    harem: {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            {
              id: 'character-1',
              name: 'Haruka Morishima',
              imageUrl: 'https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png',
              kakera: 49,
              claimRank: '#15,140',
            },
          ],
        },
      ],
    },
    ...overrides,
  }
}

describe('LocalStorageProfileRepository', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('getAll() devuelve [] cuando no hay nada persistido todavía', () => {
    const repository = new LocalStorageProfileRepository()

    expect(repository.getAll()).toEqual([])
  })

  it('hace un round-trip fiel: getAll() después de save() devuelve datos equivalentes', () => {
    const repository = new LocalStorageProfileRepository()
    const profiles = [buildProfile()]

    repository.save(profiles)

    expect(repository.getAll()).toEqual(profiles)
  })

  it('getAll() no lanza y devuelve [] si el contenido persistido está corrupto', () => {
    window.localStorage.setItem('mymudae:profiles', '{not valid json')
    const repository = new LocalStorageProfileRepository()

    expect(() => repository.getAll()).not.toThrow()
    expect(repository.getAll()).toEqual([])
  })

  it('save() no lanza aunque localStorage.setItem falle (p. ej. cuota excedida)', () => {
    const repository = new LocalStorageProfileRepository()
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => repository.save([buildProfile()])).not.toThrow()

    setItemSpy.mockRestore()
  })
})
