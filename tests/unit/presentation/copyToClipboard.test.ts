import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from '../../../src/presentation/copyToClipboard'

const ORIGINAL_CLIPBOARD = navigator.clipboard
const ORIGINAL_EXEC_COMMAND = document.execCommand

function setClipboard(value: { writeText: (text: string) => Promise<void> } | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    value,
    configurable: true,
  })
}

afterEach(() => {
  setClipboard(ORIGINAL_CLIPBOARD)
  document.execCommand = ORIGINAL_EXEC_COMMAND
  vi.restoreAllMocks()
})

describe('copyTextToClipboard', () => {
  it('usa la Clipboard API cuando está disponible y resuelve', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })

    const result = await copyTextToClipboard('hola mundo')

    expect(result).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hola mundo')
  })

  it('cae al fallback execCommand cuando la Clipboard API rechaza', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('permiso denegado'))
    setClipboard({ writeText })
    document.execCommand = vi.fn().mockReturnValue(true)

    const result = await copyTextToClipboard('hola mundo')

    expect(result).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('usa execCommand directamente cuando no existe navigator.clipboard', async () => {
    setClipboard(undefined)
    document.execCommand = vi.fn().mockReturnValue(true)

    const result = await copyTextToClipboard('hola mundo')

    expect(result).toBe(true)
  })

  it('devuelve false sin lanzar cuando ningún mecanismo funciona', async () => {
    setClipboard(undefined)
    document.execCommand = vi.fn().mockReturnValue(false)

    const result = await copyTextToClipboard('hola mundo')

    expect(result).toBe(false)
  })

  it('devuelve false sin lanzar cuando execCommand no existe', async () => {
    setClipboard(undefined)
    // @ts-expect-error simula un navegador sin execCommand
    document.execCommand = undefined

    const result = await copyTextToClipboard('hola mundo')

    expect(result).toBe(false)
  })
})
