# Feature Specification: Comando de Orden de Harem para Discord

**Feature Branch**: `009-discord-sort-command`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "como usuario quiero un que la web me genere un comando para ordenar mi harem, tal cual esta su orden en la pagina, para copiar y pegar en un servidor de discord. ej de comando: $sm Esdeath $ Falin Touden $ Fleki $ Hachune Miku $ Zatsune Miku $ Ramlethal Valentine. quiero una seccion osculta, que al precionar el icono de flecha al lado del floatbutton, se muestra la siguiente barra, debe tener una animacion suabe de aparecer de abajo hacia arriba, tanto para volver a ocultar como para mostrar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver y copiar el comando de orden del harem (Priority: P1)

Como usuario, quiero presionar un ícono de flecha ubicado junto al botón
flotante de opciones para revelar una barra oculta que contiene un
comando de Discord con los nombres de mis personajes en el mismo orden
en que están agrupados y ordenados hoy en la pantalla principal, y
copiar ese comando con un botón, para poder pegarlo en un servidor de
Discord y que el bot reordene mi harem exactamente así.

**Why this priority**: es la funcionalidad que le da sentido a toda la
iteración; sin el comando generado correctamente, la barra y su
animación no tienen ninguna utilidad.

**Independent Test**: puede probarse abriendo un perfil con al menos dos
series y varios personajes en un orden particular (incluyendo alguno ya
reordenado manualmente por drag & drop), presionando el ícono de flecha,
y verificando que el texto mostrado empieza con "$sm " seguido de los
nombres de todos los personajes del harem separados por " $ ", en
exactamente el mismo orden (serie por serie, y dentro de cada serie
personaje por personaje) en que aparecen en la pantalla; luego
presionando "Copiar Comando" y verificando que ese mismo texto queda
disponible en el portapapeles junto con una confirmación visible.

**Acceptance Scenarios**:

1. **Given** un perfil activo con dos o más series y personajes
   cargados en un orden determinado, **When** el usuario presiona el
   ícono de flecha junto al botón flotante, **Then** se muestra una
   barra con un campo de texto cuyo contenido es "$sm " seguido de los
   nombres de todos los personajes del harem separados por " $ ", en el
   mismo orden serie-por-serie y personaje-por-personaje en que se ven
   agrupados hoy en la pantalla principal.
2. **Given** la barra abierta con el comando generado, **When** el
   usuario presiona el botón "Copiar Comando", **Then** el texto
   completo del comando se copia al portapapeles del sistema y el
   usuario recibe una confirmación visible de que se copió.
3. **Given** que el usuario reordenó manualmente series o personajes
   (drag & drop) o cambió de perfil activo, **When** vuelve a abrir la
   barra, **Then** el comando mostrado refleja ese nuevo orden
   actualizado, no uno anterior.
4. **Given** que no hay perfil activo o el harem del perfil activo no
   tiene ningún personaje, **When** el usuario abre la barra, **Then** el
   sistema muestra que no hay nada para ordenar en lugar de un comando
   "$sm" vacío o inválido, y no permite copiar un comando sin nombres.
5. **Given** que la copia al portapapeles falla (permiso denegado o no
   soportado), **When** el usuario presiona "Copiar Comando", **Then**
   el sistema muestra un feedback de error distinguible del feedback de
   éxito, en vez de indicar éxito de forma incorrecta.

---

### User Story 2 - Mostrar y ocultar la barra con una animación suave (Priority: P2)

Como usuario, quiero que la barra del comando aparezca deslizándose
suavemente de abajo hacia arriba al presionar el ícono de flecha, y que
se oculte con esa misma animación en reversa al volver a presionarlo,
para que la transición se sienta natural y no interrumpa mi navegación
con un cambio abrupto.

**Why this priority**: es un requisito explícito de experiencia de
usuario sobre cómo se revela la funcionalidad de la Historia 1, pero la
utilidad central (obtener y copiar el comando correcto) ya existe sin
necesidad de que la animación esté pulida.

**Independent Test**: puede probarse presionando repetidamente el ícono
de flecha con la barra oculta y visible, y verificando en cada caso que
la aparición y la desaparición se perciben como un desplazamiento suave
de abajo hacia arriba (y su inversa), sin que la barra aparezca o
desaparezca de forma instantánea, y que el ícono de flecha indica
visualmente si al presionarlo la barra se va a mostrar o a ocultar.

**Acceptance Scenarios**:

1. **Given** la barra oculta, **When** el usuario presiona el ícono de
   flecha, **Then** la barra se despliega con una animación suave de
   deslizamiento/aparición desde abajo hacia arriba, sin aparecer de
   forma instantánea.
2. **Given** la barra visible, **When** el usuario vuelve a presionar el
   ícono de flecha, **Then** la barra se oculta con una animación suave
   en el sentido inverso (de arriba hacia abajo), sin desaparecer de
   forma instantánea.
3. **Given** el ícono de flecha, **When** el usuario lo mira con la
   barra oculta versus visible, **Then** su orientación u otro indicio
   visual cambia según el estado, para anticipar si al presionarlo la
   va a mostrar o a ocultar.
4. **Given** la barra visible, **When** el usuario presiona el ícono de
   flecha varias veces seguidas muy rápido, **Then** la animación no
   queda en un estado visual inconsistente (a medio camino, superpuesta
   consigo misma o "trabada").

---

### Edge Cases

- ¿Qué pasa si el harem tiene una cantidad muy grande de personajes y el
  comando resultante es muy largo? El sistema igual genera y muestra el
  texto completo; no se contempla en esta iteración dividirlo en varios
  comandos ni validar el límite de longitud de mensaje del servidor de
  Discord de destino.
- ¿Qué pasa si el nombre de un personaje contiene el propio carácter
  "$" o espacios múltiples? El nombre se incluye tal cual está guardado,
  sin escaparlo ni modificarlo.
- ¿Qué pasa si la barra está abierta y el usuario cambia de perfil
  activo o reordena personajes sin cerrarla? El comando mostrado se
  actualiza para reflejar el nuevo estado, sin requerir cerrar y volver
  a abrir la barra.
- ¿Qué pasa en una pantalla angosta (mobile) donde el comando no entra
  en una sola línea visible? El campo de texto del comando permite
  desplazamiento horizontal para leerlo completo, sin romper el layout
  de la barra ni tapar el botón "Copiar Comando".
- ¿Qué pasa si el usuario toca fuera de la barra mientras está abierta?
  Sigue el mismo criterio ya establecido por el menú del botón flotante
  de opciones: se oculta con la misma animación suave, sin aplicar
  ningún cambio adicional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un ícono de flecha ubicado junto
  al botón flotante de opciones, visible en todo momento junto a él
  (mismo criterio de visibilidad permanente que ese botón).
- **FR-002**: Al presionar el ícono de flecha, el sistema DEBE alternar
  la visibilidad de una barra oculta que contiene el comando de orden
  del harem: si está oculta la muestra, si está visible la oculta.
- **FR-003**: La aparición de la barra DEBE animarse con un
  desplazamiento/aparición suave de abajo hacia arriba, y su
  ocultamiento DEBE animarse con el mismo movimiento en sentido inverso;
  en ningún caso debe aparecer o desaparecer de forma instantánea.
- **FR-004**: Con un perfil activo que tenga al menos un personaje, el
  sistema DEBE generar un texto de comando con el formato "$sm " seguido
  de los nombres de todos los personajes del harem separados por " $ ",
  usando exactamente el mismo orden en que las series y sus personajes
  se muestran agrupados en la pantalla principal (orden de series y,
  dentro de cada una, orden de personajes).
- **FR-005**: La barra DEBE incluir un botón "Copiar Comando" que copie
  el texto completo del comando generado al portapapeles del sistema.
- **FR-006**: Al copiar exitosamente, el sistema DEBE mostrar un
  feedback visible que confirme al usuario que el comando fue copiado.
- **FR-007**: Si la copia al portapapeles falla (permiso denegado, API
  no disponible u otro error), el sistema DEBE mostrar un feedback de
  error distinguible del feedback de éxito.
- **FR-008**: Si no hay perfil activo o el harem del perfil activo no
  tiene ningún personaje, el sistema DEBE indicar que no hay nada para
  ordenar e impedir la copia de un comando vacío o inválido.
- **FR-009**: El comando mostrado DEBE reflejar siempre el orden y el
  contenido actuales del harem activo, incluyendo cambios por
  reordenamiento manual o cambio de perfil ocurridos mientras la barra
  está abierta.
- **FR-010**: El ícono de flecha DEBE indicar visualmente el estado
  actual de la barra (oculta o visible) para anticipar el efecto de
  presionarlo.

### Key Entities *(include if feature involves data)*

- **Comando de orden de harem (texto)**: cadena de texto con el prefijo
  fijo "$sm " seguida de los nombres de los personajes del harem activo,
  separados por " $ ", en el mismo orden de series y personajes que ya
  se usa para mostrarlos en pantalla (el mismo orden que gestiona el
  reordenamiento por drag & drop). No incluye kakera, rango de claim ni
  imagen — solo nombres.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede revelar la barra y copiar el comando
  completo en dos acciones o menos (presionar la flecha y presionar
  "Copiar Comando").
- **SC-002**: El orden de los nombres en el comando generado coincide
  con el orden visual serie-por-serie y personaje-por-personaje del
  harem el 100% de las veces, incluso inmediatamente después de un
  reordenamiento manual.
- **SC-003**: La aparición y el ocultamiento de la barra se perciben
  como una transición suave y continua (sin saltos abruptos) el 100% de
  las veces que se presiona el ícono de flecha, sin importar cuántas
  veces se presione seguido.
- **SC-004**: Cuando no hay nada para ordenar (sin perfil activo o harem
  vacío), el usuario entiende sin ambigüedad que no se generó ningún
  comando, sin necesidad de interpretar mensajes técnicos.

## Assumptions

- El prefijo "$sm " es literal y fijo en esta iteración (comando de
  Mudae para reordenar el harem por claims); no es configurable por el
  usuario.
- El separador entre nombres de personajes es " $ " (espacio, signo
  pesos, espacio), tal como lo muestra el ejemplo provisto por el
  usuario.
- El "orden tal cual está en la página" es el mismo orden que ya
  gestionan las series y personajes del harem (agrupados por serie, con
  el orden de series y de personajes dentro de cada serie que resulta
  del reordenamiento por drag & drop ya existente); esta funcionalidad
  no introduce un criterio de orden nuevo, solo lo serializa a texto.
- El ícono de flecha se ubica junto al botón flotante de opciones ya
  existente (engranaje, esquina inferior derecha), sin modificar el
  comportamiento de ese botón ni de su propio menú de temas.
- No se valida ni se advierte sobre el límite de longitud de mensaje del
  servidor de Discord de destino; el sistema genera el texto completo
  sin truncarlo ni dividirlo en esta iteración.
- El estado de la barra (oculta/visible) no se persiste entre sesiones
  ni recargas de página: siempre arranca oculta, igual que el menú del
  botón flotante de opciones.
