# Feature Specification: Actualizar Harem por Re-Pegado

**Feature Branch**: `005-update-harem-paste`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Agregamos una funcionalidad, actualizar harem. (icono de actualizar) Abre un modal que vuelve a pedir el harem (pegar el texto), el harem que se pasa sobreescribe el actual. La única condición es que el nombre de usuario (perfil) sea igual al perfil donde se está actualizando; si detecta otro nombre de perfil en el texto pegado, sale un modal advirtiendo que se está copiando el harem de otro usuario, el cual no corresponde con el usuario del perfil actual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Actualizar el harem del perfil activo re-pegando el mensaje de Mudae (Priority: P1)

Como usuario con un perfil activo, quiero volver a pegar el mensaje de
harem actualizado que me manda Mudae (tras reclamar personajes nuevos o
ver cambios en el kakera) para que mi perfil refleje esos cambios, sin
tener que borrar el perfil y crearlo de nuevo desde cero.

**Why this priority**: es la única funcionalidad solicitada en esta
iteración y es la que le da sentido al nuevo icono; sin ella el icono no
tiene ninguna acción disponible.

**Independent Test**: con un perfil activo ya cargado, tocar el icono
"Actualizar harem", pegar una versión más reciente del mismo mensaje de
harem (mismo nombre de perfil, con algún personaje nuevo, alguno con
kakera distinto, y alguno ausente) y verificar que el harem del perfil
queda exactamente como describe el nuevo pegado: el personaje ausente ya
no aparece, el de kakera distinto se actualiza, y el nuevo aparece.

**Acceptance Scenarios**:

1. **Given** un perfil activo cargado, **When** el usuario toca el icono
   "Actualizar harem", **Then** se abre un modal que le permite pegar un
   nuevo texto de harem, con el mismo mecanismo de pegado ya usado para
   dar de alta un perfil.
2. **Given** el modal de actualizar harem abierto, **When** el usuario
   pega un texto de harem válido cuyo nombre de perfil coincide
   exactamente con el del perfil que se está actualizando, **Then** el
   harem de ese perfil se sobrescribe con el contenido del nuevo pegado
   (los personajes ausentes del nuevo pegado desaparecen, los que
   coinciden por su identificador de reclamo se actualizan, y los nuevos
   se agregan) y el usuario ve una confirmación de que la actualización
   se realizó con éxito.
3. **Given** el modal de actualizar harem abierto, **When** el usuario
   pega un texto de harem válido cuyo nombre de perfil es DISTINTO al
   del perfil que se está actualizando, **Then** el sistema NO
   sobrescribe ningún harem y muestra una advertencia indicando el
   nombre de perfil detectado en el texto pegado, aclarando que no
   corresponde al perfil que se está actualizando.
4. **Given** la advertencia de "perfil distinto" mostrada, **When** el
   usuario la cierra, **Then** el harem del perfil activo permanece
   exactamente igual que antes de pegar, y puede volver a intentarlo
   pegando el texto correcto.
5. **Given** el modal de actualizar harem abierto, **When** el usuario
   pega un texto que no es reconocible como un harem de Mudae, **Then**
   se muestra un mensaje de formato inválido (mismo criterio que ya usa
   la app al dar de alta un perfil) y el harem del perfil activo no se
   modifica.

---

### Edge Cases

- ¿Qué pasa si el nombre de perfil del texto pegado coincide con el de
  **otro** perfil ya existente en la app (no con el que se está
  actualizando)? Se trata igual que cualquier otra discordancia: se
  advierte al usuario y no se modifica ni el perfil activo ni ese otro
  perfil — actualizar nunca reasigna la acción a un perfil distinto del
  que el usuario abrió para actualizar.
- ¿Qué pasa si el perfil activo no tiene ningún personaje cargado
  todavía (harem vacío)? El icono de actualizar sigue disponible y
  funciona igual: al pegar un texto válido del mismo perfil, el harem
  pasa de vacío a tener el contenido del pegado.
- ¿Qué pasa si el usuario pega exactamente el mismo texto que ya
  representa el harem actual (sin cambios reales)? La actualización se
  considera exitosa igual, y el harem resultante queda equivalente al
  que ya había.
- ¿Qué pasa si no hay ningún perfil activo? El icono "Actualizar harem"
  no debe ofrecer ninguna acción (no hay ningún perfil al cual
  actualizar).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un icono "Actualizar harem" junto
  al resto de iconos de acciones rápidas de la esquina superior derecha,
  disponible siempre que haya un perfil activo.
- **FR-002**: Al activar el icono "Actualizar harem", el sistema DEBE
  abrir un modal que le permita al usuario pegar un nuevo texto de
  harem, reutilizando el mismo mecanismo de pegado ya usado para dar de
  alta un perfil.
- **FR-003**: El sistema DEBE reconocer el texto pegado con el mismo
  formato que ya reconoce al dar de alta un perfil.
- **FR-004**: Si el texto pegado no es reconocible como un harem válido,
  el sistema DEBE mostrar un mensaje de error de formato inválido y NO
  modificar el harem del perfil activo.
- **FR-005**: Si el texto pegado es válido y el nombre de perfil que
  contiene coincide exactamente con el nombre de usuario original del
  perfil que se está actualizando, el sistema DEBE sobrescribir el harem
  de ese perfil con el contenido del nuevo pegado: los personajes que ya
  no aparecen en el nuevo pegado se eliminan, los que coinciden por su
  identificador de reclamo se actualizan, y los personajes nuevos se
  agregan.
- **FR-006**: Si el texto pegado es válido pero el nombre de perfil que
  contiene NO coincide con el nombre de usuario original del perfil que
  se está actualizando (sea porque pertenece a otro perfil ya existente
  en la app o a uno completamente distinto), el sistema DEBE impedir la
  actualización y mostrar una advertencia explícita que indique el
  nombre de perfil detectado en el texto pegado y aclare que no
  corresponde al perfil actual.
- **FR-007**: Ante la advertencia de discordancia de perfil, el sistema
  DEBE permitir al usuario cerrarla sin aplicar ningún cambio al harem
  del perfil activo, y sin crear ni modificar ningún otro perfil de la
  app.
- **FR-008**: El sistema DEBE mostrarle al usuario un feedback claro de
  que la actualización se completó con éxito.
- **FR-009**: El icono "Actualizar harem" y su modal DEBEN estar
  disponibles independientemente de si el harem del perfil activo tiene
  o no personajes cargados actualmente.

### Key Entities *(include if feature involves data)*

- **Perfil / Harem (existentes)**: la actualización opera sobre el
  mismo `Harem` (series y personajes) del perfil activo ya definido en
  funcionalidades anteriores; esta feature no agrega ninguna entidad
  nueva, solo una nueva forma de reemplazar el contenido de un harem ya
  existente.
- **Resultado de la actualización**: éxito (harem sobrescrito), error de
  formato (texto no reconocible), o advertencia de perfil distinto
  (nombre de usuario del texto pegado no coincide con el del perfil que
  se está actualizando).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede actualizar el harem de su perfil activo
  con una sola acción de pegado dentro del modal de "Actualizar harem",
  sin necesitar borrar ni recrear el perfil.
- **SC-002**: El 100% de los intentos de actualizar con un texto de un
  usuario de Mudae distinto al del perfil que se está actualizando son
  detectados y bloqueados antes de modificar cualquier dato persistido.
- **SC-003**: Tras una actualización exitosa, el harem del perfil
  contiene exactamente las mismas series y personajes (mismo nombre,
  kakera e identificador de reclamo) que describe el texto recién
  pegado — ni más, ni menos.
- **SC-004**: Ante la advertencia de perfil distinto, el usuario
  entiende de inmediato, sin ambigüedad, qué nombre de usuario detectó
  el sistema y que no corresponde al perfil actual, sin necesidad de
  interpretar mensajes técnicos.

## Assumptions

- El "nombre de usuario" que debe coincidir es el identificador interno
  e inmutable del perfil (fijado la primera vez que se pegó su harem,
  ver funcionalidad de header/perfiles ya existente), no el alias
  visible que el usuario puede haber editado libremente después —
  porque es el valor que de forma confiable sigue reflejando la cuenta
  original de Mudae/Discord en cada pegado posterior.
- En esta iteración, una discordancia de nombre de perfil es siempre un
  bloqueo estricto: no se ofrece una opción de "forzar" la actualización
  igual con un nombre distinto.
- El icono "Actualizar harem" se agrega a la misma lista horizontal de
  iconos redondos de la esquina superior derecha introducida por la
  funcionalidad de "Compartir harem", como un segundo icono dentro de
  esa misma lista.
- Solo el perfil actualmente activo puede actualizarse con este icono;
  no se contempla en esta iteración elegir actualizar un perfil distinto
  al activo.
- El criterio de sincronización de personajes (qué se agrega, actualiza
  o elimina al reemplazar el harem) es el mismo que ya usa la app al
  reconocer un segundo pegado del mismo perfil en el flujo de alta de
  perfiles existente — esta funcionalidad no introduce un criterio de
  comparación nuevo, solo un punto de entrada dedicado para dispararlo
  explícitamente desde el perfil ya activo.
