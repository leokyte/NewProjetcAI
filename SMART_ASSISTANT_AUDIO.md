## Smart Assistant audio regression (RN 0.81)

### Original problem
- Mic/record button did nothing on the Smart Assistant input.

### Findings
- **UI overlay:** Kyte-agent `Tooltip` around the ChatInput was intercepting touches; forcing `isDisabled={false}` made the input/mic clickable again.
- **Permissions crash:** Once clickable, mic requests threw `E_INVALID_ACTIVITY` from `react-native-permissions`/`PermissionsAndroid` (`currentActivity` was null). Cause: RN instance was preloaded from `Application` (`loadReactNative`), so the JS host had no attached `ReactActivity`.
- **Bridgeless startup crash:** After removing preload, app crashed on launch: `libreact_featureflagsjni.so` not found. The prebuilt `react-android` AAR lacks this bridgeless JNI lib.
- **Why removing preload mattered:** We dropped preloading to attach RN to a real Activity (fixes mic permission). That exposed the missing-`.so` bridgeless path because RN now boots through `ReactActivity` instead of the preloaded host.

### Changes applied
- Removed RN preload (`loadReactNative`) from `MainApplication.onCreate`; kept SoLoader init.
- Swapped Android mic permission path in `useAudioRecorder` to `PermissionsAndroid` (iOS still uses `react-native-permissions`).
- Applied RN Gradle plugin and removed explicit `implementation("com.facebook.react:react-android")`.

### Why the bridgeless crash persists
- `newArchEnabled=true` means RN 0.81 boots bridgeless by default and expects `libreact_featureflagsjni.so`.
- Even after removing the direct dependency, Gradle still resolves `com.facebook.react:react-android:0.81.5` transitively because `settings.gradle` does **not** include the RN composite build (`includeBuild("../node_modules/react-native")`). So we keep using the Maven AAR that doesn’t ship the bridgeless `.so`.
- Result: app dies at startup loading `libreact_featureflagsjni.so`.

### Outstanding issues & solutions
1) **Bridgeless crash (`libreact_featureflagsjni.so` missing)**
   - Solution A (preferred): Build RN from source via the RN Gradle plugin + composite build. Add `includeBuild("../node_modules/react-native")` (and codegen if needed) in `settings.gradle`, then clean/rebuild so ReactAndroid produces and packages the bridgeless `.so`. Verify `libreact_featureflagsjni.so` under `android/app/build/intermediates/merged_native_libs`.
   - Solution B (artifact swap): Point to a `react-android` artifact that already contains `libreact_featureflagsjni.so` (e.g., nightly) instead of the 0.81.5 AAR.
   - Solution B (temporary): Disable bridgeless (keep new arch) until the library is packaged.

2) **Mic permission crash (`E_INVALID_ACTIVITY`)**
   - Root cause: RN host started without an Activity; fixed by not preloading RN in `Application`.
   - If it persists: request mic permission from a native module using the real `ReactActivity`, or ensure `currentActivity` is attached on host resume.

3) **UI touch blockage**
   - Tooltip wrapper can block input; disable/hide tooltip when not visible or set `pointerEvents="none"` when disabled.

### Next steps to verify
1) Clean native build/install (`cd android && ./gradlew clean installPosDebug`) to ensure RN native libs (incl. `libreact_featureflagsjni.so`) are packaged.
2) Launch app:
   - Confirm no bridgeless crash.
   - Tap mic: expect RECORD_AUDIO prompt and `startRecording` logs.
3) If bridgeless still crashes, either disable bridgeless temporarily or vendor the missing `.so` by building ReactAndroid locally.

### Current resolution
- **RN load/bootstrap:** `MainApplication` now calls `ReactNativeApplicationEntryPoint.loadReactNative(this)` (template behavior) so SoLoader registers the merged-SO mapping and new-arch/bridgeless flags before ReactHost starts. This resolves the `libreact_featureflagsjni.so` lookup path while keeping bridgeless enabled.
- **Permission flow:** Preloading was removed; permissions are requested from an attached `ReactActivity` (`PermissionsAndroid` on Android) so `currentActivity` is non-null.
- **Autolinking:** Manual `RCTLocalePackage` removal avoids duplicate-module crashes; rely on autolinked packages.
- **Build config:** `newArchEnabled=true`, Hermes on, composite build for RN/codegen enabled in `settings.gradle` (dependency substitution to build ReactAndroid from source).
