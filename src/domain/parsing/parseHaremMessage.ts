/**
 * Parseo del mensaje privado que Mudae le manda al usuario con su harem.
 * Función pura de domain/: no depende de React, styled-components ni
 * localStorage (Restricciones Técnicas de la constitución). Ver
 * contracts/parse-harem-message.md y research.md para el detalle de las
 * reglas de reconocimiento de línea.
 */

export interface ParsedCharacter {
  claimRank?: string
  name: string
  kakera?: number
  imageUrl: string
}

export interface ParsedSeries {
  name: string
  characters: ParsedCharacter[]
}

export type ParsedHaremMessage =
  | { ok: true; profileName: string; series: ParsedSeries[] }
  | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' }

// "rodoifin's harem" → nombre de perfil.
const PROFILE_HEADER = /^(.+)'s harem$/

// "Amagami - 5/11" → nombre de serie (la fracción X/Y se descarta).
// Los números grandes de Mudae pueden venir con "," o "." como separador
// de miles según el idioma/config del bot (p. ej. "1.234" en vez de
// "1,234"); ambos se aceptan en todos los números de esta línea.
const SERIES_HEADER = /^(.+) - \d[\d.,]*\/\d[\d.,]*$/

// "#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/...png"
// La URL puede venir envuelta en "<...>" (p. ej. "<https://imgur.com/x.png>"):
// Discord/Mudae suprimen así la previsualización de embed para imágenes
// personalizadas (no-mudae.net) en harems largos. Los "<"/">" se excluyen
// de la captura para no terminar con una URL inválida con ese sobrante.
// El claim rank y el kakera aceptan "," o "." como separador de miles
// (p. ej. kakera "1.000" arriba de 999) — ver `parseKakeraValue`.
const CHARACTER_WITH_KAKERA =
  /^#([\d.,]+) - (.+?) (\d[\d.,]*) ka - <?(https?:\/\/[^\s<>]+)>?$/

// Variante sin kakera reconocible (FR-006), p. ej. cuando Mudae todavía no
// lo calculó: "#182 - Noelle Silva - https://mudae.net/uploads/...png"
const CHARACTER_WITHOUT_KAKERA = /^#([\d.,]+) - (.+?) - <?(https?:\/\/[^\s<>]+)>?$/

// El kakera de Mudae siempre es un entero (nunca fraccionario), así que
// tanto "," como "." que aparezcan en el número son separador de miles,
// nunca un punto decimal: "1.000"/"1,000" ka → 1000 (FR-006 original;
// edge case de kakera de 4+ dígitos con separador de miles).
function parseKakeraValue(raw: string): number {
  return Number(raw.replace(/[.,]/g, ''))
}

/**
 * Normaliza URLs de imagen personalizada que apuntan a la página HTML de
 * Imgur (`imgur.com`/`www.imgur.com`) en vez de a su CDN de imagen
 * directa (`i.imgur.com`) — la causa más común de que la imagen de un
 * personaje con link "custom" no cargue en un `<img>` (edge case
 * reportado principalmente con links de Imgur). No modifica ninguna
 * otra URL (mudae.net, Discord CDN, etc.).
 */
function normalizeImageUrl(rawUrl: string): string {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return rawUrl
  }

  if (parsed.hostname === 'imgur.com' || parsed.hostname === 'www.imgur.com') {
    parsed.hostname = 'i.imgur.com'
    return parsed.toString()
  }

  return rawUrl
}

export function parseHaremMessage(rawText: string): ParsedHaremMessage {
  const lines = rawText.split(/\r\n|\r|\n/)

  let profileName = ''
  const series: ParsedSeries[] = []
  let currentSeries: ParsedSeries | undefined
  let foundAnySeries = false
  let foundAnyCharacter = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) {
      continue // línea en blanco o de espacio invisible: ruido (FR-005)
    }

    const profileMatch = PROFILE_HEADER.exec(line)
    if (profileMatch && !profileName) {
      profileName = profileMatch[1].trim()
      continue
    }

    const seriesMatch = SERIES_HEADER.exec(line)
    if (seriesMatch) {
      currentSeries = { name: seriesMatch[1].trim(), characters: [] }
      series.push(currentSeries)
      foundAnySeries = true
      continue
    }

    const withKakera = CHARACTER_WITH_KAKERA.exec(line)
    const characterMatch = withKakera ?? CHARACTER_WITHOUT_KAKERA.exec(line)
    if (characterMatch && currentSeries) {
      const claimRank = characterMatch[1]
      const name = characterMatch[2].trim()
      const imageUrl = normalizeImageUrl(withKakera ? characterMatch[4] : characterMatch[3])
      const kakera = withKakera ? parseKakeraValue(characterMatch[3]) : undefined

      currentSeries.characters.push({
        claimRank: `#${claimRank}`,
        name,
        kakera,
        imageUrl,
      })
      foundAnyCharacter = true
      continue
    }

    // Cualquier otra línea ("Total value: ...", "Imagen", texto suelto, o
    // una línea de personaje sin ninguna serie abierta todavía) es ruido
    // del copiado desde Discord y se ignora (FR-005).
  }

  if (!foundAnySeries || !foundAnyCharacter) {
    return { ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' }
  }

  // Una serie sin ningún personaje (p. ej. dos encabezados de serie
  // seguidos) nunca debe exponerse (FR-022).
  const nonEmptySeries = series.filter((series) => series.characters.length > 0)

  return { ok: true, profileName, series: nonEmptySeries }
}
