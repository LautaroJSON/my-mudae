# Feature Specification: Menú Flotante de Temas Visuales

**Feature Branch**: `007-theme-settings-menu`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "como usuario quiero un boton de opciones que despliegue una lista de opciones. boton flotante siempre visible en la esquina inferior derecha. engranaje en un boton circular. al precionallo abre una lista de opciones encima de el. la primera opcion es 'temas'. 'temas' despliega debajo de el otra lista de opciones (tipo acorderon) donde se pueden elegir entre 3 temas. el defaul calido, tema claro, y tema 'legacy' el tema legacy no existe, hay que crearlo. el tema 'legacy' es una paleta de colores tipo 'tokyo night' de vs code y fuente Segoe UI. el tema claro no cambia la fuente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir el tema visual de la app desde un botón flotante de opciones (Priority: P1)

Como usuario, quiero tocar un botón flotante de opciones siempre visible
en la esquina inferior derecha de la pantalla, abrir "Temas" y elegir
entre los temas visuales disponibles, para personalizar la apariencia de
la app según mi preferencia, sin importar en qué pantalla o perfil esté
en ese momento.

**Why this priority**: es la única funcionalidad solicitada en esta
iteración; sin ella, el botón flotante y el menú no tienen ninguna
utilidad.

**Independent Test**: puede probarse abriendo la app, tocando el botón
flotante (engranaje) de la esquina inferior derecha, tocando "Temas",
eligiendo cada uno de los tres temas disponibles uno por uno, y
verificando que la apariencia de toda la app cambia de forma inmediata y
consistente en cada caso, y que el tema elegido se mantiene al recargar
la página.

**Acceptance Scenarios**:

1. **Given** el usuario está en cualquier pantalla de la app, **When**
   mira la esquina inferior derecha, **Then** ve un botón flotante,
   circular, con un ícono de engranaje, siempre visible sin importar el
   scroll o la pantalla activa.
2. **Given** el botón flotante visible, **When** el usuario lo toca,
   **Then** se despliega una lista de opciones encima del botón, cuya
   primera opción es "Temas".
3. **Given** la lista de opciones abierta, **When** el usuario toca
   "Temas", **Then** se despliega debajo de esa opción (estilo
   acordeón, dentro del mismo menú) una segunda lista con exactamente
   tres temas: "Default cálido", "Claro" y "Legacy".
4. **Given** la lista de temas desplegada, **When** el usuario elige
   "Default cálido", **Then** la app muestra su paleta de colores
   actual (la ya existente hoy), incluyendo su comportamiento actual de
   adaptarse automáticamente al modo claro/oscuro del sistema operativo
   del usuario.
5. **Given** la lista de temas desplegada, **When** el usuario elige
   "Claro", **Then** la app muestra su paleta de colores clara actual
   de forma fija, sin adaptarse al modo oscuro del sistema aunque este
   esté activado, y sin cambiar la tipografía de la app.
6. **Given** la lista de temas desplegada, **When** el usuario elige
   "Legacy", **Then** la app muestra una paleta de colores oscura nueva
   inspirada en "Tokyo Night" y cambia la tipografía de toda la app a
   "Segoe UI", de forma fija, sin adaptarse al modo claro/oscuro del
   sistema.
7. **Given** un tema ya elegido anteriormente, **When** el usuario
   cierra y vuelve a abrir la app (o recarga la página) en el mismo
   dispositivo, **Then** la app se muestra con ese mismo tema, sin que
   el usuario tenga que volver a elegirlo.
8. **Given** la lista de temas desplegada, **When** el usuario mira cuál
   está seleccionado, **Then** puede identificar con claridad cuál de
   los tres temas es el que está activo en ese momento.

---

### Edge Cases

- ¿Qué pasa la primera vez que un usuario abre la app, antes de elegir
  nunca un tema? Se muestra con "Default cálido" (el comportamiento
  actual de la app), sin requerir ninguna elección previa.
- ¿Qué pasa si el usuario tiene elegido "Default cálido" y cambia la
  preferencia de modo claro/oscuro de su sistema operativo mientras usa
  la app? La app debe seguir reaccionando a ese cambio automáticamente,
  igual que ya lo hace hoy.
- ¿Qué pasa si el usuario toca fuera del menú de opciones (o de la
  lista de temas) mientras está abierto? El menú se cierra sin aplicar
  ningún cambio adicional al tema ya elegido.
- ¿Qué pasa con el botón flotante y el menú en una pantalla angosta
  (mobile)? Deben seguir siendo completamente usables por touch, sin
  quedar tapados por otro contenido ni tapar controles esenciales ya
  existentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un botón flotante, circular, con
  un ícono de engranaje, fijo en la esquina inferior derecha de la
  pantalla, visible en todo momento sin importar el scroll o la
  pantalla/perfil activo.
- **FR-002**: Al activar ese botón, el sistema DEBE desplegar una lista
  de opciones ubicada encima del botón.
- **FR-003**: La primera opción de esa lista DEBE ser "Temas".
- **FR-004**: Al activar "Temas", el sistema DEBE desplegar, debajo de
  esa opción y dentro del mismo menú (comportamiento tipo acordeón), una
  segunda lista con exactamente tres opciones de tema: "Default cálido",
  "Claro" y "Legacy".
- **FR-005**: Al elegir cualquiera de los tres temas, el sistema DEBE
  aplicar la apariencia visual correspondiente a toda la aplicación de
  forma inmediata.
- **FR-006**: El sistema DEBE indicar visualmente, dentro de la lista de
  temas, cuál de los tres está actualmente activo.
- **FR-007**: El tema "Default cálido" DEBE corresponder a la paleta de
  colores por defecto ya existente de la aplicación hoy, conservando su
  comportamiento actual de adaptarse automáticamente entre variante
  clara y oscura según la preferencia de sistema operativo del usuario.
- **FR-008**: El tema "Claro" DEBE mostrar siempre la variante clara de
  la paleta de colores ya existente de la aplicación, de forma fija
  (sin adaptarse a la preferencia de modo oscuro del sistema), y sin
  modificar la tipografía de la aplicación.
- **FR-009**: El tema "Legacy" DEBE mostrar siempre una paleta de
  colores oscura nueva, inspirada en el tema "Tokyo Night" de VS Code, y
  DEBE cambiar la tipografía de toda la aplicación a "Segoe UI" (con una
  alternativa de respaldo si esa fuente no está disponible en el
  dispositivo del usuario), de forma fija, sin adaptarse a la preferencia
  de modo claro/oscuro del sistema.
- **FR-010**: El sistema DEBE recordar el tema elegido por el usuario y
  volver a aplicarlo automáticamente la próxima vez que abra la
  aplicación en el mismo dispositivo, sin requerir que lo vuelva a
  elegir.
- **FR-011**: El botón flotante de opciones y sus listas desplegables
  DEBEN ser completamente utilizables por touch en pantallas móviles,
  sin quedar ocultos ni obstruir otros controles esenciales ya
  existentes de la aplicación.

### Key Entities *(include if feature involves data)*

- **Preferencia de tema**: la elección del usuario entre "Default
  cálido", "Claro" o "Legacy". Es una preferencia visual del
  dispositivo/navegador, independiente del perfil de harem activo o de
  cualquier otro dato de la aplicación; no se sincroniza entre
  dispositivos distintos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede cambiar el tema visual de la app en dos
  toques o menos (abrir el menú y elegir el tema, tras expandir
  "Temas"), desde cualquier pantalla de la aplicación.
- **SC-002**: El tema elegido se mantiene y se vuelve a aplicar
  automáticamente la siguiente vez que el usuario abre la app en el
  mismo dispositivo, el 100% de las veces.
- **SC-003**: Tras elegir un tema, el 100% de las pantallas y
  componentes visibles de la aplicación reflejan sus colores (y, en el
  caso de "Legacy", también su tipografía) de forma inmediata, sin
  elementos que queden con la apariencia del tema anterior.
- **SC-004**: El botón flotante de opciones se puede tocar/clickear con
  una sola acción tanto en escritorio como en dispositivos móviles, sin
  obstruir ninguna otra acción ya existente de la aplicación.

## Assumptions

- "Default cálido" es el nombre que se le da, dentro de este selector,
  al comportamiento y paleta de colores que la aplicación ya tiene hoy
  por defecto (paleta cálida de un solo acento, adaptada
  automáticamente entre variante clara y oscura según la preferencia de
  sistema operativo del usuario) — esta funcionalidad no cambia esa
  paleta ni ese comportamiento, solo lo expone como una opción elegible
  explícitamente.
- "Claro" reutiliza la misma variante clara de esa paleta ya existente,
  pero de forma fija (no cambia si el sistema pasa a modo oscuro) y sin
  ningún cambio de tipografía — es consistente con la aclaración
  explícita del pedido original ("el tema claro no cambia la fuente").
- "Legacy" es el único tema verdaderamente nuevo de esta funcionalidad:
  una paleta de colores oscura inspirada en "Tokyo Night" (tonos
  azulados/violáceos oscuros, ya popular como tema de editor de código)
  y tipografía "Segoe UI" en toda la aplicación, con un fallback
  razonable si esa fuente no está disponible. Los valores exactos de
  color quedan para la fase de diseño/planificación, no para esta
  especificación.
- La preferencia de tema se guarda localmente en el dispositivo/
  navegador del usuario (mismo criterio "client-only" que ya usa el
  resto de la aplicación para persistir el harem); no requiere ningún
  inicio de sesión ni se sincroniza entre dispositivos distintos.
- En esta iteración, "Temas" es la única opción dentro del menú del
  botón flotante; el menú queda preparado en su diseño para poder sumar
  más opciones en el futuro, pero agregarlas está fuera de alcance
  acá.
- Cerrar el menú (tocar afuera, elegir un tema, etc.) no afecta ningún
  dato del harem ni del perfil activo — es puramente una preferencia
  visual independiente.
