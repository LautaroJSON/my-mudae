# Contrato: `ProfilesContext` / `useProfiles()`

**Módulo**: `presentation/context/ProfilesContext.tsx`
**Tipo de contrato**: contrato de UI interno — es la única API que los
componentes de `presentation/components/` pueden usar para leer o mutar
el estado de perfiles/harems. Ningún componente accede a
`application/` ni a `infrastructure/` directamente.

## Hook expuesto

```ts
function useProfiles(): {
  profiles: Profile[];
  activeProfile: Profile | undefined;
  createProfileFromPaste: (rawText: string) => { ok: true } | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' };
  renameProfile: (profileId: string, name: string) => void;
  deleteProfile: (profileId: string) => void;
  activateProfile: (profileId: string) => void;
};
```

## Garantías que expone (derivadas de los FR de `spec.md`)

- `profiles` y `activeProfile` siempre reflejan el último estado
  persistido; tras cualquiera de las acciones, ambos valores se
  actualizan de forma síncrona para el próximo render (no hay estado
  optimista que pueda desincronizarse).
- `createProfileFromPaste`:
  - En éxito, agrega el nuevo `Profile` a `profiles` y lo marca como
    `isActive`, desactivando el que estuviera activo antes (FR-002,
    FR-008, FR-014).
  - En falla, no modifica `profiles` en absoluto (FR-007, SC-006).
- `activateProfile(id)`: pone `isActive: true` en el perfil `id` y
  `isActive: false` en cualquier otro (FR-013).
- `deleteProfile(id)`: quita ese `Profile` de `profiles`; si era el
  activo y quedan otros, activa automáticamente otro (FR-015); si no
  queda ninguno, `activeProfile` pasa a `undefined` (FR-010).
- `renameProfile(id, name)`: solo cambia `name`; no afecta `isActive` ni
  el `harem` (FR-009).

## Consumo esperado desde `presentation/components/`

- La pantalla inicial (`PasteHaremScreen`) se muestra cuando
  `profiles.length === 0`; llama a `createProfileFromPaste` y muestra el
  error de la rama `ok: false` sin crear nada (FR-001, FR-007).
- `ProfileSwitcher`/`ProfileCard` listan `profiles`, resaltan cuál calza
  con `activeProfile?.id`, y llaman a `activateProfile`/`renameProfile`/
  `deleteProfile`.
- `HaremView` (y sus `SeriesGroup`/`CharacterCard`) solo leen
  `activeProfile?.harem`; nunca leen el harem de un perfil inactivo
  (FR-024).

## Testing de este contrato

- Se testea con React Testing Library envolviendo un `ProfilesProvider`
  configurado con un `InMemoryProfileRepository` (ver
  `profile-repository.md`), simulando la secuencia completa: 0 perfiles →
  pegar el harem de ejemplo → ver `activeProfile` poblado → pegar un
  segundo harem → verificar que el nuevo es el activo → eliminar el
  activo → verificar que se activa el restante.
