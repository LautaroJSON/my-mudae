import { describe, expect, it } from 'vitest'
import { parseHaremMessage } from '../../../src/domain/parsing/parseHaremMessage'

// Mensaje real de ejemplo provisto en la sesión de /speckit-clarify de
// 001-multi-profile-harems (el "​" de la segunda línea es un espacio de
// ancho cero, tal como lo copia Discord).
const REAL_HAREM_MESSAGE = `rodoifin's harem
​
Total value: 23,899:kakera:

Amagami - 5/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png
#18,351 - Ai Nanasaki 46 ka - https://mudae.net/uploads/3176609/d7FP_dc~G8tEHIS.png
#45,204 - Hibiki Tsukahara 35 ka - https://mudae.net/uploads/1934407/R0kxEjr~jPclWFH.png
#51,520 - Rihoko Sakurai 35 ka - https://mudae.net/uploads/7154450/bpNEmZC~FErpw83.png
#57,674 - Miya Tachibana 34 ka - https://mudae.net/uploads/4201708/H5XFE7i~8IZtNA8.png
Imagen
Imagen
Imagen
Imagen
Imagen

Black Clover - 1/124
#182 - Noelle Silva 479 ka - https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png

Black★Rock Shooter - 1/11
#1,143 - Black★Rock Shooter 151 ka - https://mudae.net/uploads/2973343/OAvu1p3~4uttoVi.png

Chuunibyou demo Koi ga Shitai! - 3/23
#85 - Rikka Takanashi 631 ka - https://mudae.net/uploads/8353820/7RRUjX2~u1QCcKY.gif
#1,647 - Shinka Nibutani 122 ka - https://mudae.net/uploads/5031051/02QV8Il~jZ9SKqX.gif
#3,598 - Sanae Dekomori 93 ka - https://mudae.net/uploads/4434419/YGG_LXP~hzCmhUz.gif
Imagen
Imagen
Imagen
Imagen
Imagen
CLANNAD - 3/31
#1,085 - Nagisa Furukawa 165 ka - https://mudae.net/uploads/9790200/Ocsijdo~zsx6Dua.gif
#3,697 - Kyou Fujibayashi 87 ka - https://mudae.net/uploads/9684300/4SEVOpU~l7lxcjmqkp7.gif
#4,517 - Fuuko Ibuki 83 ka - https://mudae.net/uploads/2978588/VDyHQpv~Guq0Ev7.gif

Classroom of the Elite - 1/62
#981 - Kei Karuizawa 179 ka - https://mudae.net/uploads/1556929/lKm-2ot~7Be3TWX.png

Danganronpa 2: Goodbye Despair - 1/22
#66 - Chiaki Nanami 732 ka - https://mudae.net/uploads/5134454/_-zzTuM~bZQs17X.png
Imagen
Imagen
Imagen
Imagen
Imagen
Danganronpa: Trigger Happy Havoc - 1/26
#701 - Sayaka Maizono 184 ka - https://mudae.net/uploads/3559845/G9BZoCH~vg2YDxZ.png

Fairy Tail - 3/237
#50 - Erza Scarlet 830 ka - https://mudae.net/uploads/6039561/zqZXexD~1fMT6gh.png
#80 - Lucy Heartfilia 667 ka - https://mudae.net/uploads/5428784/FGfs0sG~j0Rb6Hh.png
#249 - Juvia Lockser 394 ka - https://mudae.net/uploads/5582005/ywxjF0_~DcbIpsr.png`

describe('parseHaremMessage', () => {
  it('parsea el nombre de perfil, las 9 series y todos los personajes del harem real de ejemplo', () => {
    const result = parseHaremMessage(REAL_HAREM_MESSAGE)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.profileName).toBe('rodoifin')
    expect(result.series.map((series) => series.name)).toEqual([
      'Amagami',
      'Black Clover',
      'Black★Rock Shooter',
      'Chuunibyou demo Koi ga Shitai!',
      'CLANNAD',
      'Classroom of the Elite',
      'Danganronpa 2: Goodbye Despair',
      'Danganronpa: Trigger Happy Havoc',
      'Fairy Tail',
    ])

    const totalCharacters = result.series.reduce((sum, series) => sum + series.characters.length, 0)
    expect(totalCharacters).toBe(19)
  })

  it('ignora las líneas de ruido (espacio invisible, "Total value:", "Imagen") sin generar series ni personajes', () => {
    const result = parseHaremMessage(REAL_HAREM_MESSAGE)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    // "Imagen" no matchea ni encabezado de serie ni línea de personaje.
    expect(result.series.some((series) => series.name === 'Imagen')).toBe(false)
    expect(
      result.series.flatMap((series) => series.characters).some((character) => character.name === 'Imagen'),
    ).toBe(false)
  })

  it('extrae nombre, imagen, kakera y claim rank de un personaje con ruido "Imagen" alrededor', () => {
    const result = parseHaremMessage(REAL_HAREM_MESSAGE)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const amagami = result.series.find((series) => series.name === 'Amagami')
    expect(amagami?.characters[0]).toEqual({
      claimRank: '#15,140',
      name: 'Haruka Morishima',
      kakera: 49,
      imageUrl: 'https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png',
    })
  })

  it('guarda el personaje con kakera indefinido cuando la línea no trae un valor de kakera reconocible', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva - https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0]).toEqual({
      claimRank: '#182',
      name: 'Noelle Silva',
      kakera: undefined,
      imageUrl: 'https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png',
    })
  })

  it('rechaza un texto sin ninguna línea de serie ni de personaje reconocible', () => {
    const result = parseHaremMessage('hola, esto no es un harem de Mudae')

    expect(result).toEqual({ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' })
  })

  it('no expone una serie que se queda sin personajes (dos encabezados de serie seguidos)', () => {
    const message = `alguien's harem

Serie Vacía - 0/5
Serie Con Personajes - 1/5
#1 - Alguien 10 ka - https://mudae.net/uploads/1/a.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series.map((series) => series.name)).toEqual(['Serie Con Personajes'])
  })

  it('normaliza una imagen personalizada de imgur.com a i.imgur.com (edge case: link "custom" que no carga)', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva 5 ka - https://imgur.com/z3hIPIX.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0].imageUrl).toBe('https://i.imgur.com/z3hIPIX.png')
  })

  it('normaliza también www.imgur.com a i.imgur.com', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva - https://www.imgur.com/z3hIPIX.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0].imageUrl).toBe('https://i.imgur.com/z3hIPIX.png')
  })

  it('no modifica una imagen que ya viene de i.imgur.com ni de mudae.net', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva 5 ka - https://i.imgur.com/z3hIPIX.png
#183 - Otro Personaje - https://mudae.net/uploads/1/a.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const [first, second] = result.series[0].characters
    expect(first.imageUrl).toBe('https://i.imgur.com/z3hIPIX.png')
    expect(second.imageUrl).toBe('https://mudae.net/uploads/1/a.png')
  })

  it('reconoce una línea de personaje cuya URL viene envuelta en "<...>" (Discord suprime el embed de imágenes personalizadas)', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva 5 ka - <https://imgur.com/z3hIPIX.png>`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0]).toEqual({
      claimRank: '#182',
      name: 'Noelle Silva',
      kakera: 5,
      imageUrl: 'https://i.imgur.com/z3hIPIX.png',
    })
  })

  it('reconoce una línea de personaje sin kakera cuya URL viene envuelta en "<...>"', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva - <https://mudae.net/uploads/1/a.png>`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0]).toEqual({
      claimRank: '#182',
      name: 'Noelle Silva',
      kakera: undefined,
      imageUrl: 'https://mudae.net/uploads/1/a.png',
    })
  })

  it('reconoce un kakera de 4+ dígitos con "." como separador de miles y lo guarda como número plano (edge case: kakera > 999)', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva 1.000 ka - https://mudae.net/uploads/1/a.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0]).toEqual({
      claimRank: '#182',
      name: 'Noelle Silva',
      kakera: 1000,
      imageUrl: 'https://mudae.net/uploads/1/a.png',
    })
  })

  it('reconoce un kakera de varios miles con "." como separador (ej. 12.345) sin romper el resto de la línea', () => {
    const message = `alguien's harem

Amagami - 1/11
#1.234 - Noelle Silva 12.345 ka - https://mudae.net/uploads/1/a.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0]).toEqual({
      claimRank: '#1.234',
      name: 'Noelle Silva',
      kakera: 12345,
      imageUrl: 'https://mudae.net/uploads/1/a.png',
    })
  })

  it('sigue reconociendo el separador de miles "," de siempre (kakera y claim rank) sin cambios', () => {
    const message = `alguien's harem

Amagami - 1/11
#15,140 - Haruka Morishima 1,000 ka - https://mudae.net/x.png`

    const result = parseHaremMessage(message)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters[0]).toEqual({
      claimRank: '#15,140',
      name: 'Haruka Morishima',
      kakera: 1000,
      imageUrl: 'https://mudae.net/x.png',
    })
  })
})
