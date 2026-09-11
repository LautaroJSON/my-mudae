import { describe, expect, it } from 'vitest'
import { buildProfileUrl, getProfileIdFromUrl } from '../../../src/presentation/urlParams'

describe('getProfileIdFromUrl', () => {
  it('extrae el id cuando está presente', () => {
    expect(getProfileIdFromUrl('?id=rodoifin')).toBe('rodoifin')
  })

  it('devuelve undefined cuando no hay query string', () => {
    expect(getProfileIdFromUrl('')).toBeUndefined()
  })

  it('devuelve undefined cuando hay otros parámetros pero no `id`', () => {
    expect(getProfileIdFromUrl('?foo=bar')).toBeUndefined()
  })

  it('decodifica ids con caracteres especiales', () => {
    expect(getProfileIdFromUrl('?id=rodo%20ifin')).toBe('rodo ifin')
  })
})

describe('buildProfileUrl', () => {
  it('arma una URL con `?id=<profileId>` codificado', () => {
    const url = buildProfileUrl('https://mymudae.app', '/', 'rodo ifin')
    expect(url).toBe('https://mymudae.app/?id=rodo+ifin')
    expect(getProfileIdFromUrl(new URL(url).search)).toBe('rodo ifin')
  })
})
