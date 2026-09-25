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

// Separadores de miles que usa Mudae según el idioma/config del bot:
// "1,234", "1.234" o "1 234". El espacio puede llegar como espacio común,
// no-break space (U+00A0) o narrow no-break space (U+202F, formato
// francés), según de dónde se haya copiado el mensaje.
const SPACE_SEPARATOR = '[ \\u00a0\\u202f]'
const ANY_SEPARATOR = `(?:[.,]|${SPACE_SEPARATOR})`
const PUNCTUATION_SEPARATOR = '[.,]'

// Número entero con separador de miles opcional: "155", "15140",
// "2,155", "2.155", "2 155". Los grupos después del primero siempre son
// de exactamente 3 dígitos (nunca "2 15" ni "47 12").
function numberPattern(separator: string): string {
  return `\\d+(?:${separator}\\d{3})*`
}

// "Amagami - 5/11" → nombre de serie (la fracción X/Y se descarta).
// Ambos números de la fracción aceptan cualquier separador de miles: el
// " - " que los precede y el fin de línea hacen que nunca sea ambiguo.
const SERIES_HEADER = new RegExp(
  `^(.+) - ${numberPattern(ANY_SEPARATOR)}\\/${numberPattern(ANY_SEPARATOR)}$`,
)

// "#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/...png"
// La URL puede venir envuelta en "<...>" (p. ej. "<https://imgur.com/x.png>"):
// Discord/Mudae suprimen así la previsualización de embed para imágenes
// personalizadas (no-mudae.net) en harems largos. Los "<"/">" se excluyen
// de la captura para no terminar con una URL inválida con ese sobrante.
// El claim rank acepta cualquier separador de miles ("#2 155" incluido):
// va pegado al "#" y seguido de " - ", así que nunca es ambiguo.
//
// El kakera, en cambio, va pegado al final del nombre: con el espacio
// como separador, "Agent 47 120 ka" podría leerse como kakera 47120. Por
// eso el espacio sólo se acepta en el kakera cuando el mensaje entero usa
// espacio como separador de miles (ver `usesSpaceThousandsSeparator`).
function characterWithKakeraPattern(kakeraSeparator: string): RegExp {
  return new RegExp(
    `^#(${numberPattern(ANY_SEPARATOR)}) - (.+?) (${numberPattern(kakeraSeparator)}) ka - <?(https?:\\/\\/[^\\s<>]+)>?$`,
  )
}

const CHARACTER_WITH_KAKERA = characterWithKakeraPattern(PUNCTUATION_SEPARATOR)
const CHARACTER_WITH_SPACED_KAKERA = characterWithKakeraPattern(ANY_SEPARATOR)

// Variante sin kakera reconocible (FR-006), p. ej. cuando Mudae todavía no
// lo calculó: "#182 - Noelle Silva - https://mudae.net/uploads/...png"
const CHARACTER_WITHOUT_KAKERA = new RegExp(
  `^#(${numberPattern(ANY_SEPARATOR)}) - (.+?) - <?(https?:\\/\\/[^\\s<>]+)>?$`,
)

// Un número con espacio como separador de miles en una posición que no
// admite otra lectura: el "Total value" o el claim rank de un personaje.
const SPACE_SEPARATED_NUMBER = new RegExp(
  `^(?:Total value: |#)\\d{1,3}${SPACE_SEPARATOR}\\d{3}(?!\\d)`,
)

function usesSpaceThousandsSeparator(lines: string[]): boolean {
  return lines.some((line) => SPACE_SEPARATED_NUMBER.test(line.trim()))
}

// El kakera de Mudae siempre es un entero (nunca fraccionario), así que
// cualquier separador que aparezca en el número ("," "." o espacio) es
// separador de miles, nunca un punto decimal: "1.000"/"1,000"/"1 000" ka
// → 1000 (FR-006 original; edge case de kakera de 4+ dígitos con
// separador de miles).
function parseKakeraValue(raw: string): number {
  return Number(raw.replace(/\D/g, ''))
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
  const characterWithKakera = usesSpaceThousandsSeparator(lines)
    ? CHARACTER_WITH_SPACED_KAKERA
    : CHARACTER_WITH_KAKERA

  let profileName = ''
  let isFirstContentLine = true
  const series: ParsedSeries[] = []
  let currentSeries: ParsedSeries | undefined
  let foundAnySeries = false
  let foundAnyCharacter = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) {
      continue // línea en blanco o de espacio invisible: ruido (FR-005)
    }

    if (isFirstContentLine) {
      isFirstContentLine = false
      const profileMatch = PROFILE_HEADER.exec(line)
      if (profileMatch) {
        profileName = profileMatch[1].trim()
        continue
      }

      // Mudae permite un nombre de harem personalizado (con emojis, sin
      // el formato habitual "<usuario>'s harem") — mientras la primera
      // línea con contenido no sea en sí misma un encabezado de serie o
      // una línea de personaje (paste malformado sin ningún encabezado
      // de perfil), se toma tal cual como profileName (edge case
      // reportado: "🌸 Patio de Pastra 🌸").
      const looksStructural =
        SERIES_HEADER.test(line) || characterWithKakera.test(line) || CHARACTER_WITHOUT_KAKERA.test(line)
      if (!looksStructural) {
        profileName = line
        continue
      }
    }

    const seriesMatch = SERIES_HEADER.exec(line)
    if (seriesMatch) {
      currentSeries = { name: seriesMatch[1].trim(), characters: [] }
      series.push(currentSeries)
      foundAnySeries = true
      continue
    }

    const withKakera = characterWithKakera.exec(line)
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
