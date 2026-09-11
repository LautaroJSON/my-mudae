# Feature Specification: Header con Modal de Perfiles

**Feature Branch**: `002-header-profile-modal`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "vamos a crear un header que sea siempre visible en la pagina, este por el momento tendra un titulo \"MyMudae\". en la esquina superior derecha tendremos el nombre del perfil activo, el cual podremos precionar para abrir un modal, con la lista de perfiles y navegar entre ellos. la lista de perfiles ya no es visible en la pagina principal. si no hay un perfil. la creacion del perfil tambien pasa a este modal. la lista de perfiles se puede ordenar con drag a drops de arriba abajo. el perfil activo se muestra con un efecto focus en la lista. en la lista de perfiles, ademas de indicar el nombre, debajo de este indica la cantidad de personajes y el valor toatl de su harem. al lado de editar y eliminar perfil, se crea un boton para abrir el perfil en una nueva pestaña del navegador. para ello se pasa un parametro por url \"id\", el id de un perfil es igual al nombre que se cargo por primera vez, el nobre que se edita es un alias visual. si es necesario reestructurar la entidad para distinguir entre id \"nombre que llega por primera vez\" y alias, el alias la primera vez que se carga es igual al id."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar perfiles desde un header siempre visible (Priority: P1)

Como usuario, quiero tener un header fijo con acceso directo a mis
perfiles desde cualquier pantalla, para poder crear, ver y cambiar entre
perfiles sin que la lista ocupe espacio permanente en la pantalla
principal.

**Why this priority**: es el cambio estructural central de esta feature:
sin el header y el modal, no hay forma de crear el primer perfil ni de
navegar entre varios — reemplaza por completo el flujo anterior (pantalla
de pegado y lista inline en la página principal).

**Independent Test**: puede probarse abriendo la app sin perfiles,
verificando que el header está visible y que el control de la esquina
superior derecha invita a crear uno; al presionarlo se abre el modal con
la zona de pegado; tras pegar un harem válido, el modal muestra el perfil
recién creado en la lista y el header pasa a mostrar su alias. Con dos o
más perfiles ya creados, seleccionar uno distinto en la lista lo activa y
actualiza lo que se ve en la página principal.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la app, **When** el usuario hace
   scroll o navega, **Then** el header permanece visible en todo momento,
   mostrando el título "MyMudae".
2. **Given** que no existe ningún perfil, **When** el usuario mira la
   esquina superior derecha del header, **Then** ve una invitación a
   crear un perfil (no un nombre de perfil).
3. **Given** el control de perfil del header, **When** el usuario lo
   presiona, **Then** se abre un modal con la lista de perfiles
   existentes (vacía si no hay ninguno) y la posibilidad de pegar un
   harem para crear uno nuevo.
4. **Given** el modal abierto sin perfiles todavía, **When** el usuario
   pega un harem válido, **Then** se crea el perfil, queda activo, el
   header muestra su alias, y la página principal muestra su harem.
5. **Given** dos o más perfiles existentes, **When** el usuario abre el
   modal y selecciona uno distinto al activo, **Then** ese perfil pasa a
   activo, el header actualiza el alias mostrado, y la página principal
   muestra el harem del perfil recién seleccionado.
6. **Given** cualquier estado de perfiles, **When** el usuario mira la
   página principal (fuera del modal), **Then** no hay ninguna lista de
   perfiles visible ahí — solo el harem del perfil activo (o el estado
   vacío si no hay ninguno activo).

---

### User Story 2 - Reordenar perfiles con drag-and-drop (Priority: P2)

Como usuario con varios perfiles, quiero poder arrastrar cada fila de la
lista para reordenarla de arriba hacia abajo, para tener mis perfiles más
usados donde yo prefiera dentro del modal.

**Why this priority**: mejora la usabilidad de la lista una vez que ya
hay varios perfiles, pero no es indispensable para el valor central de
crear/ver/cambiar perfiles de la Historia 1.

**Independent Test**: con tres o más perfiles creados, arrastrar uno
desde el medio de la lista hacia el principio (o el final) y verificar
que el nuevo orden se mantiene al cerrar y reabrir el modal, y tras
refrescar la página.

**Acceptance Scenarios**:

1. **Given** tres o más perfiles en la lista, **When** el usuario
   arrastra uno a una posición distinta (con mouse o con touch), **Then**
   la lista se reordena en el momento y el nuevo orden persiste
   automáticamente.
2. **Given** un reordenamiento recién hecho, **When** el usuario refresca
   la página o vuelve a abrir el modal, **Then** el orden se mantiene tal
   como quedó.
3. **Given** cualquier reordenamiento, **When** se completa el arrastre,
   **Then** cuál perfil está activo no cambia (reordenar no activa ni
   desactiva ningún perfil).

---

### User Story 3 - Ver tamaño del harem de cada perfil en la lista (Priority: P2)

Como usuario con varios perfiles, quiero ver debajo del alias de cada
perfil cuántos personajes tiene y el valor total de su harem, para poder
identificar cada perfil sin tener que abrirlo.

**Why this priority**: es información adicional sobre una lista que ya
existe gracias a la Historia 1; útil pero no bloqueante para el resto de
las funcionalidades.

**Independent Test**: con perfiles de distinto tamaño de harem, abrir el
modal y verificar que cada fila muestra la cantidad de personajes y el
valor total correctos para ese perfil específico.

**Acceptance Scenarios**:

1. **Given** un perfil con personajes cargados, **When** se muestra su
   fila en la lista, **Then** debajo del alias se ve la cantidad de
   personajes de su harem y el valor total (suma de kakeras) de ese
   harem.
2. **Given** un perfil sin ningún personaje con kakera asignado, **When**
   se muestra su fila, **Then** el valor total se ve como 0 (no se rompe
   ni se omite el dato).

---

### User Story 4 - Actualizar un perfil existente re-pegando su harem (Priority: P2)

Como usuario que ya cargó un perfil antes, quiero poder volver a pegar el
harem de esa misma cuenta más adelante (después de reclamar o perder
personajes en Mudae) y que la app actualice ese mismo perfil en vez de
crear uno duplicado, para mantener mi harem al día sin acumular perfiles
repetidos.

**Why this priority**: depende de que el `id` de un perfil sea estable
(Historia 1 + Requisitos), pero es independiente de la lista/drag-and-drop;
resuelve un caso de uso real y recurrente (los harems cambian con el
tiempo), por eso tiene la misma prioridad que ver el tamaño del harem.

**Independent Test**: crear un perfil pegando un harem de ejemplo,
después pegar (desde "nuevo perfil" en el modal) una segunda versión del
mismo harem con el mismo nombre pero con algunos personajes distintos
(uno nuevo, uno menos, uno repetido con otro valor de kakera), y verificar
que sigue existiendo un solo perfil con ese nombre, cuyo harem refleja
exactamente los cambios.

**Acceptance Scenarios**:

1. **Given** un perfil ya creado a partir de un harem pegado, **When** el
   usuario pega, desde "nuevo perfil", un harem cuyo nombre coincide con
   el `id` de ese perfil, **Then** no se crea un perfil nuevo: el
   existente se actualiza y pasa a ser el activo.
2. **Given** esa sincronización, **When** un personaje del nuevo pegado
   tiene el mismo claim rank que uno ya presente en el harem, **Then**
   se actualiza ese personaje (no aparece duplicado).
3. **Given** esa sincronización, **When** el nuevo pegado incluye un
   claim rank que no estaba antes, **Then** ese personaje se agrega al
   harem.
4. **Given** esa sincronización, **When** un personaje del harem anterior
   no aparece con su claim rank en el nuevo pegado, **Then** ese
   personaje se elimina del harem (y su serie, si queda vacía).

---

### User Story 5 - Abrir un perfil en una pestaña nueva (Priority: P3)

Como usuario con varios perfiles, quiero poder abrir un perfil específico
en una pestaña nueva del navegador desde la lista, para poder comparar
harems de distintos perfiles en pestañas separadas.

**Why this priority**: es una comodidad adicional sobre perfiles que ya
se pueden crear/ver/cambiar; depende de las Historias 1 y de que el
modelo de datos distinga id de alias (ver Requisitos).

**Independent Test**: con al menos un perfil creado, presionar el botón
"abrir en pestaña nueva" de su fila y verificar que se abre una pestaña
nueva mostrando ese mismo perfil (no necesariamente el que estaba activo
en la pestaña original).

**Acceptance Scenarios**:

1. **Given** una fila de perfil en la lista, **When** el usuario presiona
   su botón de "abrir en pestaña nueva", **Then** se abre una pestaña
   nueva del navegador con una URL que identifica a ese perfil.
2. **Given** una pestaña abierta desde ese botón, **When** carga,
   **Then** muestra el harem del perfil identificado en la URL.

---

### User Story 6 - Renombrar (alias) y eliminar un perfil desde el modal (Priority: P3)

Como usuario, quiero poder editarle el alias a un perfil y eliminarlo
desde la misma lista del modal, para mantener mis perfiles organizados
sin salir de ahí.

**Why this priority**: es funcionalidad que ya existía antes de esta
feature (fuera del modal); acá solo se reubica dentro del modal, por eso
tiene menor prioridad que las historias nuevas.

**Independent Test**: dentro del modal, editar el alias de un perfil y
verificar que se conserva; eliminar un perfil y verificar que desaparece
de la lista junto con su harem.

**Acceptance Scenarios**:

1. **Given** una fila de perfil en el modal, **When** el usuario edita su
   alias, **Then** el nuevo alias se muestra ahí y en el header si era el
   perfil activo — el identificador interno del perfil (ver Requisitos)
   no cambia.
2. **Given** una fila de perfil en el modal, **When** el usuario la
   elimina (con la confirmación existente), **Then** el perfil y su
   harem desaparecen de la lista y de cualquier pestaña que lo tuviera
   activo.

---

### Edge Cases

- ¿Qué pasa si el usuario abre el modal y no hay ningún perfil? Se
  muestra la lista vacía junto con la zona de pegado para crear el
  primero (ver Historia 1, escenario 4).
- ¿Qué pasa si se accede a la app con un `id` en la URL que no
  corresponde a ningún perfil existente (por ejemplo, un enlace a un
  perfil ya eliminado)? Esa pestaña debe mostrar un estado claro de
  "perfil no encontrado", no romperse ni sustituirlo silenciosamente por
  otro perfil.
- ¿Qué pasa si se accede a la app sin ningún parámetro `id` en la URL?
  Se comporta como hoy: se muestra el perfil activo compartido.
- ¿Qué pasa si se intenta dejar el alias vacío al editarlo? No se guarda
  un alias vacío (misma validación que ya existía para el renombrado).
- ¿Qué pasa si se elimina el perfil que una pestaña abierta por `id`
  está mostrando? Esa pestaña debe reflejar que el perfil ya no existe la
  próxima vez que necesite leer su estado, igual que el caso de "perfil
  no encontrado".
- ¿Qué pasa si el harem que se vuelve a pegar (mismo nombre que un
  perfil existente) no comparte ningún claim rank con el harem actual?
  Se eliminan todos los personajes anteriores y se agregan todos los
  nuevos — el harem termina siendo exactamente el del pegado más
  reciente, tal como indica la regla de sincronización (FR-015b).
- ¿Qué pasa si el harem que se vuelve a pegar es idéntico al actual
  (mismos claim ranks, mismos datos)? La sincronización no produce
  cambios visibles; el perfil pasa a activo igual.
- ¿Qué pasa si la migración de perfiles ya existentes (FR-015) hiciera
  coincidir el `id` de dos perfiles que hoy tienen el mismo nombre
  (permitido antes de esta feature)? Al segundo se le agrega un sufijo
  numérico al migrar, para que ambos conserven un `id` único.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un header fijo en la parte superior
  de toda la app, siempre visible sin importar el scroll o la pantalla,
  con el título "MyMudae".
- **FR-002**: El header DEBE mostrar en su esquina superior derecha el
  alias del perfil activo cuando exista uno, o una invitación a crear un
  perfil cuando no exista ninguno.
- **FR-003**: Presionar el control de perfil del header DEBE abrir un
  modal que contiene la lista de perfiles existentes y la vía para crear
  un perfil nuevo pegando un harem.
- **FR-004**: La lista de perfiles NO DEBE mostrarse en ningún lugar de
  la página principal fuera de este modal.
- **FR-005**: La creación de un perfil (pegar un harem) DEBE ocurrir
  exclusivamente dentro de este modal, incluyendo la creación del primer
  perfil cuando no existe ninguno todavía.
- **FR-006**: Seleccionar un perfil distinto en la lista del modal DEBE
  activarlo (desactivando el anterior) y DEBE actualizar el harem que se
  muestra en la página principal.
- **FR-007**: La fila del perfil activo en la lista DEBE distinguirse
  visualmente (efecto de foco/resaltado) del resto de las filas.
- **FR-008**: La lista de perfiles DEBE poder reordenarse arrastrando
  cada fila de arriba hacia abajo, funcionando tanto con mouse como con
  gestos táctiles.
- **FR-009**: El orden establecido por arrastre DEBE persistir
  automáticamente y reflejarse la próxima vez que se muestre la lista,
  incluso después de refrescar la página.
- **FR-010**: Reordenar la lista NO DEBE cambiar cuál perfil está activo.
- **FR-011**: Cada fila de la lista DEBE mostrar, debajo del alias, la
  cantidad de personajes del harem de ese perfil y el valor total
  (suma de kakeras) de ese harem.
- **FR-012**: Cada fila DEBE ofrecer, además de las acciones existentes
  de editar alias y eliminar, una acción para abrir ese perfil en una
  pestaña nueva del navegador.
- **FR-013**: Abrir un perfil en una pestaña nueva DEBE navegar a una URL
  que incluya un parámetro `id` identificando a ese perfil.
- **FR-014**: Al cargar la app, si la URL incluye el parámetro `id`, el
  sistema DEBE mostrar el harem del perfil identificado por ese valor en
  esa pestaña.
- **FR-015**: El identificador (`id`) de un perfil DEBE fijarse, en el
  momento de la creación, a partir del nombre extraído por primera vez
  del harem pegado, y DEBE permanecer invariable durante toda la vida del
  perfil (nunca cambia, ni siquiera si se edita el alias). Los perfiles
  que ya existan al momento de introducir esta regla DEBEN migrarse una
  única vez para que su `id` pase a ser su nombre/alias actual en ese
  momento (si esa migración generara dos perfiles con el mismo `id`, al
  segundo se le agrega un sufijo numérico para mantener la unicidad).
- **FR-015a**: Al pegar un harem, si el nombre extraído coincide
  exactamente con el `id` de un perfil ya existente, el sistema NO DEBE
  crear un perfil nuevo — en cambio DEBE actualizar (sincronizar) el
  harem de ese perfil existente con los datos recién pegados, y ese
  perfil DEBE pasar a ser el activo. Si el nombre extraído no coincide
  con ningún `id` existente, se crea un perfil nuevo como hasta ahora
  (FR-005).
- **FR-015b**: Al sincronizar el harem de un perfil existente (FR-015a),
  el sistema DEBE reconciliar sus personajes contra los recién pegados,
  usando el claim rank (`#N`) de cada personaje como identificador de
  "es el mismo personaje reclamado":
  - un personaje cuyo claim rank ya existe en el harem actual DEBE
    actualizarse con los datos recién pegados (nombre, imagen, kakera)
    sin duplicarse;
  - un personaje pegado cuyo claim rank no existe todavía en el harem
    actual DEBE agregarse como nuevo;
  - un personaje que estaba en el harem actual pero cuyo claim rank ya
    no aparece en el texto recién pegado DEBE eliminarse (junto con su
    serie, si esa serie queda sin personajes — FR-022 de la feature
    anterior sigue aplicando).
- **FR-016**: El alias de un perfil DEBE ser un campo editable
  independiente del `id`; al crearse el perfil, el alias inicial DEBE
  ser igual al `id`, y a partir de ahí puede editarse libremente sin
  afectar al `id`.
- **FR-017**: Al cargar la app, el sistema DEBE leer el parámetro `id` de
  la URL. Si está presente y corresponde a un perfil existente, ESE
  perfil DEBE pasar a ser el perfil activo (sobrescribiendo cuál lo era
  antes), con el mismo efecto que activarlo manualmente desde el modal
  (FR-006). Si no está presente, se usa el perfil activo tal como ya
  estaba (comportamiento actual, sin cambios).
- **FR-018**: Distintas pestañas DEBEN poder mostrar perfiles distintos
  entre sí de forma simultánea (por ejemplo, una pestaña abierta con
  `?id=A` y la pestaña original mostrando el perfil `B`), incluso cuando
  el perfil activo es, a nivel de datos, un único valor compartido: cada
  pestaña ya abierta conserva en pantalla el perfil que tenía al momento
  de cargar/activar el suyo, y no se actualiza en vivo solo porque otra
  pestaña haya activado uno distinto — recién lo reflejaría si esa
  pestaña se refresca (momento en el que, sin su propio `id` en la URL,
  mostraría el que haya quedado activo globalmente).

## Key Entities

- **Perfil**: además de sus atributos existentes (harem, estado
  activo/inactivo), se reestructura en dos campos de nombre separados:
  `id` (fijado al crear —o al migrar, para perfiles ya existentes—, a
  partir del nombre extraído del harem pegado, inmutable de ahí en más,
  único entre todos los perfiles) y `alias` (editable, igual al `id` al
  crear). Suma un campo de orden manual explícito para reflejar el
  resultado del arrastre-y-soltar, independiente del orden de creación.
- **Harem** (existente): de él se derivan, para cada perfil, la cantidad
  de personajes y el valor total (suma de kakeras) que se muestran en la
  lista — no son datos nuevos que se persistan aparte, se calculan a
  partir de los personajes ya guardados.
- **Personaje** (existente): su claim rank pasa a tener un rol adicional
  como identificador de "es el mismo personaje reclamado" durante la
  sincronización de un perfil (FR-015b) — ya siempre está presente en un
  personaje creado a partir de un pegado válido (es parte del patrón que
  reconoce a un personaje al parsearlo), por lo que la sincronización
  puede confiar en él sin un caso especial de "sin claim rank".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde cualquier pantalla, un usuario puede abrir el modal
  de perfiles y cambiar de perfil activo en menos de 3 segundos, sin
  perder de vista en qué pantalla estaba.
- **SC-002**: En cualquier momento, el alias del perfil activo es
  identificable con solo mirar el header, sin necesidad de abrir el
  modal.
- **SC-003**: El 100% de los reordenamientos por arrastre persisten tras
  refrescar la página.
- **SC-004**: Un usuario puede conocer la cantidad de personajes y el
  valor total de cualquier perfil sin abrirlo, solo mirando la lista.
- **SC-005**: Una pestaña abierta mediante "abrir en pestaña nueva"
  muestra el perfil correcto en menos de 3 segundos desde que carga.
- **SC-006**: El 100% de los perfiles conservan un `id` único e
  invariable durante toda su vida — nunca hay dos perfiles con el mismo
  `id` al mismo tiempo, ni siquiera después de migrar perfiles previos a
  esta feature.
- **SC-007**: Al volver a pegar el harem de una cuenta ya cargada, el
  100% de las veces el resultado es un único perfil actualizado (nunca
  un perfil duplicado), con exactamente los personajes del pegado más
  reciente — ni de más ni de menos.

## Assumptions

- La cantidad de personajes y el valor total del harem que se muestran
  en la lista son datos calculados en el momento a partir de los
  personajes ya guardados del perfil (nunca se confía en la línea
  "Total value" del mensaje pegado, que ya se descarta como ruido desde
  la feature anterior).
- El título "MyMudae" del header es fijo por ahora; no hay otros
  controles adicionales en el header fuera del control de perfil en
  esta feature.
- El "efecto de foco" de la fila activa es una definición visual, no
  prescribe un estilo exacto a nivel de especificación.
- Los perfiles nuevos se agregan al final del orden manual existente al
  crearse.
- La validación de "no guardar un alias vacío" es la misma que ya regía
  para el renombrado antes de esta feature.
- Esta feature reemplaza la suposición de la feature anterior de que
  "volver a pegar un harem siempre crea un perfil nuevo": de acá en más,
  pegar un harem cuyo nombre coincide con un `id` existente sincroniza
  ese perfil en vez de duplicarlo (FR-015a/FR-015b).
- La coincidencia de nombre para decidir si se sincroniza un perfil
  existente o se crea uno nuevo es una comparación exacta (sensible a
  mayúsculas/minúsculas), igual que cualquier otra comparación de texto
  en la app hasta ahora.
- La migración de perfiles ya existentes (para que su `id` pase a ser su
  nombre/alias actual) ocurre una sola vez, la primera vez que la app
  carga con esta feature ya instalada.
