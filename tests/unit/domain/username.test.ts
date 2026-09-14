import { describe, expect, it } from 'vitest'
import { isSameUsername, normalizeUsername } from '../../../src/domain/profile/username'

describe('normalizeUsername', () => {
  it('pasa a minúsculas y recorta espacios de los bordes', () => {
    expect(normalizeUsername('  RodoIfin  ')).toBe('rodoifin')
  })

  it('elimina caracteres invisibles del copiado de Discord', () => {
    expect(normalizeUsername('rodo\u200Bifin')).toBe('rodoifin')
    expect(normalizeUsername('\uFEFFrodoifin\u200E')).toBe('rodoifin')
    expect(normalizeUsername('rodo\u00ADifin')).toBe('rodoifin')
  })

  it('colapsa cualquier tipo de espacio a un espacio simple', () => {
    expect(normalizeUsername('mi\u00A0perfil')).toBe('mi perfil')
    expect(normalizeUsername('mi   perfil')).toBe('mi perfil')
  })

  it('unifica formas Unicode descompuestas', () => {
    // "ñ" precompuesta (NFC) vs "n" + tilde combinante (NFD).
    expect(normalizeUsername('n\u0303ono')).toBe(normalizeUsername('ñono'))
  })

  it('no altera un nombre que ya está limpio más allá del casing', () => {
    expect(normalizeUsername('rodoifin')).toBe('rodoifin')
  })
})

describe('isSameUsername', () => {
  it('reconoce como iguales dos nombres que solo difieren en ruido de copiado', () => {
    expect(isSameUsername('RODOIFIN', 'rodo\u200Bifin ')).toBe(true)
  })

  it('sigue distinguiendo nombres realmente distintos', () => {
    expect(isSameUsername('rodoifin', 'rodolfin')).toBe(false)
  })
})
