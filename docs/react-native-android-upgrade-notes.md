## React Native Android Upgrade (0.67.5 → 0.82.0)

This document captures every intentional Android-side change that has been made so far while upgrading the app from React Native 0.67.5 to 0.82.0. It is meant to give future contributors enough context to continue the upgrade without having to rediscover decisions or debug repeat issues.

---

### Platform Requirements

- **Node.js**  
  React Native 0.82 requires **Node ≥ 20.19.4**. Our CI/local setup previously used Node 18; all installs now need the newer runtime.

- **Android tooling**  
  - Android Gradle Plugin 8.x (pulled in with RN 0.82) and NDK r27 removed the `gold` linker. We switch to the LLVM `lld` linker explicitly (see `android/app/build.gradle`).
  - Build outputs now include ABI splits by default. The React Native CLI looks for predictable APK filenames; we customise the filenames to include ABI and variant so the CLI can locate them.

---

### High-level File Overview (matching the linked commit diff)

| File | Rationale |
| --- | --- |
| `android/app/src/main/java/com/kyte/MainApplication.kt` <br> `android/app/src/main/java/com/kyte/MainActivity.kt` | Migrated to the RN 0.82 Kotlin templates. Uses `ReactHost` / `loadReactNative` entry point and is compatible with the new architecture defaults. |
| `android/app/src/main/jni/CMakeLists.txt` <br> `android/app/src/main/jni/OnLoad.cpp` | Local copy of the RN 0.82 native bootstrap. Skips IPO/LTO probe (avoids gold linker checks) and wires TurboModules/Fabric with the new autolinking pipeline. |
| `android/app/build.gradle` | Biggest set of changes: <ul><li>Defines `reactNativeDir`, `codegenDir`, `cliFile`.</li><li>Points `externalNativeBuild` to the new CMake file.</li><li>Forces `-DANDROID_LD=lld`.</li><li>Removes the legacy `newArchEnabled` flag.</li><li>Renames APK artefacts to the `app-<abi>-<flavor-buildType>.apk` pattern so the CLI can install the right split.</li></ul> |
| `android/codegen/<package>/jni/*` | Stub codegen targets for **react-native-config** and **@microsoft/react-native-clarity** so CMake has concrete libraries even when upstream packages skip emitting JNI sources. Each target:<ul><li>Includes React Common headers (`${REACT_NATIVE_DIR}/ReactCommon`).</li><li>Links against `ReactAndroid::reactnative`, `ReactAndroid::jsi`, and, where required, `fbjni`.</li></ul> |
| `react-native.config.js` | Adds dependency-specific `cmakeListsPath` overrides pointing to the stubs above. Keeps a small `Array.prototype.toReversed` polyfill so Metro still works on Node < 20 if needed. |
| `android/gradle/*`, `android/settings.gradle`, wrapper scripts | Pulled from the RN 0.82 template. Wrapper version aligns with the upgraded Gradle/AGP requirements. |
| `metro.config.js` | Updated to the new `@react-native/metro-config` helper and block-list API (private path changed). |
| `package.json` | Upgrades core dependencies/devDependencies (React 19, RN 0.82, CLI 20, etc.), removes `jetify` postinstall, and sets the `android` script to target the POS debug variant with the correct main activity. Node/npm engine requirements updated to match RN’s minimums. |
| `tsconfig.json` | Pointed to `@react-native/typescript-config` defaults; redundant options removed to match the new template. |
| `package.json` <br> `ios/Podfile` <br> `src/components/common/KyteBarCode.js` | Replaced the unmaintained `react-native-camera` dependency with `react-native-camera-kit`, updated the iOS manual framework hook, and rewrote `KyteBarCode` to render the new scanner component. This restores barcode scanning when Fabric/new architecture is enabled (the old module crashed because `UIManagerModule` is absent). The wrapper now requests camera permission via `react-native-permissions` before mounting the scanner. |
| Various JS files | Minor lint/format fixes (e.g., `UrlCopyPage.js`, `SaleDetail.js`, `babel.config.js` adjust formatting/exports). |

---

### Patch-package Status

Patch-package currently carries a fix for `react-native-image-gallery` (see `patches/react-native-image-gallery+2.1.5.patch`). React Native 0.82 no longer exposes `View.propTypes`/`ViewPropTypes`, so the library now imports the replacements from `deprecated-react-native-prop-types`. Keep the patch (and the new `deprecated-react-native-prop-types` dependency) until we migrate away from this gallery or upstream ships a compatible release.
- `color` no longer needs a local patch. We removed `patches/color+3.2.1.patch` and `patches/color@4.2.3.patch` after seeing the default-export shim crash TurboModule bootstrap with `Color.prototype` undefined.
- `react-native-bluetooth-classic` replaces the deprecated `react-native-bluetooth-serial` fork. The new library works with RN 0.81+ without patch-package, so we removed `patches/react-native-bluetooth-serial+0.1.9.patch` and the legacy `RCTBluetoothSerial` shim.
- Additional legacy-prop patches: `react-native-elements@0.19.0`, `react-native-snap-carousel@3.9.1`, `react-native-progress-circle@2.1.0`, `react-native-circular-progress@1.3.3`, `react-native-emoji@1.3.1`, and `@react-native-community/masked-view@0.1.11` now import prop types from `deprecated-react-native-prop-types`. These patches prevent runtime crashes on RN 0.82 without relying on global polyfills.
- `@kyteapp/react-native-locale@0.1.1` points at our Azure artifact (forked from the legacy `react-native-locale`). The fork already checks both `NativeModules.Locale` and `NativeModules.RCTLocale`, so we dropped the old patch-package shim. Keep an eye on this dependency until we migrate to an internal helper.

- **Nitro modules**: Autolinking now targets the code-generated JNI sources emitted under `node_modules/react-native-nitro-modules/android/build/generated/source/codegen/jni`, so the old stub in `android/codegen/react-native-nitro-modules/jni` is gone. We removed the `cmakeListsPath` override from `react-native.config.js`, and `android/app/build.gradle` adds `:react-native-nitro-modules` to the `codegenProjectsRequiringPreGeneration` list so Gradle runs each dependency’s `generateCodegenArtifactsFromSchema` task before any `configureCMake*/externalNativeBuild*` step.
- **Upgrade first**: Before adding or keeping a `patch-package` entry, check for newer upstream releases. The Realm crash we saw on RN 0.82 disappeared once we upgraded from `realm@11.0.0-rc.0` to `realm@20.2.0`, allowing us to drop the custom patch entirely.

---

### Other Notes & Known Warnings

- **Metro-dev server warning**: The unsigned Android CLI prints `Cannot start server in new windows because no terminal app was specified`. This is harmless; if you want automatic Metro start, pass `--terminal` or run `yarn start` separately.

- **Gradle deprecation warnings**: Running with `--warning-mode all` shows several 3rd-party libraries relying on deprecated APIs. These come from upstream packages; to reduce noise we would need updated library releases.

- **APK naming**: Because we set custom output filenames, keep the logic if future scripts rely on the new naming. The React Native CLI now finds `app-arm64-v8a-pos-debug.apk`, etc.

- **Firebase bootstrap**: We now initialize Firebase natively in `MainApplication.kt` (`FirebaseApp.initializeApp(this)`) before React Native loads. On the JS side, `firebaseInit()` still waits for the default app and logs the code path (native vs. fallback config) before enabling Analytics/Remote Config. The bundle-aware fallback in `src/util/env.js` remains for flavors where the google-services plugin does not provide options at runtime.

- **In-app purchases**: `react-native-iap` is upgraded to 14.x (Nitro). The library bundles its own Nitro CMake/Gradle configs, so the custom `android/codegen/react-native-iap` shim and Kotlin patch are gone. Install `react-native-nitro-modules` alongside IAP, keep the dependency autolinked, and run `pod install` after each dependency update on macOS.
- **Clarity SDK**: Migrated to `@microsoft/react-native-clarity` 4.x. The SDK now exposes a fully supported new-architecture module, so the old `android/codegen/react-native-clarity` CMake shim and Kotlin patch are no longer wired into the build. Remove the shim entirely once all environments are confirmed stable.
- **Firebase v23**: All `@react-native-firebase/*` packages are now on 23.4.x with Firebase JS SDK 12. Dynamic Links is deprecated upstream, so we removed the package and fall back to React Native's `Linking` API for attribution (`src/components/analytics/Attribution.js`, `src/integrations/Firebase-Integration.js`). Android buildscript plugins were bumped (`firebase-crashlytics-gradle` 3.0.5, `perf-plugin` 2.0.0). JS now sticks to the modular API: `src/integrations/Firebase-Integration.js` exposes `getFirebaseApp()` and wraps every module (`analytics`, `remoteConfig`, `firestore`, etc.) so we never touch the deprecated namespace, and `src/stores/actions/AuthActions.js` switches every `firebase.auth()` call (and provider statics) to the `auth()` module to silence v23’s warnings. All other codepaths import helper functions from this integration layer—there are no direct `@react-native-firebase/*` imports outside `Firebase-Integration.js`, which keeps the compat proxy contained and prevents future deprecation spam. Firestore now routes through the same helpers (`firestoreCollection`, `firestoreDoc`, `firestoreSetDoc`, `firestoreUpdateDoc`, `firestoreCreateBatch`, `firestoreServerTimestamp`), so `notificationHub`, `documentUpServerManager`, etc., never call `.collection()`/`.doc()` directly. `logError` also normalizes arbitrary inputs into real `Error` objects before forwarding them to Crashlytics, preventing “expects an instance of Error” spam when upstream callers pass strings or plain objects.
- **Realm**: Upgraded to `realm@20.2.0`, which bundles a modern JSI bootstrap compatible with RN 0.82/Hermes. The previous `RealmReactModule` crash on module install is resolved without any local patches. Realm 20 also enforces explicit relationship descriptors, so every schema now declares object properties with `{ type: 'object', objectType: '<Model>' }` (and `optional: true` where we previously stored `null`).
- **OneSignal**: Upgraded to `react-native-onesignal@5.2.13`. The integration now uses the `OneSignal` namespace helpers (`OneSignal.initialize`, `OneSignal.User.addTag/removeTag`, `OneSignal.login/logout`, `OneSignal.Notifications.addEventListener('click', ...)`) and drops the legacy default import / `setNotificationOpenedHandler` API.
- **WebView**: Upgraded to `react-native-webview@13.16.0` to pick up the TurboModule-compatible bridge. No JS changes were required, but this is now the minimum version that loads under RN 0.82.
- **Legacy prop-types**: Several third-party UI libs (`react-native-elements`, etc.) still reference `View/Text/Image.propTypes`. We patch those packages to consume `deprecated-react-native-prop-types` directly and ship a lightweight `src/polyfills/legacyPropTypes.js` that simply re-exports `ReactNative.*PropTypes` for any remaining holdouts.
- **Drawer not showing on tablets (React Navigation 7 migration)**:
  Two key changes were required for the permanent drawer to work correctly on tablets:
  1. **`defaultStatus` prop**: Added `defaultStatus={isLargeScreen ? 'open' : 'closed'}` to explicitly set the drawer's initial state. Without this, the permanent drawer wouldn't render on tablets.
  2. **Props moved to `screenOptions`**: In React Navigation 7, `drawerType` and `drawerPosition` must be in `screenOptions`, not on the Navigator directly:
  ```jsx
  // ❌ Old (doesn't work in v7)
  <Drawer.Navigator drawerType="permanent" drawerPosition="left">

  // ✅ New (required for v7)
  <Drawer.Navigator
    defaultStatus="open"
    screenOptions={{
      drawerType: 'permanent',
      drawerPosition: 'left',
    }}>
  ```
  Additionally, `DrawerNavigator` now uses `useWindowDimensions()` directly instead of `useViewport()` to avoid the race condition where `ViewportProvider` initializes with `screenWidth = 0`.
- **Navigation & bottom sheet**: Upgraded `@react-navigation/native`, `@react-navigation/drawer`, and `@react-navigation/stack` to the v6 line so we drop the legacy Reanimated 1 drawer implementation. Our custom `DrawerNavigator` wrapper now uses the v6 `screenOptions` keys and the core Animated API (`Animated`, `Easing`, `useNativeDriver: false`) for width interpolation. The product stock screen no longer depends on `@gorhom/bottom-sheet`; instead we ship a lightweight `StockTotalsSheet` (plain `Animated` + `PanResponder`) that mimics the two snap points we need without any Reanimated hooks. This keeps the UI responsive while avoiding extra compatibility shims.
- **iOS minimums**: React Native Firebase v23 requires iOS 15/Xcode 16.2+. `Podfile` and Xcode project deployment targets are set to 15.0—run `pod install` with Xcode 16.2+ after upgrading.
- **Bridgeless bootstrap (Android)**: `MainApplication` now follows the RN template by invoking `ReactNativeApplicationEntryPoint.loadReactNative(this)` instead of manual `SoLoader.init()`. This registers the merged-SO mapping (`OpenSourceMergedSoMapping`) and sets new-architecture/bridgeless flags before the host starts, preventing missing-`libreact_featureflagsjni.so` crashes when bridgeless is on. Autolinking is left intact (no manual RCTLocale).

---

### Commands that Work Today

```bash
# Install dependencies (requires Node >= 20.19.4)
yarn install --check-files

# Build & install on a specific device/emulator
yarn android --device <deviceId>
```

If Metro is not running, start it in another terminal:

```bash
npx react-native start
```

---

### JavaScript stack updates

- **React Navigation**
  Updated `@react-navigation/native`, `@react-navigation/stack`, and `@react-navigation/drawer` to the 7.x line. The new drawer relies on `react-native-drawer-layout`, so we added it (plus the shared `@react-navigation/elements` helper) to `package.json`. Our custom `DrawerNavigator` still interpolates drawer width; we now feed that value through `screenOptions.drawerStyle` since the v7 API no longer accepts the top-level `drawerStyle` prop for dynamic animated values.
  We continue to ship `src/polyfills/reanimatedCompat.js` so older third-party components that call the deprecated `useAnimatedGestureHandler` keep working alongside Reanimated 4. The shim can be removed once all consumers migrate to the new gesture APIs.
- **Tablet split-screen navigation (`NavigationIndependentTree`)**
  React Navigation 7.x removed the `independent` prop from `NavigationContainer`. Our tablet screens (`CurrentSale.tablet.js`, `Products.tablet.js`, `Receipt.tablet.js`) use split-screen layouts with multiple navigation trees per screen. The old API was:
  ```jsx
  <NavigationContainer independent>
    <SomeStack />
  </NavigationContainer>
  ```
  The new API requires wrapping with `NavigationIndependentTree`:
  ```jsx
  import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';

  <NavigationIndependentTree>
    <NavigationContainer>
      <SomeStack />
    </NavigationContainer>
  </NavigationIndependentTree>
  ```
  This fix is essential for tablet builds. Without it, React Navigation throws "Looks like you have nested a 'NavigationContainer' inside another" because it no longer silently ignores the deprecated `independent` prop—it simply doesn't recognize it, treating the nested containers as an error. Phone builds were unaffected because they don't use the `.tablet.js` variants.
- **Animated.Value completely broken in bridgeless mode**
  React Native's new architecture (bridgeless mode) freezes `Animated.Value` objects entirely. Both `setValue()` AND `Animated.timing().start()` throw: "You attempted to set the key `_value`/`_animation` with the value `X` on an object that is meant to be immutable and has been frozen."

  **Affected:** `DrawerNavigator.js` refactored to remove all Animated API usage.

  **Solution:** Replace `Animated.Value` with state-driven values or use Reanimated (which is designed for new architecture):

  **Old pattern (crashes in bridgeless):**
  ```javascript
  const animValue = React.useRef(new Animated.Value(0)).current;
  animValue.setValue(1);  // ❌ Crashes
  Animated.timing(animValue, { toValue: 1 }).start();  // ❌ Also crashes
  ```

  **New pattern (state-driven, works in bridgeless):**
  ```javascript
  const [value, setValue] = React.useState(0);
  const width = React.useMemo(() => value ? 280 : 60, [value]);
  // Use width directly in styles
  ```

  **Alternative (Reanimated, recommended for animations):**
  ```javascript
  import { useSharedValue, withTiming } from 'react-native-reanimated';
  const animValue = useSharedValue(0);
  animValue.value = withTiming(1);  // ✅ Works in bridgeless
  ```

  Other files that may need this fix if they crash: `StockTotalsSheet.js`, `CouponListItem.tsx`, `SortableFlatList.js`, `VariantChooseMainExample.tsx`, `StorePrinter.js`, `LoadingBarAnimation.tsx`.
- **Tab view**  
  `react-native-tab-view` was bumped from 2.16.0 to 4.2.0 and now depends on `react-native-pager-view@6.9.1`. The newer tab view drops the Reanimated 1-based pager (which crashed with `Clock.prototype` undefined once we moved to Reanimated 4) and proxies to `PagerView`. Installing the native pager requires a clean rebuild (`./gradlew clean && yarn android`, plus `pod install` on iOS) so the `RNCViewPager` manager is registered.
- **Intercom SDK**  
  Upgraded `@intercom/intercom-react-native` from 6.2.0 to 9.3.2. The new bridge pulls in Intercom Android SDK/UI 17.3.0 (Compose-based) which fixes the missing `LocalSoftwareKeyboardController` crash we hit after the RN upgrade. To keep those classes in our APK we now declare the Compose BOM and core UI artifacts directly in `android/app/build.gradle`, and bumped `firebase-messaging` to 24.1.2 to match Intercom’s requirements. The manifest needed a `tools:replace="android:maxSdkVersion"` hint on the `WRITE_EXTERNAL_STORAGE` permission because Intercom’s manifest pins the value differently. On the JS side the legacy `Intercom.addEventListener` helper was removed upstream, so `AppContainer` now uses `Intercom.bootstrapEventListeners()` plus `NativeEventEmitter`/`IntercomEvents.IntercomUnreadCountDidChange` to keep the unread badge in sync.

---

### Summary

- Android now builds with the New Architecture defaults introduced in RN 0.82.  
- The custom CMake bridge (`android/app/src/main/jni/CMakeLists.txt`) and the `react-native-config` codegen shim remain essential for our current dependency set.  
- Patch-package currently carries the `react-native-image-gallery` shim described above.  
- Node 20 is mandatory for all local and CI jobs.

Keep this document updated if further issues or upstream fixes arise while finishing the upgrade.

For a detailed diff generated by the community, use the Upgrade Helper:
https://react-native-community.github.io/upgrade-helper/?from=0.67.5&to=0.82.0
