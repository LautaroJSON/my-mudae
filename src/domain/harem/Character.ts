/**
 * Un personaje del harem. Pertenece exactamente a una Series (ver Series.ts).
 * `name` e `imageUrl` son obligatorios (FR-019); `kakera` y `claimRank` son
 * opcionales (FR-020, FR-021) porque no siempre vienen calculados/presentes
 * en el mensaje de harem que pega el usuario (FR-006).
 */
export interface Character {
  id: string
  name: string
  imageUrl: string
  kakera?: number
  claimRank?: string
}
