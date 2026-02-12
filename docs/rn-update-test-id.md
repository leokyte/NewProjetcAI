# RN 0.81: TestID/Accessibility Audit Plan

Context: After upgrading to React Native 0.81 and React Navigation 7, Appium can no longer find some elements by `content-desc`. The new navigation components place the touchable inside an outer `View`, so `accessible`/`accessibilityLabel` on the wrapper no longer reach the actual pressable. Our helper `generateTestID` still returns `{ accessible: true, accessibilityLabel: testID }` on Android, which can mask descendants when applied to non-pressable wrappers. Several spots also pass the helper object into props that expect a string.

## Hotspots from code audit
- Drawer (known): `src/components/common/DrawerContent.js` spreads `generateTestID(routeName)` into `DrawerItem`, which forwards it to the outer wrapper instead of the inner `PlatformPressable`.
- String-only props receiving an object:
  - `src/components/products/quick-view/ProductQuickView.js`: `testID: generateTestID('stock-pdck')` and `testID: generateTestID('add-nck')`.
  - `src/components/products/variants/AddNewVariationOptionModal.tsx`: `testID={generateTestID('add-new-option-btn')}`.
  - `src/components/products/variants/wizard/VariantsCreationSetup.tsx`: multiple `testID={generateTestID(...)}`.
  - `src/components/products/variants/wizard/VariantOptionsCreate.tsx`: `testID={generateTestID('name-first-vt')}`.
  - `src/components/customers/customer/CustomerSave.js`: `testID={generateTestID(String(field.id))}`.
- Wrapper components that drop `testProps` on a non-pressable container (found in `@kyteapp` libs):
  - `@kyteapp/kyte-ui-components/src/packages/utilities/kyte-box/KyteBox.js` spreads onto a `View`.
  - `@kyteapp/kyte-ui-components/src/packages/buttons/kyte-bottom-bar/KyteBottomBar.js` spreads `testProps` to `KyteBox` (not the button).
  - `@kyteapp/kyte-ui-components/src/packages/buttons/kyte-base-button/KyteBaseButton.js` and `kyte-button-v2` apply `testProps` to the `Pressable` already (good), but callers sometimes pass wrapper-level `testProps` via BottomBar.
  - `@kyteapp/kyte-ui-components/src/packages/modals/kyte-toast/KyteToast.js` spreads `testProps` to `KyteBaseButton` (safe as long as helper returns correct props).
  - No additional `testID`/`testProps` usage was found in other `@kyteapp` packages scanned (`kyte-dashboard` did not surface testIDs).

## Implementation plan
1) Update `generateTestID` to align with RN 0.81:
   - Return `{ testID, accessibilityLabel: testID }` on Android, **omit `accessible`** to avoid hiding children.
   - Keep `{ testID }` on iOS. Consider an optional flag for `accessible` when explicitly needed.

2) Navigation components:
   - In `DrawerContent`, pass `testID`/`accessibilityLabel` directly to the pressable (`DrawerItem`’s `PlatformPressable`) via explicit props instead of spreading on the wrapper. Apply the same pattern to any future bottom/tab navigators.

3) Fix string-only `testID` usages:
   - Replace `testID={generateTestID(...)}` with spreading (`{...generateTestID(...)}`) or pass the raw string where the API expects a string in:
     - `src/components/products/quick-view/ProductQuickView.js`
     - `src/components/products/variants/AddNewVariationOptionModal.tsx`
     - `src/components/products/variants/wizard/VariantsCreationSetup.tsx`
     - `src/components/products/variants/wizard/VariantOptionsCreate.tsx`
     - `src/components/customers/customer/CustomerSave.js`

4) Wrapper components:
   - Adjust Kyte UI components so `testProps` land on the actual pressable:
     - Add a `testPropsPressable` (or similar) prop to `KyteBottomBar` / `KyteBaseButton` so callers can target the touchable.
     - Optionally allow `KyteBox` to pass `testProps` to a child when used as a button wrapper, or document not to use `testProps` on it.
   - Sweep call sites that pass `testProps` to non-interactive wrappers and move them to the actual `Touchable/Pressable`.

5) Verification:
   - Re-run E2E selectors for Drawer “Products” and the audited screens (variant modals, CustomerSave, ProductQuickView).
   - Spot check with the Accessibility Inspector/`adb shell uiautomator dump` that `content-desc` appears on the pressable nodes.
   - Keep an eye on TalkBack/VoiceOver to ensure removing `accessible` does not regress accessibility elsewhere.

6) Rollout:
   - Land helper change + navigation fix together.
   - Follow up with component-level fixes and a small E2E smoke (drawer navigation, product quick view, variant creation, customer save).
