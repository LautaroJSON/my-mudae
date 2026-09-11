/**
 * Copia texto al portapapeles con fallback en 2 niveles programáticos
 * (Principio VI de la constitución): Clipboard API moderna primero,
 * `execCommand('copy')` legacy si esa falla o no existe. Nunca lanza —
 * devuelve `false` cuando ninguno de los dos funcionó, dejando al caller
 * decidir el fallback de selección manual (ver
 * contracts/copy-to-clipboard.md y contracts/share-harem-ui.md).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // continúa al fallback legacy
    }
  }

  return copyWithExecCommand(text)
}

function copyWithExecCommand(text: string): boolean {
  if (typeof document.execCommand !== 'function') {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}
