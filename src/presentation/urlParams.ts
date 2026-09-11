/**
 * Lectura/armado del parámetro `id` de la URL (User Story 5 de 002,
 * FR-013/FR-014/FR-017). Funciones puras sobre strings — quien las llama
 * les pasa `window.location.*`, para poder testearlas sin depender de un
 * DOM real. Ver contracts/url-profile-param.md.
 */

export function getProfileIdFromUrl(search: string): string | undefined {
  const params = new URLSearchParams(search)
  return params.get('id') ?? undefined
}

export function buildProfileUrl(origin: string, pathname: string, profileId: string): string {
  const params = new URLSearchParams()
  params.set('id', profileId)
  return `${origin}${pathname}?${params.toString()}`
}
