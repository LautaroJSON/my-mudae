# Contrato: `parseHaremMessage`

**Módulo**: `domain/parsing/parseHaremMessage.ts`
**Tipo de contrato**: función pura de `domain/` (no hay API HTTP en esta app client-only).

## Firma

```ts
function parseHaremMessage(rawText: string): ParsedHaremMessage;
```

Ver `data-model.md` para el tipo `ParsedHaremMessage`.

## Precondiciones

- `rawText` es el string tal cual lo pega el usuario (puede incluir
  saltos de línea `\n` o `\r\n`, líneas en blanco, espacios invisibles).
- No se asume ninguna sanitización previa por parte del caller.

## Postcondiciones

- **Éxito** (`ok: true`): `rawText` contenía al menos una línea de
  encabezado de serie válida y al menos una línea de personaje válida
  (FR-007). El resultado incluye:
  - `profileName`: extraído de la primera línea que matchea
    `^(.+)'s harem$`. Si esa línea no está presente, se usa un nombre de
    perfil vacío/placeholder — este caso queda cubierto por FR-007 en la
    práctica, ya que un pegado real de Mudae siempre trae esa línea junto
    con series y personajes.
  - `series`: un `ParsedSeries[]` en el mismo orden en que aparecen en el
    texto, cada una con sus `characters` en el orden en que aparecen bajo
    ese encabezado de serie.
- **Falla** (`ok: false`): ninguna línea matcheó ni el patrón de serie ni
  el de personaje. `reason: 'NO_VALID_SERIES_OR_CHARACTER'`.

## Reglas de reconocimiento de línea (ver `research.md` para detalle regex)

| Tipo de línea | Ejemplo | Efecto |
|---|---|---|
| Encabezado de perfil | `rodoifin's harem` | Fija `profileName`. |
| Encabezado de serie | `Amagami - 5/11` | Abre una nueva `ParsedSeries` con `name: "Amagami"`; `5/11` se descarta. |
| Personaje | `#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/...png` | Agrega un `ParsedCharacter` a la `ParsedSeries` abierta actualmente. |
| Personaje sin kakera reconocible | `#182 - Noelle Silva - https://mudae.net/uploads/...png` | Agrega el personaje con `kakera: undefined` (FR-006). |
| Ruido | línea vacía, espacio invisible, `Total value: 23,899:kakera:`, `Imagen` | Se ignora, no produce efecto. |

## Casos borde cubiertos por el contrato

- Una línea de personaje que aparece antes de cualquier encabezado de
  serie (texto malformado) se descarta como ruido — no se crea un
  `Character` "huérfano" sin `Series`.
- Un encabezado de serie sin ningún personaje debajo antes del siguiente
  encabezado (o fin del texto) no aparece en `series` del resultado —
  consistente con la regla de que una `Series` nunca existe vacía
  (FR-022, `data-model.md`).

## Testing de este contrato

- Test principal: el ejemplo real de harem provisto en la sesión de
  `/speckit-clarify` (perfil `rodoifin`, series `Amagami`, `Black Clover`,
  `Black★Rock Shooter`, `Chuunibyou demo Koi ga Shitai!`, `CLANNAD`,
  `Classroom of the Elite`, `Danganronpa 2: Goodbye Despair`,
  `Danganronpa: Trigger Happy Havoc`, `Fairy Tail`), verificando cantidad
  de series, cantidad de personajes por serie, y los campos de al menos
  un personaje con y sin ruido `Imagen` alrededor.
- Test de rechazo: texto arbitrario sin ninguna línea reconocible →
  `{ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' }`.
- Test de kakera ausente: una línea de personaje sin el fragmento
  `<num> ka` → `kakera: undefined`, resto de los campos presentes.
