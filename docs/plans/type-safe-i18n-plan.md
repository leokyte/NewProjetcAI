# Type-Safe i18n Implementation Plan

## Problem Statement

Currently, the codebase uses `react-native-i18n` with string-based translation keys:

```javascript
i18n.t('terms.that.do.not.exist') // No compile-time error!
```

This allows referencing non-existent translation keys, leading to:
- Runtime errors or missing text
- Difficult debugging
- No IDE autocomplete for translation keys

## Current Setup

- **Library:** `react-native-i18n`
- **Translation files:** JavaScript objects in `src/i18n/langs/`
  - `en.js` (English - primary)
  - `pt_BR.js` (Portuguese - Brazil)
  - `es.js` (Spanish)
  - `es_ES.js` (Spanish - Spain)
- **Structure:** Deeply nested objects with dot-notation access
- **Size:** ~46k tokens (very large translation file)
- **Key advantage:** All i18n usage imports from centralized `src/i18n/i18n.js` module

This centralized import pattern means migration only requires changing the central module - the rest of the codebase will follow automatically.

## Approaches Analyzed

### 1. TypeScript Type Generation

Generate types from translation files automatically.

```typescript
// Generated types from en.js
type TranslationKeys =
  | 'kyteStoreURL'
  | 'onboarding.signUpFree'
  | 'onboarding.screen1.title'
  | 'onboarding.screen1.subtitle'
  // ... all keys

// Typed wrapper
function t(key: TranslationKeys, options?: object): string {
  return I18n.t(key, options);
}
```

| Pros | Cons |
|------|------|
| Compile-time checking | Requires generation script |
| IDE autocomplete | Need to keep types in sync |
| Works with existing library | Build step required |
| Minimal migration effort | |

**Implementation Steps:**
1. Convert `en.js` to `en.ts`
2. Create a script to recursively extract all keys as a union type
3. Create a typed `t()` wrapper function
4. Add generation script to build process
5. Update imports across codebase

---

### 2. Template Literal Types (Pure TypeScript)

Use TypeScript's recursive template literal types to infer keys from the translation object.

```typescript
type DeepKeys<T, Prefix extends string = ""> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? DeepKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
      : never
    }[keyof T]
  : never;

type TranslationKeys = DeepKeys<typeof en>;
// Automatically: 'onboarding.signUpFree' | 'onboarding.screen1.title' | ...
```

| Pros | Cons |
|------|------|
| No code generation | TS performance issues with large objects |
| Pure TypeScript | May hit recursion limits |
| Automatic type updates | Complex type definitions |

**Concern:** Given the translation file is ~46k tokens, this approach may cause significant TypeScript performance degradation.

---

### 3. Migrate to i18next (Modern Standard) ✅ SELECTED

`i18next` + `react-i18next` has built-in TypeScript support with module augmentation.

```typescript
// i18next.d.ts
import 'i18next';
import en from './langs/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}

// Usage - fully typed!
const { t } = useTranslation();
t('onboarding.screen1.title'); // ✓ Valid
t('does.not.exist');           // ✗ TypeScript error
```

| Pros | Cons |
|------|------|
| Official TypeScript support | Library migration required |
| Interpolation type safety | Breaking changes |
| React hooks (`useTranslation`) | Learning curve |
| Namespacing support | Testing updates needed |
| Active community | |

**Implementation Steps:**
1. Install `i18next`, `react-i18next`, `i18next-react-native-language-detector`
2. Convert translation files to TypeScript
3. Create type declaration file
4. Create i18next configuration
5. Migrate all `I18n.t()` calls to `useTranslation()` or `i18next.t()`
6. Update tests

---

### 4. Constants Object Approach (Simple)

Create a constants object that mirrors the translation structure.

```typescript
export const I18N = {
  onboarding: {
    signUpFree: 'onboarding.signUpFree',
    screen1: {
      title: 'onboarding.screen1.title',
    }
  }
} as const;

// Usage
i18n.t(I18N.onboarding.screen1.title);
```

| Pros | Cons |
|------|------|
| Simple to implement | Key duplication |
| IDE autocomplete | Manual maintenance |
| Works with any library | Can get out of sync |
| No build step | Verbose usage |

---

### 5. ESLint Plugin (Static Analysis)

Use `eslint-plugin-i18n-json` or create a custom rule to validate keys at lint time.

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['i18n-json'],
  rules: {
    'i18n-json/valid-message-syntax': 'error',
    'i18n-json/identical-keys': ['error', {
      filePath: './src/i18n/langs/en.js'
    }]
  }
};
```

| Pros | Cons |
|------|------|
| Works with JS and TS | Not compile-time safety |
| Catches errors in CI | Requires ESLint setup |
| No runtime overhead | Limited IDE integration |
| Easy to add | |

---

## Recommendation

### Selected: Option 3 - Migrate to i18next/react-i18next

Given that **all i18n usage imports from the centralized `src/i18n/i18n.js` module**, migrating to `i18next` is the best choice:

**Why this approach wins:**
- **Low migration effort** - centralized imports mean we only change one file
- **Official TypeScript support** - no custom scripts or type generation needed
- **Industry standard** - i18next is the de-facto standard for React i18n
- **Built-in type safety** - module augmentation provides compile-time checking
- **Future-proof** - namespacing, interpolation types, pluralization rules
- **React Native support** - `react-i18next` works seamlessly with RN

**Migration is simpler than expected because:**
1. `src/i18n/i18n.js` is the single entry point
2. We can export a compatible API (`i18n.t()`) from the new implementation
3. No need to update every file that uses translations

---

## Implementation Plan (i18next Migration)

### Phase 1: Setup i18next

1. [ ] Install dependencies:
   - `i18next`
   - `react-i18next`
   - `@formatjs/intl-pluralrules` (polyfill if needed)
2. [ ] Convert `src/i18n/langs/en.js` to `en.ts`
3. [ ] Convert other language files to TypeScript
4. [ ] Create i18next configuration in `src/i18n/i18n.ts`

### Phase 2: Type Safety Setup

1. [ ] Create `src/i18n/i18n.d.ts` with module augmentation:
   ```typescript
   import 'i18next';
   import en from './langs/en';

   declare module 'i18next' {
     interface CustomTypeOptions {
       defaultNS: 'translation';
       resources: {
         translation: typeof en;
       };
     }
   }
   ```
2. [ ] Verify TypeScript catches invalid keys
3. [ ] Test IDE autocomplete works

### Phase 3: API Compatibility Layer

1. [ ] Export compatible API from `src/i18n/i18n.ts`:
   ```typescript
   import i18next from 'i18next';

   // Backward compatible export
   export default {
     t: i18next.t.bind(i18next),
     locale: i18next.language,
     // ... other methods used in codebase
   };

   export function getLocale() {
     return i18next.language?.substring(0, 2) ?? 'en';
   }
   ```
2. [ ] Ensure existing `import I18n from '@/i18n'` calls work unchanged

### Phase 4: Validation & Cleanup

1. [ ] Run TypeScript build - fix any type errors (invalid keys!)
2. [ ] Run existing tests
3. [ ] Test language switching
4. [ ] Test fallback behavior
5. [ ] Remove `react-native-i18n` dependency

### Phase 5: Progressive Enhancement (Optional)

1. [ ] Gradually adopt `useTranslation()` hook in new components
2. [ ] Add namespacing if translation file becomes unwieldy
3. [ ] Add interpolation type safety for dynamic values

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/i18n/i18n.ts` | Rewrite | New i18next configuration with compatible API |
| `src/i18n/i18n.d.ts` | Create | TypeScript module augmentation for type safety |
| `src/i18n/langs/en.ts` | Convert | Primary translation file to TypeScript |
| `src/i18n/langs/pt_BR.ts` | Convert | Portuguese translations to TypeScript |
| `src/i18n/langs/es.ts` | Convert | Spanish translations to TypeScript |
| `src/i18n/langs/es_ES.ts` | Convert | Spanish (Spain) translations to TypeScript |
| `package.json` | Modify | Add i18next deps, remove react-native-i18n |

---

## Decision

**Selected approach:** Migrate to i18next/react-i18next

**Rationale:**
- Centralized imports make migration low-effort
- Official TypeScript support eliminates need for custom tooling
- Industry standard with active maintenance
- Compatible API layer means minimal changes to existing code
- Future benefits: hooks, namespacing, interpolation types

---

## References

- [i18next TypeScript Guide](https://www.i18next.com/overview/typescript)
- [react-i18next Documentation](https://react.i18next.com/)
- [react-i18next with React Native](https://react.i18next.com/latest/using-with-hooks)
- [i18next TypeScript Resources Declaration](https://www.i18next.com/overview/typescript#create-a-declaration-file)
- [TypeScript Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [eslint-plugin-i18n-json](https://github.com/godaddy/eslint-plugin-i18n-json)
