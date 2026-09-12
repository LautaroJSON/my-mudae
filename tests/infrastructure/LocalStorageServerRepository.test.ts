import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageServerRepository } from '../../src/infrastructure/storage/LocalStorageServerRepository'
import type { Server } from '../../src/domain/server/Server'

function buildServer(overrides: Partial<Server> = {}): Server {
  return { id: 'server-1', name: 'Mi server', profileIds: ['a', 'b'], ...overrides }
}

describe('LocalStorageServerRepository', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('getAll() devuelve [] cuando no hay nada persistido todavía', () => {
    const repository = new LocalStorageServerRepository()

    expect(repository.getAll()).toEqual([])
  })

  it('hace un round-trip fiel: getAll() después de save() devuelve datos equivalentes', () => {
    const repository = new LocalStorageServerRepository()
    const servers = [buildServer()]

    repository.save(servers)

    expect(repository.getAll()).toEqual(servers)
  })

  it('getAll() no lanza y devuelve [] si el contenido persistido está corrupto', () => {
    window.localStorage.setItem('mymudae:serverList', '{not valid json')
    const repository = new LocalStorageServerRepository()

    expect(() => repository.getAll()).not.toThrow()
    expect(repository.getAll()).toEqual([])
  })

  it('save() no lanza aunque localStorage.setItem falle (p. ej. cuota excedida)', () => {
    const repository = new LocalStorageServerRepository()
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => repository.save([buildServer()])).not.toThrow()

    setItemSpy.mockRestore()
  })
})
