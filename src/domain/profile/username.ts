/**
 * Normalización del nombre de usuario de Mudae para *comparar* (nunca para
 * guardar ni para mostrar: el nombre que se persiste y se renderiza es
 * siempre el texto original del pegado).
 *
 * Existe porque el texto que Discord pone en el portapapeles arrastra
 * variaciones invisibles que producían falsos "este harem no es tuyo":
 * caracteres de ancho cero (U+200B..U+200F, U+2060, BOM U+FEFF), guion
 * blando (U+00AD), espacios no estándar (NBSP y compañía) y formas
 * Unicode descompuestas (una "ñ" o una tilde pueden venir como letra +
 * diacrítico suelto). La comparación tampoco debe distinguir mayúsculas
 * de minúsculas: ni Mudae ni Discord garantizan el mismo casing entre un
 * pegado y otro.
 */

// Ancho cero, marcas de dirección, BOM y guion blando: puro ruido de copiado.
const INVISIBLE_CHARACTERS = /[\u00AD\u200B-\u200F\u2060\uFEFF]/g

// Cualquier espacio Unicode (NBSP, espacios tipográficos, tabulaciones...).
const ANY_WHITESPACE = /\s+/g

export function normalizeUsername(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(INVISIBLE_CHARACTERS, '')
    .replace(ANY_WHITESPACE, ' ')
    .trim()
    .toLocaleLowerCase()
}

/** Dos nombres de usuario son el mismo si lo son tras normalizar. */
export function isSameUsername(a: string, b: string): boolean {
  return normalizeUsername(a) === normalizeUsername(b)
}
