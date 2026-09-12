# Research: Compartir Harem por Portapapeles

**Feature**: `004-share-harem-clipboard` | **Date**: 2026-09-11

El stack, la arquitectura DDD y el sistema de tokens (`theme.ts`/
`DESIGN.md`) ya están fijados por la constitución (v1.3.0) y por
`001`/`002`/`003`. Esta sección cubre únicamente las decisiones nuevas
de esta feature; no se reabre ninguna decisión previa.

## Decisión: qué formato de texto es "el mismo que se usa para dar de alta un perfil"

- **Decision**: es literalmente el formato de texto plano que ya
  reconoce `domain/parsing/parseHaremMessage.ts` (investigado en el
  código antes de escribir `spec.md`): una línea `"<nombre>'s harem"`,
  seguida de bloques de `"<serie> - X/Y"` con las líneas de personaje
  `"#<rank> - <nombre> <kakera> ka - <url>"` (o sin el segmento de
  kakera cuando no existe) debajo de cada serie. Esta feature agrega la
  función **inversa**, `formatHaremMessage(profile): string`, que
  produce ese mismo texto a partir de un `Profile` ya cargado, en vez de
  inventar un formato nuevo (JSON, CSV, etc.).
- **Rationale**: es exactamente lo que pidió el usuario ("el formato
  debe ser el mismo que se utiliza para dar de alta un perfil") y es lo
  único que garantiza que el flujo de recepción no requiera ningún
  código nuevo: el usuario que recibe el texto lo pega en el
  `PasteHaremScreen` ya existente y `createProfileFromPaste` lo procesa
  sin cambios (FR-005). Inventar un formato propio (JSON) exigiría un
  segundo flujo de "importar JSON" que hoy no existe y que el usuario no
  pidió.
- **Alternatives considered**: serializar el `Profile` completo como
  JSON y agregar un botón "importar JSON" — se descarta porque duplica
  el flujo de alta de perfil que ya existe y ya está probado
  (`createProfileFromPaste`/`syncHarem`), violando la simplicidad que
  pide el Principio IV sin ningún beneficio: el formato de texto de
  Mudae ya es portable por diseño (es literalmente lo que la gente ya
  se copia y pega hoy entre sí manualmente desde Discord).

## Decisión: de dónde sale cada campo del texto generado

- **Decision**:
  - Encabezado de perfil: usa `profile.alias` (no `profile.id`), porque
    es el nombre visible/editable que el usuario reconoce como "su"
    harem; `id` es un identificador interno inmutable que puede haber
    quedado desactualizado respecto del alias (ver `002/data-model.md`).
  - Encabezado de serie: `"<series.name> - <n>/<n>"`, con `n` =
    cantidad de personajes de esa serie. La fracción original de Mudae
    representa "reclamados/total en la serie", un dato que este dominio
    no trackea (`Series` no tiene un campo de total); como
    `parseHaremMessage` **descarta** esa fracción al parsear (ver
    `SERIES_HEADER` regex, `data-model.md` de `001`), cualquier fracción
    numéricamente válida es indistinguible para el receptor — se usa
    `n/n` por ser la opción más simple y no engañosa (no sugiere "faltan
    personajes por reclamar" cuando no es el caso).
  - Línea de personaje: reproduce `claimRank`, `name`, `kakera` e
    `imageUrl` tal cual están en el `Character`, en el formato con
    kakera (`CHARACTER_WITH_KAKERA`) cuando `kakera` está definido, o en
    el formato sin kakera (`CHARACTER_WITHOUT_KAKERA`) cuando no lo
    está — mismo criterio de presencia/ausencia que ya usa
    `parseHaremMessage` al leer.
  - `claimRank` faltante (el tipo `Character.claimRank` es opcional,
    aunque en la práctica el único flujo de creación de personajes hoy
    —pegado— siempre lo completa): se sintetiza como
    `#<posición 1-based dentro de la serie>` para que la línea generada
    siga siendo válida contra `CHARACTER_WITH_KAKERA`/
    `CHARACTER_WITHOUT_KAKERA` (ambas exigen el prefijo `#N -`). Es un
    valor defensivo, no una regla de negocio nueva: hoy este camino es
    inalcanzable con datos reales de la app.
- **Rationale**: reutilizar los mismos campos y el mismo criterio de
  presencia/ausencia que ya usa el parser existente es lo que garantiza
  el round-trip de FR-005/SC-003 sin tener que mantener dos
  definiciones de "cómo se ve un personaje en texto" (una para leer, otra
  para escribir) que puedan desincronizarse con el tiempo.
- **Alternatives considered**: usar `profile.id` en vez de `alias` en el
  encabezado — se descarta porque produciría un nombre de perfil
  compartido distinto al que el usuario ve en su propio header/lista de
  perfiles, generando confusión sobre "qué harem es este" del lado de
  quien lo recibe.

## Decisión: ubicación de `formatHaremMessage` (capa `domain/`)

- **Decision**: `domain/parsing/formatHaremMessage.ts`, función pura sin
  dependencias de React/`styled-components`/`localStorage`/`navigator`,
  simétrica a `parseHaremMessage.ts` (misma carpeta, mismo estilo de
  función pura testeable de forma aislada).
- **Rationale**: la Restricción Técnica de "Arquitectura" de la
  constitución exige que `domain/` pueda razonarse y testearse sin
  React/estilos/almacenamiento; la serialización a texto es lógica de
  dominio pura (transforma `Profile`/`Harem` en `string`), no un efecto
  de UI ni de infraestructura, así que vive en el mismo lugar que su
  inversa.
- **Alternatives considered**: ponerla en `presentation/` junto al
  componente que la usa — se descarta porque mezclaría lógica de
  formateo de dominio (testeable con fixtures puros, sin DOM) con
  código de UI, dificultando testear el round-trip
  `formatHaremMessage`/`parseHaremMessage` sin renderizar nada.

## Decisión: Principio II ("Orden = Comando") aplicado al texto compartido

- **Decision**: `formatHaremMessage` itera `profile.harem.series` y,
  dentro de cada serie, `series.characters`, **en el orden del array tal
  cual está persistido** (el mismo orden que ya renderiza `HaremView` vía
  `SeriesGroup`/`CharacterList` desde `003`) — nunca ordena por nombre,
  fecha ni ningún otro criterio, y nunca opera sobre una copia/snapshot
  independiente del `Profile` recibido como parámetro.
- **Rationale**: el Principio II clasifica cualquier desfase entre el
  orden visual y el orden de un output generado para copiar como bug
  crítico; aunque ese principio se escribió pensando en un comando de
  Mudae, el texto de esta feature es exactamente ese tipo de output
  (algo que el usuario ve en pantalla y luego copia), así que el mismo
  estándar aplica sin necesidad de reinterpretarlo.
- **Alternatives considered**: ninguna — no hay ningún criterio de orden
  alternativo que tenga sentido para este caso de uso; el array ya es la
  fuente de verdad del orden en todo el resto de la app.

## Decisión: confiabilidad del copiado al portapapeles (Principio VI) — 3 niveles de fallback

- **Decision**: `presentation/copyToClipboard.ts` expone
  `async function copyTextToClipboard(text: string): Promise<boolean>`
  que intenta, en orden:
  1. `navigator.clipboard.writeText(text)` (API moderna, requiere
     contexto seguro/permiso) — si resuelve, `true`.
  2. Si la API no existe o la promesa rechaza: fallback síncrono legacy
     con un `<textarea>` fuera de pantalla (`position: fixed`, fuera del
     viewport), `element.select()` + `document.execCommand('copy')` —
     si tiene éxito, `true`.
  3. Si ambos fallan (o `execCommand` no está soportado/deshabilitado):
     la función resuelve `false`, y es responsabilidad del caller
     (`ShareHaremButton`) mostrar `ManualCopyDialog` con el texto en un
     `<textarea readOnly>` preseleccionado (`autoFocus` + `select()` al
     montar) para que el usuario copie manualmente con `Ctrl+C` (desktop)
     o "Copiar" del menú de selección táctil (mobile) — el fallback de
     "selección de texto manual" que la constitución nombra
     explícitamente como aceptable.
- **Rationale**: es la única forma de cumplir la letra del Principio VI
  ("manejo explícito de los casos en que la API de portapapeles no esté
  disponible o falle... fallback aceptable, por ejemplo selección de
  texto manual") sin asumir que todos los navegadores/contextos
  (HTTP no seguro, iframes restringidos, Safari mobile viejo) soportan
  la Clipboard API moderna.
- **Alternatives considered**: depender solo de `navigator.clipboard.
  writeText` y mostrar un error genérico si falla — se descarta porque
  el Principio VI pide explícitamente un fallback funcional, no solo un
  mensaje de error; dejar al usuario sin ninguna forma de copiar el
  texto (aunque sea manualmente) no cumple la garantía que pide la
  constitución.

## Decisión: feedback de éxito/error — nuevo componente `Toast`, sin contexto global

- **Decision**: nuevo componente de responsabilidad única
  `presentation/components/Toast/` (variantes `success`/`error`),
  montado y controlado localmente por `ShareHaremButton` (estado
  `status: 'idle' | 'success' | 'error'` + `setTimeout` de
  auto-descarte, sin desmontar el botón). No se introduce un
  `ToastContext`/cola global de notificaciones.
- **Rationale**: hoy existe un único consumidor de feedback tipo toast
  (esta feature); generalizar a una cola global de notificaciones antes
  de que exista una segunda necesidad real sería anticipar requisitos
  hipotéticos. El token `theme.zIndex.toast` ya reservado en
  `shared/theme.ts` desde `002` (comentario: "Header fijo... `dropdown`
  ...`toast`") confirma que el sistema de diseño ya anticipaba este tipo
  de componente sin necesidad de agregar tokens nuevos.
- **Alternatives considered**: contexto global `ToastProvider` en
  `App.tsx` — se descarta por ahora (YAGNI); si una futura funcionalidad
  del mismo conjunto de iconos necesita el mismo tipo de feedback, ese
  momento es cuando conviene extraer un contexto compartido, no antes.

## Decisión: no se toca `ProfilesContext`/`application/`

- **Decision**: `ShareHaremButton` lee `activeProfile` directamente de
  `useProfiles()` (ya expuesto) y llama a la función pura
  `formatHaremMessage` + la utilidad `copyTextToClipboard`. No se agrega
  ningún método a `IProfilesContext`, ni un caso de uso nuevo en
  `application/useCases/`, ni cambios a `ProfileRepository`.
- **Rationale**: esta feature no persiste ni muta ningún `Profile`; es
  lectura + efecto de portapapeles. Los casos de uso de
  `application/useCases/` existen para operaciones que necesitan leer y
  volver a **guardar** el repositorio (crear, renombrar, reordenar,
  eliminar) — agregar uno acá introduciría una capa sin ningún beneficio
  (violaría la simplicidad implícita en el Principio VII: no concentrar
  ni dispersar responsabilidades sin necesidad).
- **Alternatives considered**: agregar `shareActiveProfile()` a
  `IProfilesContext` para "centralizar" la lógica — se descarta porque
  ese contexto es, por contrato (`contracts/profiles-context.md` de
  `001`), la superficie de mutación/lectura de la colección de perfiles;
  una operación de solo-lectura-más-efecto-de-navegador no necesita
  pasar por ahí cuando `activeProfile` ya está disponible directamente.

## Decisión: icono y ubicación en el header

- **Decision**: icono `Copy` de `lucide-react` (ya es la librería de
  iconos fija del proyecto), dentro de un botón redondo
  (`border-radius: theme.radii.pill`, mismo token "shape consistency
  lock" que ya usa `ProfileButton`). Vive dentro de un nuevo componente
  contenedor `HeaderActions` (la "lista horizontal de iconos redondos"
  que pidió el usuario), montado en `Header` inmediatamente a la
  izquierda del `ProfileButton` existente, ambos agrupados dentro de un
  mismo contenedor a la derecha del `Bar` (que mantiene su
  `justify-content: space-between` con el `Title` a la izquierda).
- **Rationale**: coincide con el pedido explícito del usuario (esquina
  superior derecha, iconos redondos, ícono "demostrativo" de copiar) y
  dimensiona el HeaderActions como un contenedor capaz de alojar más
  iconos en el futuro sin rediseñar el header de nuevo, sin construir
  hoy ninguna infraestructura extra para esos iconos futuros (que no son
  parte de esta spec).
- **Alternatives considered**: agregar el icono directamente dentro de
  `Header/index.tsx` sin un componente `HeaderActions` separado — se
  descarta porque el propio pedido del usuario describe una "lista" de
  iconos (plural, con más por venir), y el Principio VII pide
  componentes de responsabilidad única; separar la barra de acciones del
  layout general del header dejará más fácil agregar el segundo icono en
  una futura feature sin tocar `Header` de nuevo.

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el
Technical Context del plan.

## Addendum (post-implementación, pedido en una sesión posterior): feedback de "copiado" en el propio icono, sin `Toast`

Pedido del usuario: "se eliminan los mensajes toast como feedback al
usuario, ahora cuando se presione en un icono de copiar, el icono se
vuelve de color naranja y un check negro en su interior por unos
segundos." Aplica a los iconos que representan una acción de **copiar**
(`ShareHaremButton` acá, y `CopyNameButton` de `006`) — no a
`UpdateHaremButton` (`005`), que no copia nada al portapapeles y sigue
usando `Toast` sin cambios.

- **Decision**: `ShareHaremButton` deja de montar `<Toast>`. En su lugar,
  mantiene un estado local `feedback: 'idle' | 'success' | 'error'`; al
  copiar con éxito (o al confirmar `ManualCopyDialog`) pasa a `success`
  por `2500ms` (mismo valor que usaba `Toast` por defecto) y de vuelta a
  `idle`; mientras tanto, el propio `RoundIconButton` cambia su relleno a
  `theme.colors.accent` (naranja) y reemplaza el icono `Copy` por `Check`
  (`lucide-react`), con `theme.colors.onAccent` como color del icono. La
  falla de generación de texto (`formatHaremMessage` lanzando, camino
  prácticamente inalcanzable) usa el mismo mecanismo con `feedback:
  'error'` → relleno `theme.colors.danger` + icono `X`, en vez de
  desaparecer en silencio (Principio VI). El `aria-label` del botón
  también cambia mientras `feedback !== 'idle'` (p. ej. "Harem copiado")
  para no perder el equivalente accesible que daba `Toast` con
  `role="status"`.
- **Nuevo token**: `theme.colors.onAccent = '#1C1917'`. No hay ningún
  color "oscuro fijo" ya existente en la paleta que no cambie entre
  claro/oscuro (todos los demás tokens son variables CSS que sí cambian),
  y el pedido explícito era un check **negro** sobre el relleno naranja
  en cualquier tema — se reutiliza el mismo tono ya usado como el más
  oscuro de la paleta (`lightColors.textPrimary`/`darkColors.background`,
  ambos `#1C1917`) en vez de negro puro, respetando la regla ya
  documentada en `theme.ts` ("nunca negro puro").
- **Rationale**: cumple el pedido literal del usuario reutilizando el
  mismo mecanismo de estado que ya existía (antes controlaba qué
  `Toast` mostrar, ahora controla el relleno/icono del propio botón),
  sin agregar ningún componente nuevo ni cambiar el flujo de
  `copyToClipboard`/`ManualCopyDialog`.
- **Alternatives considered**: reutilizar `theme.colors.textPrimary`
  directamente en vez de un token nuevo — se descarta porque en modo
  oscuro `textPrimary` es casi blanco (`#FAFAF9`), lo opuesto de lo que
  pidió el usuario; witness de esto es que el pedido especifica
  "negro" sin condicionarlo al tema.
- **Impacto en artefactos ya escritos**: `contracts/share-harem-ui.md`
  queda desactualizado en su descripción de "muestra `Toast` de éxito" —
  ahora es "el propio icono muestra el feedback"; no se reescribe acá
  porque el comportamiento observable relevante (éxito/error
  distinguibles, fallback manual sin cambios) sigue vigente, solo cambió
  el mecanismo de presentación.
