# Feature Specification: Perfiles Múltiples con Harem Propio

**Feature Branch**: `001-multi-profile-harems`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Como usuario, quiero crear multiples Perfiles, los cuales tendran diferentes harems. Reglas de negocio: los perfiles pueden tener nombre, por defecto el nombre del perfil es uno generico hasta que se edite. \"Perfil N\". Un harem pertenece excatamente a un perfil. Puedo tener 0 perfiles. AL eliminer un perfil se elimina su harem. Solo un perfil puede estar \"activo\" o visible a la vez. Un harem es una lista de personajes agrupados por series. una serie contiene una lista de personajes el cual tiene obligatoriamente nombre y url de una imagen. un personaje pertenece solamente a una serie. opcionalmente un personaje puede tener, valor de \"kakeras\" (kakeras es el valor nominal de cada personaje expresado en un valor numerico, dicho valor lo calcula automaticamente 'mudae'). y \"claim rank\" (una pocion del rango de claimeo de un personaje expresado como #N)"

## Clarifications

### Session 2026-09-11

- Q: ¿Qué se muestra cuando hay 0 perfiles y cómo se crea uno en ese caso? → A: Se muestra una pantalla inicial que invita al usuario a copiar y pegar el mensaje que Mudae le manda por privado con su harem; el sistema lee ese texto y crea el perfil automáticamente a partir de él.
- Q: ¿Cuál es el formato exacto del texto pegado y qué datos deben extraerse? → A: Es el mensaje privado que envía Mudae al pedir el harem (comando en Discord, copiado tal cual). Primera línea `"<usuario>'s harem"` → nombre del perfil. Luego hay líneas de ruido a ignorar (línea en blanco / espacio invisible, `"Total value: N:kakera:"`, palabras sueltas `"Imagen"`). Cada serie empieza con una línea `"<Nombre de Serie> - X/Y"` (solo se usa el nombre; `X/Y` se ignora). Cada personaje es una línea `"#<claim rank> - <Nombre> <kakera> ka - <URL de imagen>"`.
- Q: ¿De dónde sale el nombre del perfil, reemplazando el "Perfil N" genérico original? → A: Del texto pegado (parte antes de `'s harem` en la primera línea); ya no existe un nombre genérico "Perfil N" por defecto porque no hay creación manual sin pegar texto.
- Q: ¿Pegar una lista de harem es la única forma de crear un perfil, o también existe crear uno vacío a mano? → A: Solo mediante pegado. No existe la opción de crear un perfil vacío manualmente; tanto la pantalla inicial (0 perfiles) como la acción de agregar un perfil adicional (con otros ya existentes) usan el mismo pegado.
- Q: ¿Qué pasa si se crea (pega) un perfil nuevo mientras otro ya está activo? → A: El perfil recién creado pasa a ser el activo automáticamente, reemplazando al que estaba activo antes.
- Q: ¿Qué pasa cuando una serie se queda sin personajes? → A: La serie se elimina automáticamente. Los personajes son la entidad prioritaria; las series existen solo como agrupación visual/de orden, no como entidades independientes que puedan quedar vacías.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un perfil pegando el harem de Mudae (Priority: P1)

Como usuario que no tiene ningún perfil cargado todavía, quiero pegar el
mensaje que Mudae me envía por privado con mi harem y que la app cree
automáticamente un perfil con mis series y personajes ya organizados, para
no tener que cargar cada personaje a mano.

**Why this priority**: es la única puerta de entrada a la app: sin poder
crear un perfil a partir del harem real de Mudae, no hay datos con los que
trabajar y ninguna otra historia tiene sentido.

**Independent Test**: puede probarse arrancando sin perfiles, pegando un
mensaje de harem válido (como el de ejemplo de Mudae) y verificando que se
crea un perfil con el nombre correcto, sus series y personajes agrupados, y
que un texto que no respeta el formato esperado es rechazado sin crear
nada.

**Acceptance Scenarios**:

1. **Given** que no existe ningún perfil, **When** el usuario abre la app,
   **Then** ve una pantalla inicial que lo invita a pegar el mensaje de
   harem que le envía Mudae.
2. **Given** la pantalla inicial de pegado, **When** el usuario pega un
   mensaje de harem válido (primera línea `"rodoifin's harem"`, seguida de
   series con sus personajes), **Then** el sistema crea un perfil llamado
   "rodoifin", con cada serie detectada y, dentro de cada una, sus
   personajes con nombre, imagen, kakeras y claim rank extraídos del texto.
3. **Given** un mensaje de harem con líneas de ruido (línea en blanco,
   `"Total value: 23,899:kakera:"`, palabras sueltas `"Imagen"`), **When**
   el sistema lo procesa, **Then** esas líneas se ignoran y no generan
   series, personajes ni errores.
4. **Given** un personaje cuya línea no incluye un valor de kakeras
   reconocible, **When** se procesa el pegado, **Then** el personaje se
   crea igual, con el valor de kakeras vacío/no definido.
5. **Given** un texto pegado que no contiene ninguna línea de serie ni de
   personaje reconocible, **When** el usuario intenta importarlo, **Then**
   el sistema rechaza la importación, no crea ningún perfil, y le indica al
   usuario que el formato no fue reconocido.

---

### User Story 2 - Cambiar el perfil activo y agregar perfiles adicionales (Priority: P2)

Como usuario con uno o más perfiles creados, quiero poder elegir cuál está
activo/visible y poder agregar otro perfil pegando un nuevo harem, para
trabajar siempre sobre un único harem a la vez sin mezclar personajes de
distintos perfiles.

**Why this priority**: depende de que ya exista al menos un perfil
(Historia 1), pero es lo que habilita el uso real de "múltiples" perfiles
en el día a día.

**Independent Test**: puede probarse teniendo un perfil activo, pegando un
segundo harem desde la acción de "nuevo perfil" y verificando que el
recién creado pasa a ser el activo; y alternando manualmente cuál perfil
está activo entre los existentes.

**Acceptance Scenarios**:

1. **Given** un perfil ya activo, **When** el usuario pega un nuevo harem
   para crear otro perfil, **Then** el perfil recién creado pasa a ser el
   activo automáticamente y el anterior pasa a inactivo.
2. **Given** dos o más perfiles existentes donde uno está activo, **When**
   el usuario selecciona otro perfil para activarlo, **Then** el perfil
   previamente activo pasa a inactivo, el seleccionado pasa a activo, y se
   muestra el harem de este último.
3. **Given** en todo momento con uno o más perfiles existentes, **When** se
   consulta el estado de los perfiles, **Then** como máximo un perfil está
   marcado como activo.
4. **Given** que el perfil activo es eliminado y quedan otros perfiles,
   **When** se completa la eliminación, **Then** el sistema activa
   automáticamente otro de los perfiles restantes.
5. **Given** que se elimina el único perfil existente, **When** se completa
   la eliminación, **Then** ningún perfil queda activo y se vuelve a
   mostrar la pantalla inicial de pegado (0 perfiles).

---

### User Story 3 - Renombrar y eliminar un perfil (Priority: P3)

Como usuario con perfiles ya creados a partir de un pegado, quiero poder
ponerle un nombre propio a un perfil y poder eliminarlo cuando ya no lo
necesito, para mantener mi lista de perfiles ordenada y solo con lo que uso.

**Why this priority**: es un ajuste sobre perfiles que ya existen gracias a
las Historias 1 y 2; agrega comodidad pero no es indispensable para el
valor central de crear y alternar perfiles.

**Independent Test**: puede probarse tomando un perfil ya creado,
renombrándolo y verificando que el nuevo nombre se conserva, y eliminándolo
después para verificar que su harem completo desaparece con él.

**Acceptance Scenarios**:

1. **Given** un perfil creado a partir de un pegado (con el nombre extraído
   del texto), **When** el usuario edita su nombre, **Then** el perfil pasa
   a mostrar el nombre indicado por el usuario.
2. **Given** un perfil con personajes cargados en su harem, **When** el
   usuario lo elimina, **Then** el perfil y todo su harem (series y
   personajes incluidos) se eliminan de forma permanente e inmediata.

---

### Edge Cases

- Un texto pegado que no coincide con el formato esperado (ni una línea de
  serie ni una de personaje reconocible) se rechaza sin crear un perfil
  parcial o corrupto (ver US1, escenario 5).
- Si dos perfiles terminan con el mismo nombre (por ejemplo, el usuario
  pega dos harems de la misma cuenta de Mudae, o edita un nombre a uno ya
  usado), el sistema no valida unicidad de nombre entre perfiles.
- Si una serie se queda sin personajes porque todos fueron eliminados, la
  serie se elimina automáticamente junto con el último personaje que la
  dejó vacía.
- Volver a pegar un mensaje de harem no actualiza ni fusiona el harem de un
  perfil existente: siempre crea un perfil nuevo y adicional.
- Si se intenta eliminar un perfil que ya no existe (doble clic, ya
  eliminado), la operación no debe afectar a otros perfiles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cuando no existe ningún perfil, el sistema DEBE mostrar una
  pantalla inicial que invite al usuario a pegar el mensaje de harem que
  Mudae le envía por privado.
- **FR-002**: El sistema DEBE permitir crear un perfil nuevo pegando ese
  texto, tanto desde la pantalla inicial (0 perfiles) como desde una acción
  explícita de "nuevo perfil" disponible cuando ya existe al menos uno.
- **FR-003**: Pegar un mensaje de harem DEBE ser la única forma de crear un
  perfil; el sistema NO DEBE ofrecer una opción para crear un perfil vacío
  o cargar sus datos a mano desde cero.
- **FR-004**: El sistema DEBE interpretar el texto pegado con el siguiente
  formato: una primera línea `"<nombre>'s harem"` de la cual se extrae el
  nombre del perfil; líneas de encabezado de serie con el patrón
  `"<Nombre de Serie> - X/Y"` de las cuales se extrae únicamente el nombre
  de la serie (la fracción `X/Y` se ignora); y líneas de personaje con el
  patrón `"#<claim rank> - <Nombre del personaje> <valor> ka - <URL de
  imagen>"` de las cuales se extraen el claim rank, el nombre, el valor de
  kakeras (cuando esté disponible) y la URL de imagen.
- **FR-005**: El sistema DEBE ignorar cualquier línea del texto pegado que
  no calce con los patrones de la FR-004 (líneas en blanco o de espacio
  invisible, el contador `"Total value: ...:kakera:"`, la palabra suelta
  `"Imagen"`, u otro texto no reconocido), sin que generen series,
  personajes ni errores.
- **FR-006**: Si una línea de personaje no incluye un valor de kakeras
  reconocible (por ejemplo, cuando Mudae todavía no lo calculó), el
  sistema DEBE guardar el personaje igualmente, dejando el valor de
  kakeras vacío/no definido.
- **FR-007**: Si el texto pegado no contiene al menos una línea de serie
  válida junto con al menos una línea de personaje válida, el sistema DEBE
  rechazar la importación, no crear ningún perfil, e informar al usuario
  que el formato no fue reconocido.
- **FR-008**: El sistema DEBE asignar como nombre del perfil recién creado
  el nombre extraído de la primera línea del texto pegado (la parte
  anterior a `'s harem`).
- **FR-009**: El usuario DEBE poder editar el nombre de cualquier perfil en
  cualquier momento después de creado; a partir de la edición, el perfil
  conserva el nombre indicado por el usuario.
- **FR-010**: El sistema DEBE permitir la existencia de 0 perfiles (estado
  válido que vuelve a mostrar la pantalla inicial de pegado, no un error).
- **FR-011**: El usuario DEBE poder eliminar un perfil existente; al
  eliminar un perfil, el sistema DEBE eliminar de forma permanente su
  harem completo (todas sus series y personajes).
- **FR-012**: El sistema DEBE garantizar que, en todo momento, como máximo
  un perfil esté marcado como "activo"/visible.
- **FR-013**: El usuario DEBE poder cambiar cuál perfil está activo
  seleccionando entre los perfiles existentes; activar un perfil desactiva
  automáticamente el que estuviera activo antes.
- **FR-014**: Al crear (pegar) un perfil nuevo mientras ya existe otro
  perfil activo, el sistema DEBE marcar automáticamente al perfil recién
  creado como el nuevo perfil activo, desactivando al anterior.
- **FR-015**: Cuando se elimina el perfil activo y quedan otros perfiles,
  el sistema DEBE activar automáticamente otro de los perfiles restantes;
  si no queda ningún perfil, ninguno queda activo y se vuelve a la
  pantalla inicial de pegado.
- **FR-016**: Cada harem DEBE pertenecer exactamente a un perfil y NO DEBE
  poder compartirse ni reutilizarse entre perfiles distintos.
- **FR-017**: El sistema DEBE organizar los personajes de un harem en
  series; cada personaje DEBE pertenecer exactamente a una serie.
- **FR-018**: Toda serie DEBE tener un nombre que la identifique.
- **FR-019**: Todo personaje DEBE tener obligatoriamente un nombre y una
  URL de imagen; el sistema NO DEBE crear un personaje al que le falte
  alguno de esos dos datos.
- **FR-020**: El sistema DEBE permitir que un personaje tenga, de forma
  opcional, un valor numérico de "kakeras".
- **FR-021**: El sistema DEBE permitir que un personaje tenga, de forma
  opcional, un "claim rank", expresado en el formato "#N".
- **FR-022**: Si, como resultado de eliminar personajes, una serie queda
  sin ningún personaje, el sistema DEBE eliminar automáticamente esa serie.
- **FR-023**: El sistema DEBE persistir automáticamente los perfiles y sus
  harems (perfiles, series, personajes y cuál perfil está activo) de forma
  local, sin requerir una acción manual de guardado, conforme al Principio
  I de la constitución del proyecto.
- **FR-024**: En un momento dado, el sistema DEBE mostrar y permitir editar
  únicamente el harem del perfil activo; los harems de los demás perfiles
  permanecen almacenados pero no visibles hasta que su perfil se active.

### Key Entities

- **Perfil**: representa una cuenta/servidor separado del usuario. Se crea
  únicamente a partir de un pegado de harem, del cual toma su nombre
  inicial (editable después) y un indicador de si está activo/visible.
  Tiene exactamente un Harem asociado.
- **Harem**: la colección de series y personajes de un Perfil, extraída
  del texto pegado en el momento de la creación. Pertenece exactamente a
  un Perfil y se elimina junto con él.
- **Serie**: agrupador con nombre dentro de un Harem, extraído de las
  líneas de encabezado de serie del texto pegado. Contiene una lista de
  Personajes y se elimina automáticamente si se queda sin ninguno; no es
  una entidad independiente de sus personajes.
- **Personaje**: pertenece exactamente a una Serie. Tiene nombre y URL de
  imagen obligatorios (extraídos del texto pegado). Opcionalmente tiene un
  valor numérico de "kakeras" y un "claim rank" (formato "#N"), ambos
  también extraídos del texto pegado cuando están presentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede pegar el mensaje de harem de Mudae y ver su
  nuevo perfil creado, con personajes agrupados por serie, en menos de 5
  segundos.
- **SC-002**: El 100% de las eliminaciones de perfil eliminan también
  todos los personajes y series de su harem, sin dejar datos huérfanos
  accesibles.
- **SC-003**: En cualquier momento con uno o más perfiles existentes, un
  usuario puede identificar sin ambigüedad cuál es el único perfil activo
  (nunca hay cero perfiles activos con perfiles existentes, ni más de uno
  activo a la vez).
- **SC-004**: Un usuario puede cambiar de perfil activo y ver el harem
  correspondiente en menos de 3 segundos.
- **SC-005**: El 100% de los personajes guardados exitosamente cuentan con
  nombre e imagen; ningún personaje incompleto queda guardado.
- **SC-006**: El 100% de los intentos de pegar un texto que no respeta el
  formato esperado son rechazados sin crear un perfil parcial o corrupto.
- **SC-007**: Un usuario puede visualizar su harem ya agrupado por serie,
  sin ninguna serie vacía visible, sin necesidad de ordenar u organizar
  los personajes manualmente.

## Assumptions

- No hay límite explícito en la cantidad de perfiles que un usuario puede
  crear (cada pegado adicional crea uno nuevo).
- No se valida unicidad de nombre entre perfiles: dos perfiles pueden
  tener el mismo nombre visible (por ejemplo, tras pegar dos veces harems
  de la misma cuenta) sin que el sistema lo impida.
- Se permiten personajes duplicados (mismo nombre e imagen) dentro de una
  misma serie o entre series distintas, ya que en Mudae es normal tener
  más de una copia reclamada del mismo personaje.
- La fracción `X/Y` que acompaña a cada nombre de serie en el texto
  pegado (cantidad reclamada sobre el total disponible en esa serie) no se
  almacena; solo se usa el nombre de la serie.
- El contador `"Total value: N:kakera:"` del encabezado del mensaje y las
  líneas sueltas `"Imagen"` son ruido del copiado desde Discord y se
  descartan por completo, sin guardarse en ningún lado.
- Volver a pegar un harem siempre crea un perfil nuevo; no existe (en esta
  feature) una acción de "reimportar" que actualice el harem de un perfil
  ya existente.
- El valor de "kakeras" y el "claim rank" son datos que ya vienen
  calculados por Mudae dentro del texto pegado; esta feature no los
  calcula, solo los extrae y almacena tal como aparecen.
