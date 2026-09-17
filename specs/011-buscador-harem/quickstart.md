# Quickstart: Buscador de Personajes y Series en el Harem

**Feature**: `011-buscador-harem`

Guía de validación manual end-to-end. No reemplaza los tests
automatizados (`filter-harem-by-query.md`, `harem-search-ui.md`) — es la
verificación humana previa a dar la feature por terminada, incluyendo
los criterios de aceptación de la constitución (Principios II, III, V).

## Prerrequisitos

- Repo instalado (`npm install`) y corriendo en modo dev (`npm run
  dev`).
- Un perfil con harem cargado que tenga:
  - Al menos 3 series distintas, con nombres distinguibles entre sí
    (ej. "Konosuba", "Dragon Ball", "One Piece").
  - Al menos una serie con 2+ personajes, para poder distinguir
    "coincide toda la serie" de "coincide solo un personaje".
  - Al menos un personaje cuyo nombre incluya un acento (ej. "Nézuko")
    para validar FR-007.
- Un segundo perfil (o el mismo perfil, cambiable desde el header) para
  validar la limpieza al cambiar de perfil (FR-010).
- Para la validación de performance (Principio III): un perfil con 200+
  personajes cargados (se puede generar pegando un harem grande de
  prueba vía "Actualizar harem", `005`).

## Escenario 1 — Coincidencia por título de serie (User Story 1)

1. Abrir la app con el perfil de prueba activo.
2. Presionar el botón circular de búsqueda (ícono de lupa) en
   `HeaderActions` → **Verificar**: se expande con una transición
   animada hacia un campo de texto, con el ícono de lupa ahora anclado
   en la esquina derecha del campo, y el campo queda enfocado.
3. Escribir el nombre completo de una de las series de prueba (ej.
   "Konosuba") → **Verificar**: a medida que se escribe cada letra, la
   lista se va acotando; al completar el nombre, se ve esa serie
   completa con **todos** sus personajes, y ninguna otra serie.

## Escenario 2 — Coincidencia por nombre de personaje (User Story 1)

1. Con el buscador abierto y vacío, escribir el nombre de un personaje
   puntual de una serie con 2+ personajes (ej. "Goku").
2. **Verificar**: se muestra únicamente ese personaje, bajo el
   encabezado de su serie, sin mostrar los demás personajes de esa
   misma serie.
3. Borrar el texto letra por letra hasta dejar el input vacío →
   **Verificar**: el harem completo vuelve a mostrarse apenas el input
   queda vacío, sin necesidad de ninguna acción adicional (FR-011).

## Escenario 3 — Sin resultados (Edge Case)

1. Con el buscador abierto, escribir un texto que no coincida con
   ningún personaje ni serie (ej. "zzzznoexiste").
2. **Verificar**: se muestra un mensaje claro de que no hay resultados,
   nunca una grilla vacía sin explicación (FR-008).

## Escenario 4 — Case/acento-insensitive (FR-007)

1. Escribir el nombre de un personaje con acento (ej. "Nézuko") en
   minúsculas y sin el acento (ej. "nezuko").
2. **Verificar**: el personaje aparece igual, sin importar mayúsculas ni
   el acento.

## Escenario 5 — Abrir y cerrar el buscador, limpieza del texto (User Story 2)

1. Con el buscador cerrado, presionarlo → se expande.
2. Presionarlo de nuevo sin haber escrito nada → **Verificar**: se
   contrae de vuelta al botón redondo, sin errores.
3. Abrirlo de nuevo, escribir un texto que filtre la lista, y cerrarlo
   presionando el ícono → **Verificar**: el buscador se contrae, el
   harem completo vuelve a mostrarse de inmediato, y al volver a abrir
   el buscador el campo está vacío (FR-009).

## Escenario 6 — Limpieza al cambiar de perfil (User Story 3)

1. Con el buscador abierto y un texto que esté filtrando el harem del
   perfil activo, cambiar a otro perfil desde el selector de perfiles
   del header.
2. **Verificar**: el buscador queda cerrado y sin texto, y el harem del
   nuevo perfil se muestra completo, sin ningún filtro heredado del
   perfil anterior (FR-010).

## Escenario 7 — Integridad del comando exportado (Principio II)

1. Con una búsqueda activa que oculte parte del harem, abrir la barra
   de comando existente (`009`) y copiar el comando `$sm`.
2. **Verificar**: el comando copiado enumera **todos** los personajes
   del harem en su orden manual persistido, sin importar el filtro de
   búsqueda visible en pantalla.

## Escenario 8 — Combinación con el ordenamiento temporal por kakera (`010`)

1. Activar el ordenamiento temporal por kakera (botón de filtrado,
   `010`).
2. Con el ordenamiento activo, abrir el buscador y escribir un texto
   que coincida con parte del harem → **Verificar**: se muestra el
   subconjunto filtrado, ordenado por kakera.
3. Cerrar la búsqueda → **Verificar**: el harem completo se muestra
   ordenado por kakera (el ordenamiento no se vio afectado por haber
   buscado).
4. Con cualquiera de los dos activo, intentar arrastrar una serie o un
   personaje → **Verificar**: el gesto no inicia.

## Escenario 9 — Performance con harem grande (Principio III)

1. Activar el perfil con 200+ personajes.
2. Abrir el buscador y escribir un texto corto (2-3 letras) que
   coincida con muchas series/personajes → **Verificar**: el filtrado
   ocurre sin bloqueo perceptible de la interfaz tecla por tecla.
3. Seguir escribiendo hasta acotar el resultado a pocos elementos →
   **Verificar**: cada tecla se siente instantánea, sin degradación
   progresiva.

## Escenario 10 — Viewport móvil (Principio V)

1. Reducir el viewport a ~390px de ancho (o usar el modo responsive del
   navegador).
2. Repetir el Escenario 1 completo por touch (tap en vez de click) →
   **Verificar**: el botón y el campo expandido son alcanzables y
   operables por touch, el campo expandido no desborda el header ni
   fuerza scroll horizontal de la página.

## Criterios de éxito (resumen ligado a `spec.md`)

- SC-001/SC-002: encontrar cualquier personaje o serie escribiendo solo
  una parte de su nombre (Escenarios 1-2), con actualización instantánea
  tecla por tecla.
- SC-003: filtrado fluido con harems de 200+ (Escenario 9).
- SC-004: cerrar el buscador o cambiar de perfil siempre limpia el
  input y restaura la vista completa (Escenarios 5-6) — el escenario que
  bloquea el release si falla, junto con el Escenario 7 (Principio II).
- SC-005: no existe ningún botón de "buscar" o "enviar" separado — el
  filtrado ocurre solo con escribir (Escenarios 1-2).
