# Feature Specification: Buscador de Personajes y Series en el Harem

**Feature Branch**: `011-buscador-harem`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Como usuario quiero un boton de "busqueda" dentro del componente @src/presentation/components/HeaderActions/ que siga el mismo estilo de los botones redondos. el boton de busqueda me permite buscar el nombre de un personaje y/o titulo de al serie dentro del perfil activo. el boton buscas se presenta como un boton redondo con un icono de lupa utilizando lucide ya instalado. cuando preciono en el boton este se expande en forma de pila horizontal con una animacion agradable (el icono funciona como un toogle para expandir o cerrar este buscador, si habia texto y se cerro el input, la busqueda deja de estar activa y se limpia el valor del input, si se cambia de perfil mientras se esta buscando tambien se limpia el valor del input), donde se tranforma en un input mantieniendo el icono de busqueda en la esquina derecha. la busqueda se realiza al momento que cambia el valor del input, tecla por tecla, filtrando la lista de personajes y series, ej: si el usuario como input escribe "Konosuba" el cual coinside con el nombre de la una serie, puedo visualizar toda la serie con sus personajes. si el usuario escribe el nombre "goku" el cual coninside con el personaje, veo solamente el personaje."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar el harem escribiendo un nombre (Priority: P1)

Como usuario con un harem cargado en mi perfil activo, quiero escribir el
nombre de un personaje o el título de una serie en un buscador y ver la
lista filtrarse al instante, tecla por tecla, para encontrar rápidamente
algo puntual sin tener que recorrer manualmente todo mi harem.

**Why this priority**: Es el valor central de la funcionalidad completa;
sin el filtrado en tiempo real, el botón y la animación de apertura no
tienen ningún propósito. Por sí sola ya resuelve el problema que motiva la
feature.

**Independent Test**: Con un harem cargado que tenga varias series con
varios personajes cada una, abrir el buscador y escribir un texto que
coincida con el título de una serie: verificar que se muestra esa serie
completa con todos sus personajes y que el resto de las series desaparece
de la vista. Luego escribir el nombre de un personaje puntual de otra
serie: verificar que se muestra únicamente ese personaje (bajo el
encabezado de su serie) y ningún otro personaje de esa misma serie que no
coincida.

**Acceptance Scenarios**:

1. **Given** un harem con la serie "Konosuba" y sus personajes cargados,
   **When** el usuario escribe "Konosuba" en el buscador, **Then** se
   muestra la serie "Konosuba" completa junto con todos sus personajes, y
   las demás series dejan de mostrarse.
2. **Given** un harem que incluye al personaje "Goku" dentro de una serie,
   **When** el usuario escribe "goku" en el buscador, **Then** se muestra
   únicamente el personaje "Goku" (bajo el encabezado de su serie), sin
   mostrar el resto de los personajes de esa serie que no coinciden con el
   texto buscado.
3. **Given** el usuario está escribiendo en el buscador, **When** agrega o
   borra un carácter del texto, **Then** la lista filtrada se actualiza
   inmediatamente con cada cambio, sin necesidad de confirmar o enviar la
   búsqueda.
4. **Given** el buscador tiene texto que no coincide con ningún personaje
   ni serie del perfil activo, **When** se evalúa el filtro, **Then** el
   usuario ve un mensaje claro de que no se encontraron resultados, en
   lugar de una lista vacía sin explicación.
5. **Given** el buscador tiene texto ingresado, **When** el usuario borra
   todo el contenido del input, **Then** el harem vuelve a mostrarse
   completo, sin ningún filtro aplicado.

---

### User Story 2 - Abrir y cerrar el buscador con el ícono de lupa (Priority: P2)

Como usuario, quiero que el buscador aparezca inicialmente como un botón
redondo con el mismo estilo que los demás botones de acciones rápidas, y
que al presionarlo se expanda con una animación agradable hacia un campo
de texto, para poder acceder a la búsqueda sin que ocupe espacio
permanente en la interfaz cuando no la estoy usando.

**Why this priority**: Habilita el acceso a la funcionalidad de búsqueda
(User Story 1) de forma consistente con el resto de los controles de
`HeaderActions`, pero no aporta valor por sí sola si el filtrado no
funciona; por eso depende de la P1.

**Independent Test**: Con el buscador cerrado (solo el ícono redondo
visible), presionar el botón y verificar que se expande en forma de pila
horizontal mostrando un input con el ícono de lupa en su esquina derecha,
con una transición animada. Presionar el ícono nuevamente y verificar que
el buscador se contrae de vuelta al botón redondo original.

**Acceptance Scenarios**:

1. **Given** el buscador está cerrado (botón redondo con ícono de lupa),
   **When** el usuario presiona el botón, **Then** el buscador se expande
   con una animación hacia un input horizontal, manteniendo el ícono de
   lupa en la esquina derecha del campo.
2. **Given** el buscador está expandido y sin texto ingresado, **When** el
   usuario presiona el ícono de lupa, **Then** el buscador se contrae de
   vuelta al botón redondo original.
3. **Given** el buscador está expandido y tiene texto ingresado que está
   filtrando el harem, **When** el usuario presiona el ícono de lupa para
   cerrarlo, **Then** el buscador se contrae al botón redondo, el valor
   del input se limpia por completo y el filtro deja de estar activo
   (el harem vuelve a mostrarse completo).

---

### User Story 3 - Limpieza automática de la búsqueda al cambiar de perfil (Priority: P3)

Como usuario que gestiona más de un perfil, quiero que si cambio de perfil
activo mientras estoy buscando algo, la búsqueda se limpie automáticamente,
para no quedarme viendo por error un filtro de texto que no tiene sentido
en el nuevo perfil ni arrastrar resultados confusos entre harems distintos.

**Why this priority**: Es un caso de borde importante para la
consistencia de datos entre perfiles, pero de menor frecuencia de uso que
las dos historias anteriores; el usuario puede convivir sin ella en una
primera versión funcional, aunque conviene resolverla pronto para evitar
confusión.

**Independent Test**: Con el buscador abierto y un texto ingresado que
esté filtrando el harem del perfil activo, cambiar a otro perfil desde el
selector de perfiles y verificar que el input de búsqueda queda vacío y
que el nuevo perfil muestra su harem completo, sin ningún filtro
residual del perfil anterior.

**Acceptance Scenarios**:

1. **Given** el buscador está abierto con texto ingresado y filtrando el
   harem del perfil activo, **When** el usuario cambia a otro perfil,
   **Then** el valor del input se limpia automáticamente y el filtro deja
   de estar activo.
2. **Given** el buscador se limpió automáticamente por un cambio de
   perfil, **When** se muestra el harem del nuevo perfil activo, **Then**
   se muestra completo, sin resultados ni filtros heredados del perfil
   anterior.

---

### Edge Cases

- ¿Qué pasa si el texto ingresado no coincide con ningún personaje ni
  ninguna serie del perfil activo? El usuario debe ver un mensaje claro de
  "sin resultados", nunca una vista vacía sin explicación (ver Acceptance
  Scenario 4 de la User Story 1).
- ¿Qué pasa si el usuario ingresa solo espacios en blanco? Se trata como
  búsqueda vacía: se muestra el harem completo sin aplicar filtro.
- ¿Qué pasa si el texto ingresado coincide simultáneamente con el título
  de una serie y con el nombre de un personaje de otra serie distinta?
  Ambos resultados se muestran a la vez: la serie completa que coincide
  por título, y el personaje puntual que coincide por nombre dentro de su
  propia serie.
- ¿Qué pasa si el perfil activo no tiene ningún personaje cargado? El
  buscador puede abrirse igual, pero cualquier texto ingresado mostrará el
  estado de "sin resultados", ya que no hay nada para filtrar.
- ¿Qué pasa si el usuario tiene activo otro modo de visualización temporal
  del harem (por ejemplo, el ordenamiento temporal por valor de kakera)
  cuando abre el buscador? El filtro de búsqueda se aplica sobre la vista
  actualmente mostrada sin alterar ni persistir cambios en el orden
  manual del harem del usuario.
- ¿Qué pasa si el usuario escribe con mayúsculas, minúsculas o con acentos
  distintos a como está guardado el nombre? La coincidencia ignora
  mayúsculas/minúsculas y acentos, y no requiere que el texto ingresado
  sea el nombre completo (coincidencia parcial).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `HeaderActions` MUST mostrar un botón de búsqueda redondo,
  visualmente consistente con el resto de los botones redondos de
  acciones rápidas existentes (compartir, actualizar, ordenar), usando un
  ícono de lupa.
- **FR-002**: El botón de búsqueda MUST funcionar como un toggle: al
  presionarlo estando cerrado, se expande hacia un campo de búsqueda; al
  presionarlo estando expandido, se contrae de vuelta al botón redondo.
- **FR-003**: Al expandirse, el buscador MUST transformarse en una pila
  horizontal con un campo de texto, manteniendo el ícono de lupa anclado
  en la esquina derecha del campo, y la transición de apertura/cierre
  MUST estar animada.
- **FR-004**: El sistema MUST filtrar la lista de personajes y series del
  perfil activo en cada cambio del valor del input (tecla por tecla), sin
  requerir una acción de confirmación o envío por parte del usuario.
- **FR-005**: Cuando el texto ingresado coincida con el título de una
  serie del perfil activo, el sistema MUST mostrar esa serie completa
  junto con todos sus personajes.
- **FR-006**: Cuando el texto ingresado coincida con el nombre de uno o
  más personajes (sin coincidir con el título de su serie), el sistema
  MUST mostrar únicamente esos personajes, agrupados bajo el encabezado de
  su serie correspondiente, ocultando los demás personajes de esa serie
  que no coincidan.
- **FR-007**: La coincidencia de texto MUST ser insensible a
  mayúsculas/minúsculas y a acentos, y MUST aceptar coincidencias
  parciales (subcadenas), no solo el nombre o título completo.
- **FR-008**: Cuando no exista ninguna serie ni personaje que coincida con
  el texto ingresado, el sistema MUST mostrar un estado claro de "sin
  resultados" en lugar de una vista vacía.
- **FR-009**: Al cerrar el buscador (toggle a estado contraído) habiendo
  texto ingresado, el sistema MUST limpiar por completo el valor del input
  y desactivar el filtro, restaurando la vista completa del harem.
- **FR-010**: Al cambiar el perfil activo mientras el buscador está
  abierto, el sistema MUST limpiar automáticamente el valor del input y
  desactivar el filtro de búsqueda.
- **FR-011**: Cuando el input de búsqueda está vacío (ya sea porque nunca
  se ingresó texto o porque se borró todo su contenido), el sistema MUST
  mostrar el harem completo del perfil activo sin ningún filtro aplicado.
- **FR-012**: El filtrado por búsqueda MUST ser una operación de
  visualización temporal: NO MUST alterar ni persistir ningún cambio en
  el orden manual del harem del usuario ni en cualquier otro estado
  guardado del perfil.

### Key Entities

- **Personaje (Character)**: entidad ya existente en el harem, identificada
  por su nombre; es uno de los dos campos por los que se puede filtrar la
  búsqueda. No se agregan atributos nuevos.
- **Serie (Series)**: agrupación ya existente de personajes bajo un
  título; es el segundo campo por el que se puede filtrar la búsqueda.
  Una coincidencia por título de serie incluye a todos sus personajes; una
  coincidencia solo por nombre de personaje incluye únicamente a los
  personajes que coinciden, conservando el encabezado de su serie.
- **Texto de búsqueda**: estado transitorio de la interfaz (no persistido)
  que representa el valor actual del input de búsqueda y determina qué
  personajes/series se muestran; se limpia al cerrar el buscador o al
  cambiar de perfil activo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede encontrar cualquier personaje o serie de su
  harem escribiendo solo una parte de su nombre o título, sin necesidad de
  desplazarse manualmente por la lista completa.
- **SC-002**: La lista filtrada se actualiza en cada carácter escrito o
  borrado, sin demora perceptible para el usuario (percibido como
  instantáneo).
- **SC-003**: El filtrado se mantiene fluido y sin demoras perceptibles
  incluso en harems de 200 personajes o más.
- **SC-004**: El 100% de las veces que el usuario cierra el buscador
  teniendo texto ingresado, o cambia de perfil activo mientras busca, el
  campo de búsqueda queda vacío y la vista del harem vuelve a mostrarse
  completa sin rastros del filtro anterior.
- **SC-005**: El uso del buscador no requiere ningún clic adicional más
  allá de abrirlo y escribir: no existe un botón de "buscar" o "enviar"
  separado.

## Assumptions

- El buscador filtra únicamente dentro del harem del perfil activo; no
  busca entre perfiles distintos.
- La coincidencia de texto es parcial (subcadena), insensible a
  mayúsculas/minúsculas y a acentos, ya que es el comportamiento estándar
  esperado de un buscador de este tipo y no fue indicado lo contrario.
- Si el texto ingresado es solo espacios en blanco, se trata como búsqueda
  vacía (se muestra el harem completo).
- El buscador no modifica ni persiste el orden manual del harem del
  usuario: es una vista temporal, igual que el criterio ya establecido
  para el ordenamiento temporal por valor de kakera de una feature previa.
- El botón de búsqueda se integra entre los botones redondos existentes de
  `HeaderActions` (compartir, actualizar, ordenar), sin necesidad de
  especificar una posición exacta entre ellos, ya que no afecta el valor
  ni el comportamiento de la funcionalidad.
- No se requiere un límite máximo de longitud para el texto de búsqueda
  distinto de límites técnicos razonables de un campo de texto estándar.
