# Feature Specification: Layout en Cuadrícula de Series con Reordenamiento por Drag & Drop

**Feature Branch**: `003-character-series-reorder`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "como usuario quiero poder ver la lista de mis personajes, agrupados siepre por serie. como usuario puedo cambiar el orden de los personajes dentro de una misma serie con drag and drop. puedo ordenar el orden de las series con drag a drap. las series no deben ocupar una fila entera, si no que pueden verse una del lado de la otra hasta que no haya mas lugar, tipo flex wrap."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el harem agrupado por serie en una cuadrícula tipo flex-wrap (Priority: P1)

Como usuario, quiero ver los personajes de mi harem siempre agrupados por
serie, y que esas series se acomoden una al lado de la otra ocupando el
espacio disponible (en vez de una debajo de la otra ocupando toda la
fila), para poder abarcar visualmente más de mi harem sin scroll
innecesario.

**Why this priority**: es la base visual sobre la que se apoyan las otras
dos historias; sin este layout no hay superficie sobre la cual arrastrar
personajes ni series.

**Independent Test**: puede probarse abriendo un perfil con varias series
en una pantalla suficientemente ancha y verificando que más de una serie
aparece lado a lado en la misma fila, que una nueva serie pasa a la
siguiente fila solo cuando ya no entra ninguna más en la fila actual, y
que en una pantalla angosta (mobile) las series se acomodan de a una por
fila de forma natural por falta de espacio.

**Acceptance Scenarios**:

1. **Given** un perfil activo con dos o más series cargadas, **When** el
   usuario abre la vista principal del harem, **Then** cada personaje
   aparece agrupado bajo el nombre de su serie, igual que hoy.
2. **Given** una pantalla de escritorio con ancho suficiente para más de
   una serie, **When** se renderiza el harem, **Then** al menos dos
   grupos de serie se muestran uno al lado del otro en la misma fila, sin
   que cada uno ocupe el ancho completo del contenedor.
3. **Given** series ya acomodadas lado a lado, **When** no queda espacio
   horizontal para otro grupo de serie en la fila actual, **Then** el
   siguiente grupo de serie pasa a la fila siguiente (comportamiento tipo
   flex-wrap), sin solaparse con los anteriores.
4. **Given** la misma vista en una pantalla angosta (mobile), **When** el
   usuario la abre, **Then** las series se acomodan de a una por fila
   porque no entra más de una a la vez, sin necesidad de una vista
   separada para mobile.

---

### User Story 2 - Reordenar personajes dentro de una misma serie (Priority: P2)

Como usuario, quiero arrastrar y soltar un personaje para cambiar su
posición dentro de su propia serie, para poder ordenar mi harem según mi
propio criterio (por ejemplo, mis favoritos primero).

**Why this priority**: depende de que el agrupamiento por serie ya esté
visible (Historia 1), y es la interacción de reordenamiento más granular
que pidió el usuario.

**Independent Test**: puede probarse tomando una serie con al menos tres
personajes, arrastrando uno a una nueva posición dentro de la misma
serie, y verificando que el nuevo orden se refleja inmediatamente en
pantalla y se mantiene después de recargar la página.

**Acceptance Scenarios**:

1. **Given** una serie con al menos dos personajes, **When** el usuario
   arrastra un personaje a otra posición dentro de la misma serie y lo
   suelta, **Then** el personaje pasa a ocupar esa nueva posición y el
   resto de los personajes de esa serie se reacomoda en consecuencia.
2. **Given** un personaje recién reordenado dentro de su serie, **When**
   el usuario recarga la página, **Then** el orden queda exactamente
   igual a como lo dejó.
3. **Given** un personaje siendo arrastrado, **When** el usuario intenta
   soltarlo fuera de los límites de su propia serie (por ejemplo, sobre
   otra serie), **Then** el personaje permanece dentro de su serie
   original y no pasa a formar parte de otra serie.
4. **Given** una serie con un único personaje, **When** el usuario
   intenta arrastrarlo, **Then** no hay ninguna otra posición dentro de
   esa serie a la que moverlo y el orden no cambia.

---

### User Story 3 - Reordenar el orden de las series (Priority: P3)

Como usuario, quiero arrastrar y soltar una serie completa para cambiar
su posición respecto a las demás series de mi harem, para decidir qué
series veo primero.

**Why this priority**: es un reordenamiento de mayor alcance (mueve un
grupo entero, no un personaje individual) y depende de que el layout de
Historia 1 ya esté funcionando; se prioriza después del reordenamiento de
personajes porque el usuario lo mencionó en último lugar y afecta a una
unidad más grande del harem.

**Independent Test**: puede probarse tomando un harem con al menos tres
series, arrastrando una serie a una nueva posición entre las demás, y
verificando que el nuevo orden de series se refleja inmediatamente y se
mantiene después de recargar la página, sin alterar el orden interno de
los personajes de ninguna serie.

**Acceptance Scenarios**:

1. **Given** un harem con al menos dos series, **When** el usuario
   arrastra una serie a otra posición entre las series existentes y la
   suelta, **Then** esa serie pasa a ocupar la nueva posición y las demás
   series se reacomodan en consecuencia (incluyendo su efecto en el
   layout tipo flex-wrap de la Historia 1).
2. **Given** un orden de series recién cambiado, **When** el usuario
   recarga la página, **Then** el orden de series queda exactamente
   igual a como lo dejó.
3. **Given** una serie reordenada, **When** se completa el arrastre,
   **Then** el orden interno de los personajes dentro de cada serie no
   se ve afectado por el reordenamiento de series.
4. **Given** un harem con una sola serie, **When** el usuario intenta
   arrastrarla, **Then** no hay ninguna otra posición a la que moverla y
   el orden no cambia.

---

### Edge Cases

- ¿Qué pasa si el perfil activo no tiene series/personajes cargados? La
  vista existente que invita a cargar un harem se mantiene sin cambios;
  no hay nada que agrupar, mostrar en cuadrícula ni reordenar.
- ¿Qué pasa si una serie tiene un nombre muy largo o muchos personajes?
  El grupo de esa serie puede ocupar más espacio en su fila, pero el
  layout tipo flex-wrap del resto de las series debe seguir acomodándose
  alrededor sin romperse ni solaparse.
- ¿Qué pasa si el usuario redimensiona la ventana o rota el dispositivo
  mientras hay series acomodadas lado a lado? El acomodo de series se
  recalcula en base al nuevo ancho disponible, sin requerir recargar la
  página.
- ¿Qué pasa si el usuario suelta un personaje o una serie exactamente en
  la misma posición de la que partió? No debe producirse ningún cambio
  visible ni de comportamiento.
- ¿Qué pasa con harems grandes (200+ personajes repartidos en muchas
  series)? El reordenamiento (de personajes o de series) debe seguir
  sintiéndose fluido, sin que arrastrar un solo elemento provoque que
  toda la lista se vea recalcular o "parpadear".
- ¿Qué pasa si el usuario intenta reordenar usando un dispositivo
  táctil? Tanto el reordenamiento de personajes como el de series deben
  poder completarse con gestos táctiles, no solo con mouse.
- ¿Qué pasa si hay más de un perfil cargado? Reordenar personajes o
  series del perfil activo no debe afectar el orden guardado del harem
  de ningún otro perfil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar todos los personajes del harem del
  perfil activo agrupados bajo el nombre de su serie correspondiente.
- **FR-002**: El sistema NO DEBE forzar que cada grupo de serie ocupe una
  fila completa; DEBE acomodar varios grupos de serie uno al lado del
  otro dentro de la misma fila mientras haya espacio horizontal
  disponible, y pasar el siguiente grupo a una nueva fila recién cuando
  ya no entre (comportamiento tipo flex-wrap), en cualquier tamaño de
  pantalla soportado.
- **FR-003**: El acomodo de series en filas DEBE recalcularse
  automáticamente si cambia el ancho disponible (por ejemplo, al
  redimensionar la ventana o rotar el dispositivo), sin requerir recargar
  la página.
- **FR-004**: Los usuarios DEBEN poder reordenar los personajes dentro de
  una misma serie mediante arrastrar y soltar (drag and drop).
- **FR-005**: El arrastre de un personaje DEBE quedar limitado a
  reordenarlo dentro de su propia serie; el sistema NO DEBE permitir que,
  como resultado de este arrastre, un personaje termine perteneciendo a
  una serie distinta de la que tenía.
- **FR-006**: Los usuarios DEBEN poder reordenar las series entre sí
  (cambiar qué serie aparece antes que otra) mediante arrastrar y soltar.
- **FR-007**: Reordenar las series NO DEBE alterar el orden interno de
  los personajes dentro de cada serie individual.
- **FR-008**: El sistema DEBE persistir automáticamente el orden de los
  personajes dentro de cada serie inmediatamente después de cada
  reordenamiento, sin requerir una acción explícita de "guardar".
- **FR-009**: El sistema DEBE persistir automáticamente el orden de las
  series del harem inmediatamente después de cada reordenamiento, sin
  requerir una acción explícita de "guardar".
- **FR-010**: El orden de personajes y de series persistido DEBE
  restaurarse exactamente como quedó la próxima vez que se abra la app o
  se recargue la página.
- **FR-011**: El orden de personajes y series persistido es propio de
  cada perfil; reordenar el harem del perfil activo NO DEBE modificar el
  orden guardado del harem de ningún otro perfil.
- **FR-012**: Tanto el reordenamiento de personajes dentro de una serie
  como el reordenamiento de series DEBEN poder completarse con gestos
  táctiles en dispositivos móviles, no solo con mouse.
- **FR-013**: Mientras se arrastra un personaje o una serie, el sistema
  DEBE mostrar retroalimentación visual clara de qué elemento se está
  moviendo y en qué posición quedaría si se soltara ahí.
- **FR-014**: El reordenamiento (de personajes o de series) DEBE
  mantenerse fluido en harems de 200 o más personajes, sin provocar que
  se vuelva a renderizar visiblemente la lista completa por mover un solo
  elemento.

### Key Entities

- **Personaje**: ya existe como entidad del harem (nombre, imagen y
  opcionalmente kakera/claim rank); esta feature agrega el concepto de
  que su posición dentro de la lista de personajes de su serie es
  significativa y puede modificarse por el usuario.
- **Serie**: ya existe como agrupador de personajes dentro de un harem;
  esta feature agrega el concepto de que su posición relativa respecto a
  las demás series del harem es significativa y puede modificarse por el
  usuario, además de que su presentación visual ya no ocupa una fila
  completa por sí sola.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una pantalla de escritorio con ancho suficiente, un
  usuario ve al menos dos series distintas una al lado de la otra en la
  misma fila, sin desplazarse hacia abajo, cuando antes cada serie
  ocupaba su propia fila completa.
- **SC-002**: Un usuario puede cambiar la posición de un personaje dentro
  de su serie completando una única interacción de arrastrar y soltar, y
  ese cambio se ve reflejado en pantalla de inmediato (percibido como
  instantáneo, sin espera notoria).
- **SC-003**: Un usuario puede cambiar la posición de una serie completa
  respecto a las demás completando una única interacción de arrastrar y
  soltar.
- **SC-004**: El 100% de los reordenamientos de personajes y de series
  realizados por el usuario se mantienen idénticos después de recargar la
  página.
- **SC-005**: El reordenamiento por arrastre se percibe fluido (sin
  trabas ni saltos perceptibles) en un harem de prueba de 200 o más
  personajes repartidos en múltiples series.
- **SC-006**: El 100% de las interacciones de arrastrar y soltar descritas
  en esta feature pueden completarse tanto con mouse en escritorio como
  con gestos táctiles en un dispositivo móvil.

## Assumptions

- El agrupamiento de personajes por serie ya es, y sigue siendo, el único
  modo de visualización del harem; esta feature no agrega una vista
  alternativa "sin agrupar" ni un modo de desactivar el agrupamiento.
- El arrastre de personajes se limita explícitamente a reordenar dentro
  de la misma serie (así lo pidió el usuario); mover un personaje de una
  serie a otra por drag and drop queda fuera de alcance de esta feature.
- No existe un ancho fijo obligatorio por grupo de serie: el layout tipo
  flex-wrap acomoda tantos grupos de serie por fila como el espacio
  disponible permita según el contenido de cada uno; en pantallas angostas
  (mobile) es esperable y aceptable que cada fila contenga una sola serie
  por simple falta de espacio, sin que eso implique una vista distinta.
- El orden inicial de series y personajes (antes de cualquier
  reordenamiento manual por parte del usuario) es el orden en que fueron
  cargados/importados al perfil.
- Esta feature no incluye la generación ni copiado de un comando a partir
  del harem (esa funcionalidad no existe todavía en la app); el
  requisito de esta feature se limita a que el orden que el usuario ve y
  define quede correctamente persistido, quedando disponible para cuando
  esa funcionalidad futura exista.
- El reordenamiento aplica únicamente al harem del perfil activo en el
  momento de la interacción.
