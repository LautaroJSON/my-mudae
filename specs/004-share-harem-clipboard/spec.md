# Feature Specification: Compartir Harem por Portapapeles

**Feature Branch**: `004-share-harem-clipboard`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Vamos a trabajar en un conjunto de funcionalidades. como usuario puedo visualizar en la esquina superior derecha, una lista horizontal de iconos redondos. 1) Compartiar harem. (icono demostrativo para copiar al porta papeles) copiar el harem en el porta papeles, con el fin de pasarselo a otro usuario para que lo cargue en su maquina loca. el formato debe ser el mismo que se utiliza para dar de alta un perfil, ya que el usuario que recive la copia del harem, creara un perfil con esta misma informacion. se da un feedback al usuario de que el harem fue copiado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compartir el harem activo por portapapeles (Priority: P1)

Como usuario con un perfil activo, quiero tocar un icono redondo ubicado
en la esquina superior derecha de la pantalla para copiar mi harem
completo al portapapeles, de forma que pueda pegárselo a otra persona
(por ejemplo por chat) para que esa persona lo cargue en su propia
instalación de la app y obtenga un nuevo perfil con exactamente las
mismas series y personajes.

**Why this priority**: es la única funcionalidad solicitada en esta
iteración y es la que le da sentido a la barra de iconos; sin ella la
barra no tiene ninguna acción disponible.

**Independent Test**: puede probarse abriendo un perfil con al menos una
serie y un personaje cargados, tocando el icono "Compartir harem", y
verificando (a) que el contenido del portapapeles queda con el texto del
harem en el formato de pegado de perfiles, (b) que ese mismo texto,
pegado en el flujo existente de alta de perfil, genera un perfil nuevo
con las mismas series y personajes, y (c) que la app le muestra al
usuario una confirmación visible de que la copia se realizó.

**Acceptance Scenarios**:

1. **Given** un perfil activo con una o más series y personajes
   cargados, **When** el usuario toca el icono "Compartir harem" en la
   esquina superior derecha, **Then** el texto completo del harem activo
   (encabezado del perfil, series y personajes con su rango de claim,
   kakera e imagen) se copia al portapapeles del sistema en el mismo
   formato de texto que la app reconoce al dar de alta un perfil por
   pegado.
2. **Given** que la copia al portapapeles se completó correctamente,
   **When** finaliza la acción, **Then** el usuario ve un mensaje de
   confirmación (feedback) indicando que el harem fue copiado.
3. **Given** un texto de harem copiado por un usuario A, **When** un
   usuario B pega ese texto en el flujo de alta de perfil de su propia
   instalación de la app, **Then** se crea un nuevo perfil con el mismo
   nombre de perfil, las mismas series y los mismos personajes (nombre,
   kakera y rango de claim) que tenía el perfil original de A.
4. **Given** que no hay ningún perfil activo o el perfil activo no tiene
   series/personajes cargados, **When** el usuario mira la esquina
   superior derecha, **Then** el icono "Compartir harem" se muestra
   deshabilitado o no ejecuta ninguna copia, evitando copiar un harem
   vacío o inválido.
5. **Given** que el navegador del usuario deniega el permiso de
   escritura al portapapeles o la copia falla por cualquier motivo,
   **When** el usuario toca el icono "Compartir harem", **Then** la app
   le muestra un feedback de error en lugar de indicar éxito de forma
   incorrecta.

---

### Edge Cases

- ¿Qué pasa si el usuario toca el icono varias veces seguidas muy rápido?
  El resultado copiado debe seguir siendo el harem completo y correcto,
  sin duplicar feedbacks de forma confusa.
- ¿Qué pasa si el perfil activo tiene series sin personajes, o
  personajes sin kakera/rango de claim (campos opcionales)? El texto
  generado debe representar esos casos igual que lo hace hoy el formato
  reconocido al pegar (por ejemplo, omitiendo el rango de claim o el
  kakera cuando no existen).
- ¿Qué pasa si el nombre del perfil o de un personaje contiene
  caracteres especiales? Deben preservarse tal cual en el texto copiado,
  sin romper el reconocimiento del formato al pegarlo nuevamente.
- ¿Qué pasa en un navegador que no soporta la API de portapapeles? El
  usuario debe recibir un feedback claro de que la acción no pudo
  completarse, en vez de que el icono no responda sin explicación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar, en la esquina superior derecha de
  la pantalla principal, una lista horizontal de iconos redondos de
  acciones rápidas.
- **FR-002**: Esa lista DEBE incluir, en esta iteración, un icono
  "Compartir harem" que represente visualmente la acción de copiar al
  portapapeles.
- **FR-003**: Al activar el icono "Compartir harem" con un perfil activo
  que tenga al menos una serie o personaje, el sistema DEBE generar una
  representación en texto del harem completo del perfil activo (nombre
  del perfil, series y personajes con su rango de claim, kakera e
  imagen) usando el mismo formato de texto que el sistema ya reconoce al
  dar de alta o sincronizar un perfil mediante pegado.
- **FR-004**: El sistema DEBE copiar ese texto generado al portapapeles
  del sistema operativo/navegador del usuario.
- **FR-005**: El texto copiado, al ser pegado por cualquier usuario en el
  flujo existente de alta de perfil de la app, DEBE producir un perfil
  nuevo (o sincronizado) equivalente en series y personajes al harem que
  se compartió.
- **FR-006**: El sistema DEBE mostrarle al usuario un feedback visible e
  inequívoco confirmando que el harem fue copiado correctamente al
  portapapeles.
- **FR-007**: Si no hay perfil activo o el harem del perfil activo está
  vacío (sin series ni personajes), el sistema DEBE impedir la copia
  (por ejemplo deshabilitando el icono) en lugar de copiar un texto
  vacío o inválido.
- **FR-008**: Si la copia al portapapeles falla (permiso denegado, API no
  disponible u otro error), el sistema DEBE mostrarle al usuario un
  feedback de error distinguible del feedback de éxito.

### Key Entities *(include if feature involves data)*

- **Harem compartido (texto)**: representación textual del harem de un
  perfil, compuesta por el nombre del perfil, una o más series y, por
  cada serie, sus personajes (nombre, rango de claim opcional, kakera
  opcional e imagen). Es la misma información que ya existe como
  `Harem`/`Series`/`Character` en el perfil, expresada en el formato de
  texto que la app reconoce al pegar un harem para dar de alta un
  perfil.
- **Feedback de copiado**: mensaje temporal visible que confirma al
  usuario si la acción de copiar al portapapeles tuvo éxito o falló.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede copiar su harem activo al portapapeles con
  una sola acción (un toque/click) sobre el icono "Compartir harem".
- **SC-002**: El 100% de las veces que la copia se realiza con éxito, el
  usuario recibe una confirmación visible en menos de 1 segundo desde
  que tocó el icono.
- **SC-003**: Un harem copiado por un usuario y pegado por otro usuario
  en el flujo de alta de perfil produce un perfil con el mismo número de
  series y el mismo número de personajes, y con el mismo nombre, kakera
  y rango de claim por personaje, que el harem original.
- **SC-004**: Cuando la copia no puede completarse (sin perfil activo,
  harem vacío o error del navegador), el usuario entiende, sin ambigüedad,
  que la acción no se realizó, sin necesidad de interpretar mensajes
  técnicos.

## Assumptions

- El "mismo formato que se utiliza para dar de alta un perfil" se
  refiere al formato de texto plano que la app ya reconoce cuando el
  usuario pega un mensaje de harem (encabezado "`<nombre>'s harem`",
  encabezados de serie y líneas de personaje con rango de claim, kakera
  e imagen); esta funcionalidad genera ese mismo formato a partir del
  perfil activo, en vez de introducir un formato nuevo.
- Solo el perfil actualmente activo es el que se comparte con este
  icono; no se contempla en esta iteración elegir compartir un perfil
  distinto al activo.
- La lista horizontal de iconos redondos se diseña para convivir con el
  control de perfil ya existente en el encabezado (que hoy ocupa la
  esquina superior derecha); en esta iteración solo se agrega el icono
  de "Compartir harem", dejando lugar visual para futuros iconos que se
  definirán en otras funcionalidades del mismo conjunto.
- Se asume que el entorno de ejecución del usuario (navegador de
  escritorio o mobile moderno) soporta escritura al portapapeles del
  sistema; cuando no la soporta o la deniega, aplica el comportamiento
  de error descrito en los requerimientos.
- El feedback de copiado exitoso es un mensaje breve y no bloqueante que
  desaparece solo, siguiendo el mismo lenguaje visual en español que el
  resto de la app.
