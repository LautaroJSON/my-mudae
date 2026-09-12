# Quickstart: Validar "Copiar Nombre de Personaje al Pasar el Mouse"

**Feature**: `006-copy-character-name` | **Fecha**: 2026-09-12

Reutiliza el harem de ejemplo de `specs/001-multi-profile-harems/
quickstart.md`. No incluye código de implementación — ver
`data-model.md`, `contracts/` y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`) — esta feature no agrega
  ninguna dependencia nueva.
- `npm run dev` levantado, con un perfil activo con al menos una serie y
  un personaje cargados.

## Escenario 1 — Copiar el nombre con éxito (US1, P1)

1. En una pantalla de escritorio (mouse), pasar el cursor sobre la
   tarjeta de un personaje. **Esperado**: aparece un icono circular
   pequeño en la esquina superior derecha de esa tarjeta.
2. Tocarlo. **Esperado**: aparece una confirmación visible de que el
   nombre se copió.
3. Pegar el contenido del portapapeles en cualquier editor de texto.
   **Esperado**: el texto es exactamente el nombre de ese personaje, sin
   nada más.

## Escenario 2 — El icono solo aparece sobre la tarjeta con el mouse encima

1. Con dos o más personajes visibles a la vez, pasar el mouse de una
   tarjeta a otra. **Esperado**: el icono aparece únicamente sobre la
   tarjeta que tiene el mouse encima en cada momento; al alejar el
   mouse de una tarjeta sin tocar su icono, ese icono desaparece sin
   haber copiado nada.

## Escenario 3 — El arrastre para reordenar sigue funcionando igual (US1, P1)

1. Con una serie de 3+ personajes, arrastrar una tarjeta desde un punto
   que NO sea el icono de copiar (por ejemplo, desde la imagen o el
   nombre) a otra posición dentro de la misma serie. **Esperado**: el
   reordenamiento funciona exactamente igual que antes de esta
   funcionalidad (comportamiento de la feature `003`, sin cambios).
2. Intentar iniciar un arrastre presionando y moviendo el mouse
   comenzando justo sobre el icono de copiar. **Esperado**: no se
   dispara ningún reordenamiento de esa tarjeta.

## Escenario 4 — Fallback cuando la Clipboard API falla o no existe

1. En las DevTools del navegador, bloquear el permiso de portapapeles
   del sitio (o simular ausencia de `navigator.clipboard`).
2. Pasar el mouse sobre una tarjeta y tocar el icono. **Esperado**: se
   abre un diálogo con el nombre del personaje ya seleccionado para
   copiar manualmente, en vez de un error de entrada.
3. Confirmar el copiado manual. **Esperado**: aparece la misma
   confirmación de éxito que en el Escenario 1.

## Escenario 5 — Disponible en dispositivos táctiles sin depender de hover

1. Con las DevTools en modo responsive/emulación táctil (viewport
   ~390×844), observar la tarjeta de un personaje sin tocarla todavía.
   **Esperado**: el icono de copiar ya está visible, sin necesidad de
   ningún gesto previo de hover (que no existe en ese dispositivo).
2. Tocar el icono. **Esperado**: mismo comportamiento de copiado y
   confirmación que en el Escenario 1.
3. Repetir el arrastre del Escenario 3 con emulación táctil. **Esperado**:
   el reordenamiento sigue funcionando igual, y tocar el icono no lo
   dispara accidentalmente.

## Escenario 6 — Rendimiento con un harem grande (Principio III)

1. Con un harem de prueba de 200+ personajes (o el mismo fixture que ya
   usa `tests/component/presentation/HaremView.performance.test.tsx` de
   `003`), verificar que la página renderiza sin errores y sin
   degradación perceptible al pasar el mouse por varias tarjetas
   seguidas.
