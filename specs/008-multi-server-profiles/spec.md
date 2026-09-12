# Feature Specification: Servidores Múltiples por Usuario (Reestructura de Perfiles)

**Feature Branch**: `008-multi-server-profiles`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Cambiaron las reglas de negocio: ahora un mismo usuario puede tener varios harems, uno por cada servidor de Discord distinto (antes, un usuario tenía una única lista/harem; ahora 'usuario X' puede tener una lista en el servidor Y, y otra lista distinta (o incluso idéntica) en el servidor Z — son harems independientes entre sí). Ahora existe una lista de servidores, y dentro de cada servidor una lista de perfiles. Se reestructura el alta de perfiles: el usuario hace click en 'agregar perfil'/'crear perfil' y pega el harem como ya existe hoy. Si el formato del texto pegado es válido, en vez de crear el perfil directamente se abre un nuevo modal que pregunta el nombre del servidor de Discord al que pertenece ese harem. Ese modal tiene: un input de texto para escribir el nombre de un servidor nuevo (máximo 50 caracteres); debajo, si ya hay servidores cargados previamente, se muestra esa lista con un radio button cada uno (máximo un servidor por perfil); si se selecciona un servidor existente, el input de texto se bloquea/opaca y su valor se ignora al dar de alta. En la lista de perfiles, el nivel superior pasa a ser el nombre del servidor, desplegable tipo acordeón para ver sus perfiles. Tanto los perfiles dentro de un servidor como los servidores entre sí se pueden reordenar por drag-and-drop." Aclaraciones posteriores del usuario: no hay perfiles/servidores previos que migrar (la app no tiene usuarios reales todavía); un servidor sin perfiles queda guardado (no se borra solo), no aparece en la lista de perfiles pero sí como opción elegible (con radio button) en el pedido de servidor del alta, desde donde también se puede eliminar — eliminar un servidor con perfiles cargados exige confirmar en un modal de advertencia que lista esos perfiles (hasta 300px de alto, con scroll si no entran, ocupando todo el ancho disponible del modal).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Indicar el servidor al dar de alta un perfil (Priority: P1)

Como usuario, al pegar el harem de un nuevo perfil quiero indicar a qué
servidor de Discord pertenece (escribiendo el nombre de uno nuevo, o
eligiendo uno que ya cargué antes), para poder tener harems
independientes del mismo o de distintos usuarios en servidores
distintos, en vez de una única lista global como antes.

**Why this priority**: es el cambio de regla de negocio central de esta
funcionalidad; sin esto no existe ninguna asociación entre perfil y
servidor, y el resto de la funcionalidad (gestionar, agrupar, reordenar
servidores) no tiene sobre qué operar.

**Independent Test**: pegar un harem con formato válido, verificar que
aparece un pedido de servidor antes de completar el alta, escribir un
nombre de servidor nuevo y confirmar que el perfil queda creado y
asociado a ese servidor; repetir pegando otro harem y esta vez eligiendo
el servidor recién creado de una lista, verificando que ambos perfiles
quedan bajo el mismo servidor.

**Acceptance Scenarios**:

1. **Given** el usuario pega un texto de harem con formato válido
   durante el alta de un perfil, **When** el pegado se reconoce
   correctamente, **Then** se le pide el servidor de Discord al que
   pertenece ese harem antes de completar el alta (no se crea el
   perfil todavía).
2. **Given** el pedido de servidor visible, **When** el usuario escribe
   el nombre de un servidor nuevo (hasta 50 caracteres) y confirma sin
   elegir ningún servidor existente, **Then** se crea el perfil asociado
   a ese servidor nuevo.
3. **Given** que ya existen uno o más servidores cargados de perfiles
   anteriores, **When** el usuario ve el pedido de servidor, **Then**
   ve esos servidores existentes listados, cada uno con una opción para
   elegirlo, pudiendo elegir como máximo uno.
4. **Given** el usuario elige uno de los servidores existentes, **When**
   mira el campo de texto de nombre nuevo, **Then** ese campo aparece
   deshabilitado/opaco, y lo que hubiera quedado escrito ahí NO se usa
   al completar el alta — el perfil queda asociado al servidor elegido.
5. **Given** el mismo nombre de usuario ya tiene un harem cargado en el
   servidor A, **When** el usuario da de alta un harem con ese mismo
   nombre de usuario pero indicando el servidor B, **Then** se crea un
   perfil nuevo e independiente en el servidor B, sin modificar ni
   reemplazar el harem que ese usuario ya tenía en el servidor A.
6. **Given** el pedido de servidor visible, **When** el usuario no
   escribe ningún nombre nuevo ni elige ninguno existente, **Then** no
   puede completar el alta del perfil.

---

### User Story 2 - Eliminar un servidor no deseado desde el pedido de servidor (Priority: P2)

Como usuario, quiero poder eliminar un servidor que cargué por error o
que ya no uso, desde la misma pantalla donde elijo el servidor al dar
de alta un perfil, para mantener esa lista de servidores limpia sin
tener que crear ni borrar un perfil solo para poder deshacerme de un
servidor mal cargado.

**Why this priority**: depende de que ya existan servidores guardados
(User Story 1) para tener algo que eliminar, y es la forma principal de
corregir un servidor creado por error (por ejemplo, un nombre mal
escrito) antes de seguir usando la app.

**Independent Test**: con un servidor guardado sin ningún perfil, abrir
el pedido de servidor durante el alta de un perfil, eliminarlo desde ahí
y verificar que desaparece de la lista de servidores elegibles sin
pedir ninguna confirmación; repetir con un servidor que sí tiene
perfiles cargados y verificar que aparece una advertencia con la
cantidad y la lista de esos perfiles antes de poder confirmar, y que
confirmar elimina tanto el servidor como sus perfiles.

**Acceptance Scenarios**:

1. **Given** un servidor guardado sin ningún perfil cargado, **When**
   el usuario lo elimina desde el pedido de servidor del alta, **Then**
   se elimina de inmediato sin pedir ninguna confirmación adicional, y
   deja de aparecer como opción elegible.
2. **Given** un servidor guardado con uno o más perfiles cargados,
   **When** el usuario intenta eliminarlo desde el pedido de servidor
   del alta, **Then** aparece una advertencia indicando la cantidad de
   perfiles que tiene cargados ese servidor, junto con la lista de esos
   nombres de perfil, antes de poder confirmar la eliminación.
3. **Given** esa advertencia visible, **When** la lista de nombres de
   perfil no entra completa en el espacio disponible, **Then** esa
   lista se puede scrollear verticalmente en vez de desbordar la
   advertencia, ocupando todo el ancho disponible del modal y hasta 300
   píxeles de alto.
4. **Given** esa advertencia visible, **When** el usuario confirma la
   eliminación, **Then** se elimina el servidor junto con todos los
   perfiles (harems) que tenía cargados.
5. **Given** esa advertencia visible, **When** el usuario la cancela,
   **Then** el servidor y sus perfiles quedan exactamente como estaban,
   sin ningún cambio.

---

### User Story 3 - Ver los perfiles agrupados por servidor (Priority: P2)

Como usuario con perfiles en más de un servidor, quiero verlos
agrupados por servidor en la lista de perfiles (desplegando cada
servidor tipo acordeón), para encontrar rápido el perfil que busco sin
tener que revisar una lista plana de todos mis perfiles mezclados.

**Why this priority**: depende de que ya existan perfiles con servidor
asociado (User Story 1), y es lo que le da valor visible a la
reestructura — sin esto, el usuario no puede aprovechar la separación
por servidor en su día a día.

**Independent Test**: con perfiles ya creados en dos servidores
distintos, abrir la lista de perfiles y verificar que aparecen agrupados
por nombre de servidor como nivel superior, y que desplegar/colapsar un
servidor muestra u oculta únicamente los perfiles de ese servidor.

**Acceptance Scenarios**:

1. **Given** perfiles creados en dos o más servidores, **When** el
   usuario abre la lista de perfiles, **Then** ve los nombres de los
   servidores como nivel superior, no una lista plana de perfiles.
2. **Given** un servidor colapsado en la lista, **When** el usuario lo
   despliega, **Then** ve únicamente los perfiles que pertenecen a ese
   servidor.
3. **Given** dos servidores desplegados a la vez, **When** el usuario
   revisa ambos, **Then** cada uno sigue mostrando solo sus propios
   perfiles, sin mezclarse.
4. **Given** un servidor guardado sin ningún perfil cargado, **When**
   el usuario abre la lista de perfiles, **Then** ese servidor NO
   aparece ahí (no tiene nada que mostrar), aunque sigue existiendo y
   sigue apareciendo como opción elegible en el pedido de servidor del
   alta.

---

### User Story 4 - Reordenar servidores y perfiles dentro de cada servidor (Priority: P3)

Como usuario, quiero poder arrastrar para reordenar tanto mis
servidores entre sí como mis perfiles dentro de cada servidor, para
organizar la lista según mi propia prioridad (por ejemplo, el servidor
que uso más seguido primero).

**Why this priority**: es una mejora de organización sobre la lista ya
agrupada (User Story 3); la app es utilizable sin esto (con el orden en
que se fueron creando), así que se prioriza después de que la
agrupación en sí funcione.

**Independent Test**: con 2+ servidores y 2+ perfiles dentro de uno de
ellos, arrastrar un servidor a otra posición y verificar que el nuevo
orden persiste tras recargar; arrastrar un perfil dentro de su servidor
a otra posición y verificar que también persiste, sin afectar el orden
de perfiles de ningún otro servidor.

**Acceptance Scenarios**:

1. **Given** 2 o más servidores en la lista, **When** el usuario
   arrastra uno a otra posición, **Then** el nuevo orden de servidores
   se refleja de inmediato y se mantiene tras recargar la aplicación.
2. **Given** un servidor con 2 o más perfiles, **When** el usuario
   arrastra uno de esos perfiles a otra posición dentro del mismo
   servidor, **Then** el nuevo orden se refleja de inmediato y persiste,
   sin alterar el orden de perfiles de otro servidor.

---

### Edge Cases

- ¿Qué pasa si el usuario escribe, como nombre de servidor nuevo, un
  texto que coincide exactamente con el nombre de un servidor ya
  existente, en vez de elegirlo de la lista? Se crea un servidor
  distinto (aunque tenga el mismo nombre visible) — la única forma de
  asociar el perfil a un servidor ya existente es eligiéndolo
  explícitamente de la lista, nunca por coincidencia de texto.
- ¿Qué pasa si se elimina el único perfil que tenía un servidor (sin
  pasar por el flujo explícito de eliminar servidor)? Ese servidor deja
  de listarse en la lista de perfiles, pero permanece guardado y sigue
  disponible como opción elegible (y eliminable) en el pedido de
  servidor del alta — mismo criterio de la User Story 2.
- ¿Qué pasa si se intenta eliminar un servidor que no tiene ningún
  perfil cargado? Se elimina directamente, sin pedir confirmación
  adicional (no hay ningún harem en juego).
- ¿Qué pasa si se intenta actualizar (re-pegar) el harem de un perfil, y
  el texto pegado tiene el mismo nombre de usuario pero en realidad
  pertenece a otro servidor? Se trata como una discordancia (misma
  advertencia que ya existe hoy para nombres de usuario distintos): no
  se sobrescribe el harem del perfil que se está actualizando.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al pegar durante el alta de un perfil un texto de harem
  con formato reconocible, el sistema DEBE pedir el servidor de Discord
  al que pertenece ese harem antes de completar el alta, en vez de
  crear el perfil de inmediato.
- **FR-002**: El sistema DEBE permitir escribir el nombre de un servidor
  nuevo, con un máximo de 50 caracteres.
- **FR-003**: Si ya existen servidores cargados de antes, el sistema
  DEBE mostrarlos listados en ese mismo pedido, permitiendo elegir como
  máximo uno mediante una selección excluyente entre sí.
- **FR-004**: Al elegir un servidor existente, el sistema DEBE
  deshabilitar visualmente el campo de nombre de servidor nuevo, y DEBE
  ignorar cualquier valor que tuviera escrito al completar el alta —
  el perfil queda asociado al servidor elegido, no al texto del campo.
- **FR-005**: El sistema NO DEBE permitir completar el alta de un perfil
  sin que se haya indicado un servidor (nuevo o existente).
- **FR-006**: El sistema DEBE asociar el perfil recién dado de alta al
  servidor indicado (nuevo o existente).
- **FR-007**: El sistema DEBE permitir que el mismo nombre de usuario
  tenga un perfil (harem) independiente en cada servidor distinto —
  dos perfiles con igual nombre de usuario pero en servidores distintos
  DEBEN tratarse como entidades separadas, cada una con su propio
  harem, sin interferir entre sí.
- **FR-008**: Al actualizar (re-pegar) el harem de un perfil ya
  existente, el sistema DEBE seguir considerando tanto el nombre de
  usuario como el servidor del perfil que se está actualizando para
  decidir si el texto pegado corresponde a ese mismo perfil; un pegado
  con el mismo nombre de usuario pero de un servidor distinto DEBE
  tratarse como una discordancia (mismo comportamiento de advertencia ya
  existente), nunca como el mismo perfil.
- **FR-009**: En la lista de perfiles, el sistema DEBE agrupar los
  perfiles por servidor, mostrando el nombre de cada servidor como
  nivel superior de esa lista.
- **FR-010**: El sistema DEBE permitir desplegar y colapsar los
  perfiles de cada servidor de forma independiente (tipo acordeón).
- **FR-011**: El sistema DEBE seguir permitiendo reordenar por arrastre
  los perfiles dentro de un mismo servidor, igual que ya permite hoy
  dentro de la lista plana.
- **FR-012**: El sistema DEBE permitir reordenar los servidores entre sí
  por arrastre.
- **FR-013**: El sistema DEBE recordar automáticamente, entre visitas,
  tanto el orden de los servidores como el orden de los perfiles dentro
  de cada servidor, sin requerir ninguna acción explícita de "guardar".
- **FR-014**: Un servidor sin ningún perfil cargado DEBE permanecer
  guardado (no se elimina automáticamente); NO DEBE aparecer en la
  lista de perfiles, pero SÍ DEBE seguir apareciendo como opción
  elegible en el pedido de servidor al dar de alta un perfil nuevo.
- **FR-015**: El sistema DEBE permitir eliminar un servidor desde ese
  mismo pedido de servidor del alta.
- **FR-016**: Si el servidor a eliminar no tiene ningún perfil cargado,
  el sistema DEBE eliminarlo directamente, sin pedir ninguna
  confirmación adicional.
- **FR-017**: Si el servidor a eliminar tiene uno o más perfiles
  cargados, el sistema DEBE mostrar una advertencia que indique la
  cantidad de perfiles afectados junto con la lista de sus nombres, y
  DEBE requerir una confirmación explícita antes de eliminarlo.
- **FR-018**: Esa lista de nombres de perfil DEBE mostrarse con scroll
  vertical cuando no entra completa, ocupando todo el ancho disponible
  del cuadro de advertencia y hasta 300 píxeles de alto.
- **FR-019**: Al confirmar la eliminación de un servidor con perfiles,
  el sistema DEBE eliminar tanto el servidor como todos los perfiles
  (harems) que tenía asociados.
- **FR-020**: Al cancelar esa advertencia, el sistema NO DEBE modificar
  ni el servidor ni ninguno de sus perfiles.

### Key Entities *(include if feature involves data)*

- **Servidor**: agrupador nuevo de nivel superior. Tiene un nombre
  (hasta 50 caracteres) y una posición de orden entre los demás
  servidores. Contiene una colección ordenada de perfiles, que puede
  estar vacía: un servidor sin perfiles sigue existiendo (persistido,
  elegible y eliminable desde el pedido de servidor del alta), solo
  deja de aparecer en la lista de perfiles. Eliminar un servidor
  elimina también todos los perfiles que tuviera asociados.
- **Perfil (existente, modificado)**: cada perfil ahora pertenece
  exactamente a un servidor. Dos perfiles pueden tener el mismo nombre
  de usuario si pertenecen a servidores distintos, y se tratan como
  harems completamente independientes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede dar de alta un perfil indicando su
  servidor (nuevo o ya existente) en un único paso adicional sobre el
  flujo de alta ya existente hoy.
- **SC-002**: Un mismo nombre de usuario puede tener harems
  completamente independientes en dos servidores distintos —
  actualizar uno nunca modifica el otro — verificado el 100% de las
  veces.
- **SC-003**: Un usuario puede ubicar cualquiera de sus perfiles
  navegando primero por el nombre del servidor al que pertenece, sin
  necesitar revisar una lista plana completa.
- **SC-004**: El orden elegido de servidores y de perfiles dentro de
  cada servidor se mantiene igual después de recargar la aplicación, el
  100% de las veces.
- **SC-005**: Un usuario puede eliminar un servidor no deseado (con o
  sin perfiles) sin necesitar borrar sus perfiles uno por uno a mano
  primero.
- **SC-006**: Antes de eliminar un servidor con perfiles cargados, el
  usuario ve con claridad cuántos y cuáles perfiles se van a eliminar
  junto con él, evitando borrados accidentales el 100% de las veces.

## Assumptions

- No existen perfiles ni servidores previos que migrar: la aplicación
  todavía no tiene usuarios reales, así que esta funcionalidad no
  necesita ninguna estrategia de migración de datos existentes (a
  diferencia de reestructuras anteriores de este proyecto).
- El nombre de usuario ya no alcanza por sí solo para identificar un
  perfil de forma única: la identidad de un perfil pasa a ser la
  combinación de su nombre de usuario y su servidor. Esto también
  actualiza el criterio que ya usa la funcionalidad existente de
  "actualizar harem" (re-pegado): la coincidencia se evalúa contra el
  servidor del perfil activo, no solo contra el nombre de usuario.
- Escribir un nombre de servidor nuevo que coincide con uno ya existente
  crea un servidor distinto (posiblemente con nombre repetido); no hay
  fusión automática por coincidencia de texto — solo elegir
  explícitamente de la lista reutiliza un servidor existente.
- La gestión de servidores (elegir y eliminar) vive enteramente dentro
  del pedido de servidor que aparece al dar de alta un perfil — no se
  agrega, en esta iteración, una pantalla aparte de "administrar
  servidores" independiente de ese flujo.
- El concepto de "perfil activo" (el que se muestra en la pantalla
  principal del harem) sigue siendo uno solo para toda la aplicación,
  sin importar a qué servidor pertenezca — los servidores son una forma
  de organizar la lista de perfiles, no de tener múltiples pantallas de
  harem activas a la vez.
- Se pueden tener más de un servidor desplegado (expandido) a la vez en
  la lista de perfiles — desplegar uno no colapsa automáticamente los
  demás.
- La persistencia de servidores y perfiles sigue siendo enteramente
  local al dispositivo/navegador del usuario, mismo criterio
  "client-only" que ya usa el resto de la aplicación — no hay
  sincronización entre dispositivos ni servidor remoto de por medio.
