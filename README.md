# MyMudae

Aplicación web **100 % cliente** para organizar tu harem de [Mudae](https://mudae.net) (bot gacha de personajes de anime en Discord) fuera de Discord.

Pegás el mensaje que Mudae te manda con `$harem` y la app arma un perfil con tus series y personajes. Podés reordenar, buscar, ordenar por kakera, y generar los comandos `$sm` / `$divorce` listos para copiar y pegar de vuelta en Discord.

- Sin backend, sin login, sin base de datos remota. Todo vive en `localStorage`.
- Idioma de la UI, specs y comentarios del código: **español**.
- **App en producción**: https://mymudae.netlify.app/
- Versión actual: ver `version` en [package.json](package.json) (se muestra en la app vía `src/shared/appVersion.ts`).

## Funcionalidades

| Área | Qué hace |
|---|---|
| Importar | Parsea el mensaje de `$harem` pegado (series + personajes, claim rank, kakera, imagen). Tolera separadores de miles `,` `.` espacio / NBSP / NNBSP y URLs envueltas en `<...>`. |
| Perfiles y servidores | Varios perfiles agrupados por servidor (un mismo usuario puede tener un perfil por servidor). Alias editable, reordenable, enlace compartible por URL (`?id=<profileId>`) y enlace al perfil en mudae.net. |
| Actualizar harem | Re-pegar el harem sincroniza el perfil existente conservando el orden que el usuario armó (ver [Gotchas](#gotchas-importantes)). |
| Reordenar | Drag & drop (mouse **y** touch, `@dnd-kit`) de series y de personajes dentro/entre series; fusionar bloques de serie; largo ajustable de los bloques. |
| Buscar | Filtro tecla por tecla por nombre de personaje o título de serie. |
| Ordenar por kakera / rank | Opciones de orden sobre el harem. |
| Comando `$sm` | Serializa el orden visual a `$sm A$B$C...`, partido en varios mensajes según el límite de Discord (2000 / 4000 caracteres). |
| Divorciar | Marcar personajes en la tarjeta y generar `$divorce A$B$...` (también partido por límite). |
| Copiar | Copiar comando / nombre de personaje, con fallback manual (`ManualCopyDialog`) si el portapapeles falla, y toast de confirmación. |
| Tema | Claro / oscuro / sistema desde el menú de ajustes. |

## Stack

React 19 · TypeScript 6 · Vite 8 · styled-components 6 · `@dnd-kit` · `lucide-react` · Context API (sin Redux/Zustand) · Vitest + Testing Library + jsdom · Oxlint.

El stack es fijo; cambiarlo requiere enmendar la constitución (ver abajo).

## Comandos

Requiere Node.js y npm (hay `package-lock.json`).

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (Vite, HMR)
npm run build      # tsc -b && vite build  → dist/
npm run preview    # servir el build
npm run lint       # oxlint
npm test           # vitest run (una pasada)
npm run test:watch # vitest en modo watch
```

Antes de dar una tarea por terminada: `npm run lint && npm test && npm run build`.

## Deploy

Desplegado en **Netlify**: https://mymudae.netlify.app/. Es un sitio estático (SPA de Vite): comando de build `npm run build`, directorio de publicación `dist`. No hay `netlify.toml` en el repo; la configuración vive en el panel de Netlify. Como no hay backend ni variables de entorno, no hace falta configurar nada más.

Ojo: `localStorage` es por origen, así que los datos de producción y los de `npm run dev` (localhost) son independientes.

## Arquitectura

Monolito modular con enfoque DDD, en capas bajo `src/`:

```
src/
├── domain/           # Lógica pura. SIN React, styled-components ni localStorage.
│   ├── harem/        #   Character, Series, Harem, syncHarem (reconciliación al re-pegar)
│   ├── parsing/      #   parseHaremMessage, formatHaremMessage, formatSortCommand, formatDivorceCommand
│   ├── profile/      #   Profile + helpers puros, normalización de username
│   └── server/       #   Server (agrupa perfiles; orden = orden de profileIds)
├── application/      # Casos de uso (un archivo por acción) + puertos (interfaces de repositorio)
│   ├── ports/        #   ProfileRepository, ServerRepository
│   └── useCases/     #   reorderSeries, moveCharacterToBlock, deleteProfile, ...
├── infrastructure/   # Implementaciones de los puertos
│   └── storage/      #   LocalStorage*Repository (claves `mymudae:*`)
├── presentation/     # React: App, components/, context/ (Profiles, Search, Sort, Divorce), hooks, urlParams
└── shared/           # SOLO constantes/tokens puros: theme.ts, appVersion.ts
tests/                # Espejo de src/: unit/, component/, infrastructure/, support/ (renderWithTheme, repos en memoria)
specs/                # Una carpeta por feature (spec, plan, research, data-model, contracts, tasks)
```

Flujo de dependencias: `presentation → application → domain`; `infrastructure` implementa los puertos de `application`. `domain/` nunca importa de las otras capas.

Estado: `ProfilesContext` (y contexts de búsqueda/orden/divorcio) llaman a casos de uso, que operan sobre funciones puras de `domain/` y persisten vía el repositorio. Persistencia automática en cada cambio, sin botón "guardar".

## Reglas para quien modifique el código (humanos y agentes de IA)

Fuente normativa: [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.3.0). Resumen de lo que más se rompe:

### Principios del producto
1. **Persistencia local automática**: nunca perder el harem por refresh/cierre.
2. **Orden = Comando**: el comando `$sm` debe derivarse del mismo estado (`harem.series`) que renderiza la lista, nunca de una copia. Un desfase es un **bug crítico**.
3. **Rendimiento con 200+ personajes**: mover un ítem no debe re-renderizar toda la lista (hay un test en `HaremView.performance.test.tsx`). Cuidá memoización al tocar la lista ordenable.
4. **Client-only**: no agregar backend, auth ni DB remota sin justificarlo por escrito en una spec/plan.
5. **Responsive y touch-first**: todo debe funcionar en móvil, incluido el drag & drop táctil.
6. **Copiado confiable**: siempre feedback visible de éxito/fallo y fallback manual.
7. **Componentes pequeños de responsabilidad única.**

### Convención de componentes (obligatoria)
- Carpeta `src/presentation/components/<Nombre>/` con exactamente `index.tsx` (lógica + JSX) y `styles.tsx` (styled-components). Nada de `styled.*` en `index.tsx`.
- Sin `React.FC`. Props en `interface I<Nombre>` dentro del mismo `index.tsx`. Arrow function tipada por props. `export default <Nombre>` al final del archivo.

```tsx
// styles.tsx
export const Container = styled.div`...`

// index.tsx
import { Container } from './styles'

interface IPerfilCard { nombre: string; activo: boolean }

const PerfilCard = ({ nombre, activo }: IPerfilCard) => <Container>{nombre}</Container>

export default PerfilCard
```

### Estilos
- Solo tokens de [`DESIGN.md`](DESIGN.md) / [`src/shared/theme.ts`](src/shared/theme.ts) (color, tipografía, spacing, radios, sombras, motion). **Prohibido hardcodear** esos valores en `styles.tsx` u otros archivos de `presentation/`. Agregar un token = editar `DESIGN.md` + `theme.ts`.
- Respetar `prefers-reduced-motion`. Iconos: `lucide-react`.

### Tests
- Todo cambio en `domain/` y `application/` lleva test unitario en `tests/unit/...`; UI en `tests/component/presentation/` usando `tests/support/renderWithTheme.tsx`; repos en memoria en `tests/support/` para casos de uso.

## Gotchas importantes

- **El `#N` (claim rank) de Mudae NO es estable.** Es un ranking global que cambia entre pastes aunque tu harem no cambie. Nunca lo uses como clave para decidir si dos personajes son "el mismo" al re-pegar. `syncHarem` identifica personajes por **nombre** (cola FIFO por nombre para reclamos duplicados); `claimRank` es solo dato de visualización. Las URLs de imagen tampoco son estables (`$imgadd`).
- **`Profile.id` es un UUID interno**, no el username. El `username` (extraído de `"<user>'s harem"`) puede repetirse entre servidores y se compara siempre con `normalizeUsername`, nunca con `===`.
- **`$sm` sube a los personajes al principio del harem**, por eso `formatSortCommand` devuelve los comandos en *orden de envío*: primero el que lleva los últimos nombres, al final el de los primeros. No cambiar ese orden. Los nombres se separan con `$` sin espacios (cada carácter cuenta contra el límite de Discord) y nunca se corta un nombre.
- `$divorce`, en cambio, no depende del orden de envío.
- El parseo es defensivo: separadores de miles ambiguos (p. ej. `Agent 47 120 ka`) se resuelven según el formato del mensaje completo. Antes de tocar `parseHaremMessage.ts`, leé sus comentarios y los tests en `tests/unit/domain`.
- Los repositorios de `localStorage` jamás lanzan excepciones hacia `presentation/` (JSON corrupto / cuota → vuelven vacíos).

## Flujo de trabajo con Spec Kit

Las features se desarrollan con [Spec Kit](https://github.com/github/spec-kit) (skills `speckit-*` en `.claude/skills/`). Cada una deja su rastro en `specs/NNN-nombre/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `tasks.md`). Si vas a modificar una feature existente, leé primero su carpeta: las decisiones y el *por qué* están ahí (los comentarios del código referencian FR-xxx de esas specs).

| Spec | Feature |
|---|---|
| 001 | Múltiples perfiles de harem |
| 002 | Modal de perfiles en el header, actualizar harem, `?id=` en URL |
| 003 | Reordenar series y personajes (DnD) |
| 004 | Compartir harem al portapapeles |
| 005 | Actualizar harem pegando de nuevo |
| 006 | Copiar nombre de personaje |
| 007 | Menú de tema/ajustes |
| 008 | Perfiles por servidor |
| 009 | Comando `$sm` |
| 010 | Orden por kakera |
| 011 | Buscador |

Posteriores (sin carpeta de spec propia): `$divorce`, largo ajustable de bloques de serie, tooltips y link a mudae.net (ver `git log`).

Las convenciones de commits son `feat: ...` / `fix: ...` en español con la versión entre paréntesis (p. ej. `feat: divorciar personajes desde la tarjeta (v3.0.0)`); la versión se sube en `package.json`.

## Otros archivos

- [`DESIGN.md`](DESIGN.md): sistema visual (fuente única junto con `theme.ts`).
- `patch-notes/`: notas de versión en HTML/PNG.
- `.agents/skills/`, `.claude/skills/`: skills de diseño y Spec Kit para agentes; no forman parte de la app.
- `dist/`: salida de `npm run build`.
