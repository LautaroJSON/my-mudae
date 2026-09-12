# Contrato: UI del menú de opciones (`SettingsFab` / `SettingsMenu` / `ThemeMenuItem`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna.

## `SettingsFab`

- **Responsabilidad única**: el botón flotante (FR-001) y si el menú
  está abierto o cerrado.
- **Siempre visible**: `position: fixed`, esquina inferior derecha,
  montado en `App.tsx` fuera de cualquier condicional de perfil/vista —
  presente en el estado vacío, con harem cargado, y en "perfil no
  encontrado".
- **Icono**: `Settings` de `lucide-react`, dentro de un botón redondo
  (`border-radius: theme.radii.pill`).
- **Al activarse**: alterna `isOpen`; cuando `isOpen`, monta
  `<SettingsMenu onClose={...}>`.
- **Cierre**: click fuera del botón/menú, o tecla Escape, cierran el
  menú (`isOpen` a `false`) sin aplicar ningún cambio adicional.
- **Accesibilidad**: `aria-label="Opciones"` (o equivalente),
  `aria-expanded` reflejando `isOpen`, operable por teclado
  (Enter/Space).

## `SettingsMenu`

- **Responsabilidad única**: contenedor visual anclado **encima** del
  botón (FR-002) — no sabe nada sobre temas ni ninguna opción
  específica.
- **Props**: `onClose: () => void` (para que sus hijos, o el
  click-afuera/Escape gestionado por `SettingsFab`, puedan cerrarlo).
- **Contenido**: en esta iteración, monta un único hijo, `<ThemeMenuItem />`,
  como primer (y único) ítem de la lista (FR-003).
- **Extensibilidad**: un segundo ítem futuro se agregaría como otro hijo
  hermano de `ThemeMenuItem`, sin que `SettingsMenu` necesite cambiar.

## `ThemeMenuItem`

- **Responsabilidad única**: la fila "Temas" y su acordeón de 3
  opciones (FR-004 a FR-009).
- **Al activarse la fila "Temas"**: alterna `isThemesExpanded`;
  expandido, muestra debajo (dentro del mismo menú, sin abrir nada
  aparte) las tres opciones: "Default cálido", "Claro", "Legacy".
- **Al elegir una opción de tema**: llama a `setTheme(nombre)` (de
  `useThemePreference`), lo que persiste la elección y actualiza
  `data-theme` en `<html>` de inmediato (FR-005, FR-010).
- **Indicador de selección**: la opción cuyo `ThemeName` coincide con el
  valor actual de `useThemePreference()` se marca visualmente como
  activa (ej. ícono `Check`, FR-006).
- **No cierra el menú automáticamente** al elegir un tema — el usuario
  puede seguir viendo cuál quedó marcado como activo antes de cerrar el
  menú él mismo (click afuera/Escape, gestionado por `SettingsFab`).

## Casos borde cubiertos por el contrato

- Abrir el menú, expandir "Temas", y tocar afuera sin elegir ninguna
  opción → el menú se cierra, el tema activo no cambia.
- Elegir el mismo tema que ya está activo → no debe romper nada ni
  duplicar el atributo `data-theme` (idempotente: `setTheme('claro')`
  cuando ya es `'claro'` dos veces seguidas produce el mismo resultado
  que una sola vez).
- Viewport móvil (~390px, Principio V): el botón y el menú desplegado
  deben leerse completos sin salirse de la pantalla ni superponerse de
  forma que tape texto.

## Testing de este contrato

- `SettingsFab` cerrado por defecto; al tocarlo, aparece el menú con
  "Temas" visible.
- Tocar "Temas" expande las 3 opciones; volver a tocarlo las colapsa.
- Elegir "Claro"/"Legacy"/"Default cálido" marca esa opción como activa
  y refleja el cambio en `document.documentElement.dataset.theme`
  (`'claro'`, `'legacy'`, o ausente/`'default'` respectivamente).
- Cerrar con Escape o click afuera no cambia el tema activo.
- El botón y sus opciones son operables por teclado (foco visible,
  Enter/Space).
