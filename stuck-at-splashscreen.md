# RN 0.81 splash hang (Dec 16)

## Snapshot
- Release-style builds only (Android + iOS); debug/Metro works.
- App stays on splash, no crash, no `ReactNativeJS` logs → JS never boots.
- Hermes must stay on; release bundle is present at `android/app/src/main/assets/index.android.bundle`.
- Android: OneSignal “missing resource id” warning is gone after `OneSignalRestoreGuard.kt`, but the hang remains.
- RelDev (release config with dev support) runs fine; the hang is specific to full release builds using prod env/bundles.

## What likely happened
- During the RN 0.81 upgrade we removed the old OneSignal native extender/receiver. Restored notifications used to crash release (`No package ID 6a…`). The new native guard removed that warning, so the current blocker is probably a JS init failure that is hidden in release (no dev support).

## How to surface the real error quickly
- **relDev + Metro (preferred):**  
  ```
  adb reverse tcp:8081 tcp:8081
  yarn start --reset-cache
  ENVFILE=.env.stage ./gradlew :app:installPosRelDev
  adb logcat -v time ReactNative:V ReactNativeJS:V OneSignal:V Hermes:V SoLoader:V AndroidRuntime:E com.kyte:V "*:S"
  ```
  Launch the app and read the first JS/Hermes error.
- **If avoiding relDev:** temporarily log JS exceptions in release (wrap `global.ErrorUtils`/`setJSExceptionHandler` to `Log.e`/`console.error` during startup) so fatal JS shows in logcat/Console.
- **Minify off once:** build release with minification disabled (`minifyEnabled false` or `--minify false`) to get readable stacks and check if minifier is the trigger.
- **iOS:** run Release scheme and attach Hermes inspector/Console to capture the first JS exception.

## Other levers (use sparingly)
- Force `getUseDeveloperSupport()` true on a release build just to attach the RN console, then revert.
- Short-term bisect: temporarily stub heavy startup integrations (OneSignal/Firebase init) or swap Hermes→JSC only to confirm scope, then undo.

## Repro reminders (historical)
- Previous release logs showed restored OneSignal notifications and `No package ID 6a…` before RN boot; that symptom is gone after the native guard.
- Debug builds worked because Android did not replay restored notifications and dev support prints JS errors.

## Open actions
- Capture the first JS error during release boot (relDev or temporary logging).
- If it points to env/feature-flag differences, align `.env.prod` vs `.env.stage` at startup.
- If it points to a library/Hermes incompatibility, patch or gate that code path for release.
