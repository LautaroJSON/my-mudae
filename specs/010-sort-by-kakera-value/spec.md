# Feature Specification: Ordenar por Valor de Kakera (Temporal)

**Feature Branch**: `010-sort-by-kakera-value`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Como usuario quiero poder ordener por valor de kakeras de manera asendente y desendente. el ordenamiento es de manera temporal, no sustitulle a mi ordenamiento. ordena dentro de cada serie por su valor de kakeras, y a nivel entre series, el valor de una serie es la suma del valor de kakeras de todos sus personajes. se encuentra un boton circular con icono de filtrado dentro de HeaderActions. al precionar despliega un div con opciones justo debajo del header. color del backgraun accent para que resalte. aqui tengo una opcion de "ordenamiento" al precionar se despliega 2 opciones abajo. "valor de kakera" y "rank". por ahora rank no se utiliza. "valor de kakera" funciona como un toggle, al tocar se ordena la lista de forma desendente. se se vuelve a precionar deja de ordenarse. como feedback visual se agrega una flecha apuntando hacia arriba. para alternar entre orden asendente o desendiente, se hace pulsando la flecha. (flecha -> asc/desc, boton -> toggle encendido apagado)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el harem ordenado por valor de kakera (Priority: P1)

Como usuario que ya armó su harem en un orden propio, quiero poder ver
temporalmente mi lista ordenada por valor de kakera (de mayor a menor),
tanto entre series como entre los personajes dentro de cada serie, para
identificar rápidamente qué es lo más valioso de mi harem sin tener que
sumar kakeras a mano ni perder el orden que armé manualmente.

**Why this priority**: Es el valor central de la funcionalidad: sin esta
vista alternativa, el resto de los controles (botón, panel, flecha) no
tienen propósito. Entrega valor por sí sola incluso sin la opción de
dirección ascendente.

**Independent Test**: Con un harem cargado que tenga varias series y
personajes con distintos valores de kakera, activar el ordenamiento por
"valor de kakera" y verificar que: (a) los personajes dentro de cada serie
quedan ordenados de mayor a menor kakera, (b) las series quedan ordenadas
de mayor a menor según la suma de kakera de sus personajes, y (c) al
desactivar el ordenamiento, el harem vuelve exactamente al orden manual
original.

**Acceptance Scenarios**:

1. **Given** un harem con varias series y personajes con distintos valores
   de kakera, **When** el usuario activa el ordenamiento por "valor de
   kakera", **Then** la lista se reordena de forma descendente (series por
   suma de kakera de sus personajes, y personajes dentro de cada serie por
   su propio valor).
2. **Given** el ordenamiento por kakera está activo, **When** el usuario
   vuelve a presionar la opción "valor de kakera", **Then** el
   ordenamiento se desactiva y la lista vuelve a mostrarse exactamente en
   el orden manual que tenía el usuario antes de activarlo.
3. **Given** el ordenamiento por kakera está activo, **When** el usuario
   genera o copia el comando de su harem, **Then** el comando generado
   refleja el orden manual persistido del usuario, no el orden temporal
   mostrado en pantalla.

---

### User Story 2 - Alternar entre orden ascendente y descendente (Priority: P2)

Como usuario con el ordenamiento por kakera activo, quiero poder alternar
entre ver primero lo más valioso o primero lo menos valioso, para poder
también identificar rápidamente los personajes o series de menor valor
(por ejemplo, para decidir qué descartar).

**Why this priority**: Complementa al ordenamiento base (P1) agregando la
dirección inversa; no tiene sentido sin que el ordenamiento ya esté
activo, por eso depende de la Historia 1.

**Independent Test**: Con el ordenamiento por "valor de kakera" ya activo
(en modo descendente por defecto), presionar el control de dirección
(flecha) y verificar que la lista se reordena de forma ascendente; al
volver a presionar, verificar que vuelve a descendente.

**Acceptance Scenarios**:

1. **Given** el ordenamiento por kakera está activo en modo descendente,
   **When** el usuario presiona el control de dirección, **Then** la
   lista se reordena de forma ascendente (series y personajes de menor a
   mayor valor de kakera).
2. **Given** el ordenamiento por kakera está activo en modo ascendente,
   **When** el usuario presiona nuevamente el control de dirección,
   **Then** la lista vuelve a ordenarse de forma descendente.
3. **Given** el ordenamiento por kakera está desactivado, **When** el
   usuario observa el control de dirección, **Then** este no tiene efecto
   sobre la lista (no hay ordenamiento activo sobre el cual aplicar una
   dirección).

---

### User Story 3 - Acceder a las opciones de ordenamiento desde el header (Priority: P3)

Como usuario, quiero un botón claramente identificable en la zona de
acciones del header que despliegue un panel de opciones de ordenamiento
debajo del header, para descubrir y usar esta funcionalidad sin que
interfiera con el resto de la interfaz, y para que en el futuro puedan
agregarse más criterios de ordenamiento (como "rank") sin rediseñar el
acceso.

**Why this priority**: Es el punto de entrada a la funcionalidad, pero es
de menor prioridad que el comportamiento de ordenamiento en sí: el valor
real está en P1 y P2; esta historia formaliza cómo se accede a ellas y
deja preparado el terreno para futuros criterios.

**Independent Test**: Presionar el botón circular de filtrado en la zona
de acciones del header y verificar que se despliega un panel justo debajo
del header, con fondo de color de acento; dentro, seleccionar la opción
"Ordenamiento" y verificar que aparecen las dos sub-opciones "Valor de
Kakera" y "Rank", con "Rank" visible pero sin efecto al presionarla.

**Acceptance Scenarios**:

1. **Given** el usuario está viendo su harem, **When** presiona el botón
   circular de filtrado en la zona de acciones del header, **Then** se
   despliega, justo debajo del header, un panel con fondo de color de
   acento que contiene la opción "Ordenamiento".
2. **Given** el panel de opciones está abierto, **When** el usuario
   presiona "Ordenamiento", **Then** se muestran las sub-opciones "Valor
   de Kakera" y "Rank".
3. **Given** las sub-opciones de ordenamiento están visibles, **When** el
   usuario presiona "Rank", **Then** no ocurre ningún cambio en el
   ordenamiento del harem (la opción está presente pero inactiva).
4. **Given** el panel de opciones está abierto, **When** el usuario vuelve
   a presionar el botón circular de filtrado, **Then** el panel se
   cierra.

---

### Edge Cases

- Personajes sin un valor de kakera registrado: se tratan como valor 0 a
  efectos de ordenamiento (consistente con el cálculo de suma de kakera
  por serie ya existente en la app).
- Empate en valor de kakera entre dos personajes de una misma serie, o
  entre dos series (misma suma): el orden entre los elementos empatados se
  mantiene según su orden manual actual, para que el resultado sea estable
  y no "salte" de forma impredecible cada vez que se activa el
  ordenamiento.
- El usuario intenta reordenar arrastrando personajes o series mientras el
  ordenamiento temporal por kakera está activo: el arrastre para
  reordenar queda deshabilitado mientras la vista ordenada esté activa,
  ya que las posiciones mostradas no corresponden al orden manual real.
- El usuario recarga la página, cambia de perfil o cambia de harem activo
  mientras el ordenamiento por kakera está activo: el ordenamiento
  temporal se desactiva y la vista vuelve a mostrar el orden manual
  guardado.
- Un harem sin ningún valor de kakera cargado en ninguno de sus
  personajes: el ordenamiento se puede activar igual, pero al no haber
  diferencias de valor, el orden resultante coincide con el orden manual
  (ver regla de empates).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La zona de acciones del header DEBE incluir un botón
  circular con ícono de filtrado que abre y cierra un panel de opciones
  de ordenamiento.
- **FR-002**: El panel DEBE desplegarse inmediatamente debajo del header
  al presionar el botón, y DEBE cerrarse al volver a presionar el mismo
  botón.
- **FR-003**: El panel DEBE mostrarse con un color de fondo de acento que
  lo distinga visualmente del resto de la interfaz.
- **FR-004**: El panel DEBE presentar una opción "Ordenamiento" que, al
  seleccionarse, despliega dos sub-opciones: "Valor de Kakera" y "Rank".
- **FR-005**: La sub-opción "Rank" DEBE estar visible pero sin
  comportamiento funcional en esta funcionalidad (no define ningún
  criterio de ordenamiento todavía).
- **FR-006**: La sub-opción "Valor de Kakera" DEBE comportarse como un
  interruptor de encendido/apagado: al seleccionarla estando apagada,
  activa el ordenamiento descendente por valor de kakera; al
  seleccionarla estando encendida, lo desactiva y restaura la vista al
  orden manual del usuario.
- **FR-007**: Mientras el ordenamiento por "Valor de Kakera" está activo,
  el sistema DEBE reordenar los personajes dentro de cada serie según su
  propio valor de kakera, y DEBE reordenar las series entre sí según la
  suma de los valores de kakera de todos sus personajes.
- **FR-008**: Mientras el ordenamiento por "Valor de Kakera" está activo,
  DEBE mostrarse un indicador de dirección (flecha) que refleje si el
  orden actual es ascendente o descendente.
- **FR-009**: Al presionar el indicador de dirección, el sistema DEBE
  alternar la dirección del ordenamiento activo entre descendente y
  ascendente, actualizando de inmediato el orden visible de series y
  personajes; este control solo tiene efecto mientras el ordenamiento por
  "Valor de Kakera" está activo.
- **FR-010**: El ordenamiento por kakera DEBE ser puramente una vista
  temporal: en ningún momento DEBE modificar, sobrescribir ni persistir
  el orden manual que el usuario definió para sus series y personajes.
- **FR-011**: Al desactivar el ordenamiento temporal (por el interruptor,
  por recarga de página, o por cambio de perfil/harem activo), el sistema
  DEBE restaurar exactamente el orden manual que estaba vigente antes de
  activar el ordenamiento.
- **FR-012**: Cualquier comando o texto generado para copiar/exportar el
  harem DEBE reflejar siempre el orden manual persistido, sin importar si
  el ordenamiento temporal por kakera está activo en ese momento.
- **FR-013**: Los personajes sin valor de kakera registrado DEBEN tratarse
  como valor 0 a efectos de este ordenamiento.
- **FR-014**: Ante un empate de valor de kakera (entre personajes de una
  misma serie, o entre series por su suma), el sistema DEBE mantener el
  orden manual relativo entre los elementos empatados, de forma que el
  resultado sea estable y determinístico.
- **FR-015**: Mientras el ordenamiento temporal por kakera está activo, el
  reordenamiento por arrastre (drag and drop) de series y personajes DEBE
  quedar deshabilitado.

### Key Entities

- **Personaje**: entidad existente del harem; para esta funcionalidad
  importa su valor de kakera (puede no estar registrado).
- **Serie**: entidad existente que agrupa personajes; su "valor" a
  efectos de este ordenamiento es la suma de los valores de kakera de
  todos sus personajes.
- **Estado de Ordenamiento Temporal**: estado nuevo, transitorio (no
  persistido), que indica si el ordenamiento por kakera está activo y en
  qué dirección (ascendente o descendente); siempre empieza desactivado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede identificar la serie y el personaje de
  mayor valor de kakera de su harem en menos de 2 acciones (abrir el
  panel y activar el ordenamiento), sin tener que calcular sumas a mano.
- **SC-002**: Al desactivar el ordenamiento temporal, el harem vuelve al
  orden manual exacto el 100% de las veces, incluso en harems de 200 o
  más personajes.
- **SC-003**: El usuario puede cambiar la dirección del ordenamiento con
  una sola acción, viendo la lista actualizada de inmediato (sin
  recargar la página).
- **SC-004**: El comando/texto exportado del harem coincide con el orden
  manual persistido el 100% de las veces, independientemente de si el
  ordenamiento temporal está activo al momento de generarlo.

## Assumptions

- Los personajes sin valor de kakera registrado se tratan como valor 0
  (consistente con el cálculo de suma por serie ya existente en la app).
- El estado del ordenamiento temporal no se persiste entre recargas de
  página ni al cambiar de perfil/harem: siempre arranca desactivado.
- Mientras el ordenamiento temporal está activo, el arrastre para
  reordenar (drag and drop) queda deshabilitado, ya que las posiciones
  mostradas no corresponden al orden manual real.
- Los empates de valor se resuelven manteniendo el orden manual existente
  entre los elementos empatados, para un resultado estable.
- La opción "Rank" se incluye en la interfaz como espacio reservado para
  un criterio de ordenamiento futuro; esta funcionalidad no define su
  comportamiento.
- El botón circular y el panel desplegable siguen el mismo sistema de
  diseño (colores, formas) ya usado por los demás botones de la zona de
  acciones del header.
