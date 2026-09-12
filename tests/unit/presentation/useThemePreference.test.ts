import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useThemePreference } from '../../../src/presentation/useThemePreference'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useThemePreference', () => {
  it('sin nada guardado, devuelve "default" y no fija ningún atributo data-theme', () => {
    const { result } = renderHook(() => useThemePreference())

    expect(result.current[0]).toBe('default')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('con un valor guardado válido ("legacy"), lo devuelve y fija el atributo data-theme correspondiente', () => {
    window.localStorage.setItem('mymudae:theme', 'legacy')

    const { result } = renderHook(() => useThemePreference())

    expect(result.current[0]).toBe('legacy')
    expect(document.documentElement.getAttribute('data-theme')).toBe('legacy')
  })

  it('con un valor guardado inválido/corrupto, cae a "default"', () => {
    window.localStorage.setItem('mymudae:theme', 'no-existe-este-tema')

    const { result } = renderHook(() => useThemePreference())

    expect(result.current[0]).toBe('default')
  })

  it('setTheme("claro") persiste en localStorage y fija el atributo data-theme', () => {
    const { result } = renderHook(() => useThemePreference())

    act(() => {
      result.current[1]('claro')
    })

    expect(result.current[0]).toBe('claro')
    expect(window.localStorage.getItem('mymudae:theme')).toBe('claro')
    expect(document.documentElement.getAttribute('data-theme')).toBe('claro')
  })

  it('setTheme("default") persiste "default" y remueve el atributo data-theme', () => {
    window.localStorage.setItem('mymudae:theme', 'legacy')
    document.documentElement.setAttribute('data-theme', 'legacy')
    const { result } = renderHook(() => useThemePreference())

    act(() => {
      result.current[1]('default')
    })

    expect(window.localStorage.getItem('mymudae:theme')).toBe('default')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('no lanza si localStorage.setItem falla, y sigue actualizando el estado en memoria', () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useThemePreference())

    expect(() => {
      act(() => {
        result.current[1]('legacy')
      })
    }).not.toThrow()
    expect(result.current[0]).toBe('legacy')

    setItemSpy.mockRestore()
  })

  it('no lanza si localStorage.getItem falla en la lectura inicial, y cae a "default"', () => {
    const getItemSpy = vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    const { result } = renderHook(() => useThemePreference())

    expect(result.current[0]).toBe('default')

    getItemSpy.mockRestore()
  })
})
