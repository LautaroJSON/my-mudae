# Contrato: `copyTextToClipboard`

**Módulo**: `presentation/copyToClipboard.ts` — utilidad de efecto de
`presentation/` (usa `navigator`/`document`; por eso no vive en
`domain/`, que debe poder testearse sin ellos).

## Firma

```ts
async function copyTextToClipboard(text: string): Promise<boolean>
```

## Precondiciones

- `text` es el `string` ya generado por `formatHaremMessage` (o
  cualquier texto no vacío; la función no valida el contenido, solo
  intenta copiarlo).

## Postcondiciones

Implementa el fallback en 2 niveles programáticos que exige el
Principio VI de la constitución (el 3er nivel, selección manual, es
responsabilidad del caller — ver `share-harem-ui.md`):

1. Si `navigator.clipboard?.writeText` existe: se invoca y se espera su
   resultado.
   - Si resuelve sin error → la función devuelve `true`.
   - Si rechaza (permiso denegado, contexto no seguro, etc.) → continúa
     al paso 2, **no** propaga la excepción.
2. Si el paso 1 no está disponible o falló: se crea un `<textarea>`
   fuera de pantalla con `text` como valor, se agrega al DOM, se
   selecciona su contenido (`element.select()` /
   `element.setSelectionRange(0, text.length)` para mobile Safari), se
   invoca `document.execCommand('copy')`, y se remueve el `<textarea>`
   del DOM inmediatamente después (haya tenido éxito o no).
   - Si `execCommand('copy')` devuelve `true` → la función devuelve
     `true`.
   - Si devuelve `false`, lanza, o no existe (`document.execCommand` no
     definido) → la función devuelve `false`.
- **Nunca lanza**: cualquier excepción de cualquiera de los dos pasos se
  captura internamente; el contrato de la función es siempre resolver
  con `true`/`false`, nunca rechazar ni lanzar.
- **Sin efectos secundarios visibles** más allá del portapapeles y el
  `<textarea>` temporal (que no debe quedar visible ni un frame — se
  posiciona fuera del viewport, no con `display: none`, porque algunos
  navegadores no permiten `execCommand('copy')` sobre un elemento no
  renderizado).

## Casos borde cubiertos por el contrato

- Entorno sin `navigator.clipboard` en absoluto (navegador viejo,
  contexto no seguro `http://`) → salta directo al fallback de
  `execCommand`.
- `navigator.clipboard.writeText` existe pero el usuario deniega el
  permiso (rechaza la promesa) → fallback a `execCommand`, no se
  propaga el error al caller.
- `document.execCommand` tampoco existe o devuelve `false` (navegador
  moderno que ya lo deprecó y removió) → la función devuelve `false`
  limpiamente, dejando que el caller decida el siguiente paso (diálogo
  de copiado manual).
- Llamadas concurrentes (el usuario toca el icono varias veces seguido)
  → cada llamada es independiente; no hay estado compartido entre
  invocaciones que pueda corromperse.

## Testing de este contrato

- Mock de `navigator.clipboard.writeText` resolviendo → `true`, se llamó
  exactamente con `text`.
- Mock de `navigator.clipboard.writeText` rechazando + mock de
  `document.execCommand` devolviendo `true` → `true`, y se verifica que
  se intentó el fallback (no solo que el resultado final sea `true` por
  casualidad).
- Sin `navigator.clipboard` (eliminado del objeto global en el test) +
  `execCommand` devolviendo `true` → `true`.
- Ambos fallando/ausentes → `false`, sin lanzar ninguna excepción hacia
  el test.
