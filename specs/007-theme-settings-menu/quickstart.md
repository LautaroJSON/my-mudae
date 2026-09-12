# Quickstart: Validar "Menú Flotante de Temas Visuales"

**Feature**: `007-theme-settings-menu` | **Fecha**: 2026-09-12

No incluye código de implementación — ver `data-model.md`, `contracts/`
y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`) — esta feature no agrega
  ninguna dependencia nueva.
- `npm run dev` levantado.

## Escenario 1 — Botón flotante siempre visible (US1, P1)

1. Abrir la app (con o sin perfiles creados). **Esperado**: se ve un
   botón circular con un ícono de engranaje, fijo en la esquina
   inferior derecha.
2. Hacer scroll de la página (si el contenido lo permite) y cambiar
   entre distintos estados (sin perfiles, con harem cargado). **Esperado**:
   el botón sigue visible en la misma posición en todos los casos.

## Escenario 2 — Abrir el menú y expandir "Temas" (US1, P1)

1. Tocar el botón flotante. **Esperado**: aparece un menú justo encima
   del botón, cuya primera (y única) opción es "Temas".
2. Tocar "Temas". **Esperado**: debajo de esa opción, dentro del mismo
   menú, se despliegan exactamente tres opciones: "Default cálido",
   "Claro", "Legacy".
3. Tocar "Temas" de nuevo. **Esperado**: las tres opciones se colapsan.

## Escenario 3 — Elegir cada tema y ver el cambio inmediato (US1, P1)

1. Con "Temas" expandido, elegir "Claro". **Esperado**: la app se ve con
   la paleta clara, sin importar el modo claro/oscuro del sistema
   operativo; la opción "Claro" queda marcada como activa.
2. En DevTools, emular `prefers-color-scheme: dark`. **Esperado**: la
   app sigue en "Claro" (no cambia a oscuro).
3. Elegir "Legacy". **Esperado**: la app pasa a una paleta oscura nueva
   (inspirada en Tokyo Night) y la tipografía general cambia a Segoe UI;
   sigue así sin importar el modo del sistema.
4. Elegir "Default cálido". **Esperado**: la app vuelve a su apariencia
   de siempre (paleta cálida), y ahora sí reacciona a
   `prefers-color-scheme` (alternar claro/oscuro en DevTools cambia la
   apariencia).

## Escenario 4 — Persistencia entre recargas (US1, P1)

1. Elegir "Legacy" y recargar la página completa (F5). **Esperado**: la
   app carga directamente con "Legacy" (paleta + tipografía), sin
   parpadeo visible del tema por defecto antes de aplicarse.
2. Repetir con "Claro". **Esperado**: mismo resultado, sin parpadeo.
3. Abrir la app en una pestaña nueva/incógnito (sin la preferencia
   guardada). **Esperado**: se ve "Default cálido" (comportamiento de
   siempre).

## Escenario 5 — Cerrar sin elegir nada

1. Abrir el menú, expandir "Temas", y tocar en cualquier parte fuera del
   menú. **Esperado**: el menú se cierra, el tema activo no cambió.
2. Repetir abriendo el menú y presionando Escape. **Esperado**: mismo
   resultado.

## Escenario 6 — Viewport móvil (Principio V de la constitución)

1. Repetir los Escenarios 1 a 3 con las DevTools en modo responsive
   (viewport ~390×844), incluyendo el toque del botón y las opciones
   con emulación táctil. **Esperado**: el botón y el menú se leen
   completos, sin salirse de la pantalla ni tapar contenido esencial
   (ej. el header o las tarjetas de personaje).
