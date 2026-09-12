# Feature Specification: Copiar Nombre de Personaje al Pasar el Mouse

**Feature Branch**: `006-copy-character-name`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Al pasar el mouse (hover) sobre la tarjeta de un personaje en el harem, debe aparecer un icono circular en la esquina superior derecha de esa tarjeta que permita copiar el nombre del personaje al portapapeles, con feedback de que se copió."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Copiar el nombre de un personaje desde su tarjeta (Priority: P1)

Como usuario viendo el harem de un perfil, quiero pasar el mouse sobre
la tarjeta de un personaje y tocar un icono que aparece en su esquina
superior derecha para copiar el nombre de ese personaje al portapapeles,
de forma que pueda pegarlo rápidamente en otro lugar (por ejemplo, para
buscarlo o mencionarlo) sin tener que transcribirlo a mano.

**Why this priority**: es la única funcionalidad solicitada en esta
iteración; sin ella, el icono no tiene ninguna acción disponible.

**Independent Test**: puede probarse abriendo un perfil con al menos un
personaje cargado, pasando el mouse sobre su tarjeta, tocando el icono
que aparece en la esquina superior derecha, y verificando que el
portapapeles queda con el nombre exacto de ese personaje y que la app
muestra una confirmación visible.

**Acceptance Scenarios**:

1. **Given** el usuario está viendo el harem de un perfil con al menos
   un personaje, **When** pasa el mouse sobre la tarjeta de un
   personaje, **Then** aparece un icono circular en la esquina superior
   derecha de esa tarjeta.
2. **Given** el icono está visible sobre la tarjeta de un personaje,
   **When** el usuario lo toca, **Then** el nombre de ese personaje (y
   solo ese nombre) se copia al portapapeles y el usuario ve una
   confirmación visible de que se copió.
3. **Given** el usuario deja de pasar el mouse por la tarjeta sin haber
   tocado el icono, **When** el mouse se aleja de la tarjeta, **Then**
   el icono deja de mostrarse y no se copia nada al portapapeles.
4. **Given** un harem con varios personajes visibles a la vez, **When**
   el usuario pasa el mouse por distintas tarjetas una tras otra,
   **Then** el icono aparece únicamente sobre la tarjeta que tiene el
   mouse encima en cada momento, nunca sobre más de una a la vez.
5. **Given** que el usuario puede reordenar personajes arrastrando su
   tarjeta dentro de la misma serie (funcionalidad ya existente),
   **When** arrastra una tarjeta desde cualquier punto que no sea el
   icono de copiar, **Then** el reordenamiento sigue funcionando
   exactamente igual que antes de esta funcionalidad.
6. **Given** el icono de copiar visible sobre una tarjeta, **When** el
   usuario presiona y arrastra comenzando justo sobre ese icono,
   **Then** no se dispara ningún reordenamiento accidental de esa
   tarjeta — como mucho, se interpreta como un intento de copiar.

---

### Edge Cases

- ¿Qué pasa en un dispositivo táctil, donde no existe un estado de
  hover persistente como el del mouse? El usuario debe poder acceder al
  icono de copiar igual, sin depender de un gesto de hover que su
  dispositivo no tiene.
- ¿Qué pasa si el copiado al portapapeles falla (permiso denegado, API
  no disponible en ese navegador)? El usuario debe recibir un feedback
  de error, distinguible del de éxito, en vez de que la app falle en
  silencio.
- ¿Qué pasa con nombres de personaje muy largos o con caracteres
  especiales (acentos, símbolos, emojis)? Se copian tal cual se
  muestran, sin truncar ni alterar el texto.
- ¿Qué pasa si el usuario toca el icono varias veces seguidas muy
  rápido? Cada toque copia el nombre igual, mostrando el feedback
  correspondiente sin acumular ni confundir mensajes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un icono circular de copiar en la
  esquina superior derecha de la tarjeta de un personaje cuando el
  usuario pasa el mouse sobre ella (o, en dispositivos donde ese gesto
  no existe, mediante un mecanismo que no dependa de él).
- **FR-002**: Al activar ese icono, el sistema DEBE copiar al
  portapapeles únicamente el nombre del personaje correspondiente a esa
  tarjeta, tal como se muestra en pantalla.
- **FR-003**: El sistema DEBE mostrarle al usuario un feedback visible
  de que el nombre se copió con éxito.
- **FR-004**: Si el copiado al portapapeles falla, el sistema DEBE
  mostrar un feedback de error distinguible del de éxito, sin fallar en
  silencio.
- **FR-005**: El icono DEBE dejar de mostrarse cuando el mouse deja de
  estar sobre la tarjeta (o su equivalente en dispositivos sin hover),
  sin haber copiado nada si no fue activado explícitamente.
- **FR-006**: Activar el icono de copiar NO DEBE iniciar ni interferir
  con el reordenamiento por arrastre de personajes ya existente; a su
  vez, arrastrar la tarjeta desde cualquier otro punto DEBE seguir
  reordenando con normalidad.
- **FR-007**: Esta funcionalidad DEBE estar disponible para cualquier
  personaje del harem del perfil activo, sin importar en qué serie se
  encuentre.

### Key Entities *(include if data involved)*

- **Personaje (existente)**: esta funcionalidad solo lee el nombre ya
  existente de cada personaje (`Character.name`) para copiarlo; no
  agrega ningún campo ni entidad nueva.
- **Feedback de copiado**: mensaje temporal visible que confirma al
  usuario si el nombre se copió con éxito o si falló (mismo tipo de
  resultado ya usado por otras funcionalidades de copiado de la app).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede copiar el nombre de cualquier personaje
  visible con una sola acción (pasar el mouse y tocar el icono, o su
  equivalente táctil).
- **SC-002**: El 100% de las veces que el copiado se realiza con éxito,
  el usuario recibe una confirmación visible en menos de 1 segundo desde
  que tocó el icono.
- **SC-003**: El reordenamiento de personajes por arrastre sigue
  funcionando exactamente igual que antes de esta funcionalidad, en el
  100% de los casos verificados tras agregarla.
- **SC-004**: Usuarios en dispositivos táctiles pueden completar la
  misma acción de copiado sin necesitar un gesto de hover que su
  dispositivo no soporta.

## Assumptions

- El "nombre del personaje" a copiar es exactamente el texto que ya se
  muestra en su tarjeta (`Character.name`), sin agregar el nombre de la
  serie, el kakera, el rango de reclamo ni ningún otro dato.
- En dispositivos táctiles, donde no existe un estado de hover
  persistente equivalente al del mouse, el icono se muestra disponible
  sin depender de ese gesto (por ejemplo, visible de forma permanente en
  esos dispositivos) en vez de quedar inaccesible — siguiendo el mismo
  criterio "touch-first" que ya exige el resto de la app para cualquier
  interacción nueva.
- El feedback de copiado exitoso o de error sigue el mismo lenguaje
  visual breve y no bloqueante que ya usan las demás funcionalidades de
  copiado de la app.
- Esta funcionalidad convive con el reordenamiento de personajes por
  arrastre ya existente sin reemplazarlo ni modificar su comportamiento
  fuera del propio icono de copiar.
